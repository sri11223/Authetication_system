const User = require('../models/User');
const { TOKEN_TYPES } = require('../models/Token');
const { ActivityLog, ACTIVITY_TYPES } = require('../models/ActivityLog');
const { createActionToken, consumeActionToken } = require('./token.service');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendSecurityAlert,
  sendAccountLockedEmail,
} = require('./email.service');
const sessionService = require('./session.service');
const ApiError = require('../utils/ApiError');

/**
 * Registers a new user, sends verification email.
 */
const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const user = await User.create({ name, email, password });

  // Generate verification token and send email
  const verificationToken = await createActionToken(user._id, TOKEN_TYPES.EMAIL_VERIFICATION);
  await sendVerificationEmail(user.email, user.name, verificationToken);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    },
  };
};

/**
 * Verifies user email using the provided token.
 */
const verifyEmail = async (rawToken) => {
  const tokenDoc = await consumeActionToken(rawToken, TOKEN_TYPES.EMAIL_VERIFICATION);

  if (!tokenDoc) {
    throw ApiError.badRequest('Invalid or expired verification token');
  }

  const user = await User.findByIdAndUpdate(
    tokenDoc.userId,
    { $set: { isEmailVerified: true } },
    { new: true }
  );

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Log email verification
  await ActivityLog.createLog(
    user._id,
    ACTIVITY_TYPES.EMAIL_VERIFIED,
    'Email address verified successfully',
    null
  );

  return { message: 'Email verified successfully' };
};

/**
 * Authenticates a user and creates a session.
 */
const login = async ({ email, password }, req) => {
  // Find user with password field included
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Check if account is locked
  if (user.isAccountLocked()) {
    const unlockTime = new Date(user.lockUntil).toLocaleString();
    throw ApiError.forbidden(
      `Account is temporarily locked due to multiple failed login attempts. Please try again after ${unlockTime}`
    );
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    // Increment failed login attempts
    await user.incLoginAttempts();
    
    // Reload user to check if account is now locked
    const updatedUser = await User.findById(user._id);
    if (updatedUser.isAccountLocked() && updatedUser.emailNotifications) {
      const unlockTime = new Date(updatedUser.lockUntil).toLocaleString();
      await sendAccountLockedEmail(updatedUser.email, updatedUser.name, unlockTime);
    }

    throw ApiError.unauthorized('Invalid email or password');
  }

  // Reset failed login attempts on successful login
  if (user.failedLoginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  if (!user.isEmailVerified) {
    throw ApiError.forbidden('Please verify your email before logging in');
  }

  // Create session with race-condition protection
  const { session, tokens } = await sessionService.createSession(user._id, req);

  // Log login activity
  await ActivityLog.createLog(
    user._id,
    ACTIVITY_TYPES.LOGIN,
    `Logged in from ${req.useragent?.browser || 'Unknown'} on ${req.useragent?.os || 'Unknown'}`,
    req,
    { sessionId: session._id }
  );

  // Send security alert email if notifications enabled
  if (user.emailNotifications) {
    const deviceInfo = `${req.useragent?.browser || 'Unknown'} on ${req.useragent?.os || 'Unknown'}`;
    const ip = req.clientIp || req.ip || 'Unknown';
    await sendSecurityAlert(
      user.email,
      user.name,
      'New Login Detected',
      ip,
      deviceInfo,
      `${process.env.CLIENT_URL || ''}/sessions`
    );
  }

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    },
    tokens,
    sessionId: session._id,
  };
};

/**
 * Resends email verification link.
 */
const resendVerification = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal whether the email exists
    return { message: 'If the email exists, a verification link has been sent' };
  }

  if (user.isEmailVerified) {
    throw ApiError.badRequest('Email is already verified');
  }

  const verificationToken = await createActionToken(user._id, TOKEN_TYPES.EMAIL_VERIFICATION);
  await sendVerificationEmail(user.email, user.name, verificationToken);

  return { message: 'If the email exists, a verification link has been sent' };
};

/**
 * Initiates the forgot password flow.
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  // Always return success to prevent email enumeration
  if (!user) {
    return { message: 'If the email exists, a password reset link has been sent' };
  }

  const resetToken = await createActionToken(user._id, TOKEN_TYPES.PASSWORD_RESET);
  await sendPasswordResetEmail(user.email, user.name, resetToken);

  return { message: 'If the email exists, a password reset link has been sent' };
};

/**
 * Resets the user's password and invalidates all sessions.
 */
const resetPassword = async (rawToken, newPassword) => {
  const tokenDoc = await consumeActionToken(rawToken, TOKEN_TYPES.PASSWORD_RESET);

  if (!tokenDoc) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  const user = await User.findById(tokenDoc.userId).select('+password');
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  user.password = newPassword;
  await user.save();

  // Invalidate ALL active sessions (security requirement)
  await sessionService.revokeAllSessions(user._id);

  // Log password reset
  await ActivityLog.createLog(
    user._id,
    ACTIVITY_TYPES.PASSWORD_RESET,
    'Password reset via email link',
    null
  );

  // Send security alert
  const updatedUser = await User.findById(user._id);
  if (updatedUser.emailNotifications) {
    await sendSecurityAlert(
      updatedUser.email,
      updatedUser.name,
      'Password Reset',
      null,
      null,
      `${process.env.CLIENT_URL || ''}/security`
    );
  }

  return { message: 'Password reset successfully. Please log in with your new password' };
};

/**
 * Logs out from current session.
 */
const logout = async (sessionId, userId, req) => {
  await sessionService.revokeSession(sessionId, userId);
  
  // Log logout activity
  await ActivityLog.createLog(
    userId,
    ACTIVITY_TYPES.LOGOUT,
    'Logged out from current device',
    req
  );

  return { message: 'Logged out successfully' };
};

/**
 * Logs out from all sessions.
 */
const logoutAll = async (userId, req) => {
  await sessionService.revokeAllSessions(userId);
  
  // Log logout all activity
  await ActivityLog.createLog(
    userId,
    ACTIVITY_TYPES.LOGOUT_ALL,
    'Logged out from all devices',
    req
  );

  return { message: 'Logged out from all devices' };
};

/**
 * Changes user password (requires current password).
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  // Invalidate ALL active sessions for security
  await sessionService.revokeAllSessions(userId);

  // Log password change
  await ActivityLog.createLog(
    userId,
    ACTIVITY_TYPES.PASSWORD_CHANGED,
    'Password changed successfully',
    null
  );

  // Send security alert
  const updatedUser = await User.findById(userId);
  if (updatedUser.emailNotifications) {
    await sendSecurityAlert(
      updatedUser.email,
      updatedUser.name,
      'Password Changed',
      null,
      null,
      `${process.env.CLIENT_URL || ''}/security`
    );
  }

  return { message: 'Password changed successfully. Please log in again' };
};

/**
 * Updates user profile (name).
 */
const updateProfile = async (userId, updates) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Log profile update
  await ActivityLog.createLog(
    userId,
    ACTIVITY_TYPES.PROFILE_UPDATED,
    `Profile updated: ${Object.keys(updates).join(', ')}`,
    null,
    { updates }
  );

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    },
  };
};

/**
 * Gets user activity log.
 */
const getActivityLog = async (userId, limit = 50) => {
  return ActivityLog.getUserActivity(userId, limit);
};

/**
 * Deletes user account and all associated data.
 */
const deleteAccount = async (userId, password) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Password is incorrect');
  }

  // Delete all associated data
  const Session = require('../models/Session');
  const Token = require('../models/Token');

  await Promise.all([
    Session.deleteMany({ userId }),
    Token.deleteMany({ userId }),
    ActivityLog.deleteMany({ userId }),
    User.findByIdAndDelete(userId),
  ]);

  return { message: 'Account deleted successfully' };
};

/**
 * Updates email notification preferences.
 */
const updateEmailNotifications = async (userId, enabled) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { emailNotifications: enabled } },
    { new: true }
  );

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return { emailNotifications: user.emailNotifications };
};

module.exports = {
  register,
  verifyEmail,
  login,
  resendVerification,
  forgotPassword,
  resetPassword,
  logout,
  logoutAll,
  changePassword,
  updateProfile,
  getActivityLog,
  deleteAccount,
  updateEmailNotifications,
};
