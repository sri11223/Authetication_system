const User = require('../models/User');
const { TOKEN_TYPES } = require('../models/Token');
const { createActionToken, consumeActionToken } = require('./token.service');
const { sendVerificationEmail, sendPasswordResetEmail } = require('./email.service');
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

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isEmailVerified) {
    throw ApiError.forbidden('Please verify your email before logging in');
  }

  // Create session with race-condition protection
  const { session, tokens } = await sessionService.createSession(user._id, req);

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

  return { message: 'Password reset successfully. Please log in with your new password' };
};

/**
 * Logs out from current session.
 */
const logout = async (sessionId, userId) => {
  await sessionService.revokeSession(sessionId, userId);
  return { message: 'Logged out successfully' };
};

/**
 * Logs out from all sessions.
 */
const logoutAll = async (userId) => {
  await sessionService.revokeAllSessions(userId);
  return { message: 'Logged out from all devices' };
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
};
