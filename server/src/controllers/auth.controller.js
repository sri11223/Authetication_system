const authService = require('../services/auth.service');
const sessionService = require('../services/session.service');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please check your email to verify your account.',
    data: result,
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const result = await authService.verifyEmail(token);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

const login = asyncHandler(async (req, res) => {
  console.log('[AuthController] Login request received:', {
    email: req.body.email,
    hasPassword: !!req.body.password,
    ip: req.clientIp || req.ip,
    'x-client-real-ip': req.headers['x-client-real-ip'],
  });

  // If client sends real IP in header, use it for better IP detection
  if (req.headers['x-client-real-ip']) {
    req.headers['x-client-real-ip'] = req.headers['x-client-real-ip'];
  }

  const result = await authService.login(req.body, req);
  
  console.log('[AuthController] Login result:', {
    requires2FA: result.requires2FA,
    success: !result.requires2FA,
  });

  // Check if 2FA is required
  if (result.requires2FA) {
    return res.status(200).json({
      success: true,
      requires2FA: true,
      message: '2FA verification required',
      data: {
        userId: result.userId,
      },
    });
  }

  // Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', result.tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: result.user,
      accessToken: result.tokens.accessToken,
    },
  });
});

const loginWith2FA = asyncHandler(async (req, res) => {
  const { userId, token } = req.body;

  const result = await authService.loginWith2FA(userId, token, req);

  // Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', result.tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: result.user,
      accessToken: result.tokens.accessToken,
    },
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token not found',
    });
  }

  const tokens = await sessionService.refreshSession(token);

  // Rotate refresh token cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  res.status(200).json({
    success: true,
    data: {
      accessToken: tokens.accessToken,
    },
  });
});

const resendVerification = asyncHandler(async (req, res) => {
  const result = await authService.resendVerification(req.body.email);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const result = await authService.resetPassword(token, password);

  // Clear refresh token cookie
  res.clearCookie('refreshToken', { 
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

/**
 * Public endpoint to clear refresh token cookie
 * Used when session is invalid and we need to clear the cookie
 */
const clearCookie = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken', { 
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.status(200).json({
    success: true,
    message: 'Cookie cleared',
  });
});

const logout = asyncHandler(async (req, res) => {
  // Try to logout, but clear cookie even if it fails
  try {
    if (req.sessionId && req.user?._id) {
      await authService.logout(req.sessionId, req.user._id, req);
    }
  } catch (error) {
    // Session might already be revoked, but we still clear the cookie
    console.warn('[Logout] Session already invalid, clearing cookie anyway');
  }

  // Always clear the refresh token cookie
  res.clearCookie('refreshToken', { 
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

const logoutAll = asyncHandler(async (req, res) => {
  // Try to logout all, but clear cookie even if it fails
  try {
    if (req.user?._id) {
      await authService.logoutAll(req.user._id, req);
    }
  } catch (error) {
    // Session might already be revoked, but we still clear the cookie
    console.warn('[LogoutAll] Session already invalid, clearing cookie anyway');
  }

  // Always clear the refresh token cookie
  res.clearCookie('refreshToken', { 
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out from all devices',
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await authService.changePassword(req.user._id, currentPassword, newPassword);

  // Clear refresh token cookie (all sessions invalidated)
  res.clearCookie('refreshToken', { 
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const result = await authService.updateProfile(req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

const getActivityLog = asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query;
  const activities = await authService.getActivityLog(req.user._id, parseInt(limit, 10));

  res.status(200).json({
    success: true,
    data: {
      activities,
      total: activities.length,
    },
  });
});

const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const result = await authService.deleteAccount(req.user._id, password);

  // Clear refresh token cookie
  res.clearCookie('refreshToken', { 
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

const updateEmailNotifications = asyncHandler(async (req, res) => {
  const { enabled } = req.body;
  const result = await authService.updateEmailNotifications(req.user._id, enabled);

  res.status(200).json({
    success: true,
    data: result,
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        isEmailVerified: req.user.isEmailVerified,
        createdAt: req.user.createdAt,
      },
    },
  });
});

const generate2FASecret = asyncHandler(async (req, res) => {
  const twoFactorService = require('../services/twoFactor.service');
  const result = await twoFactorService.generateSecret(req.user._id, req.user.email);

  res.status(200).json({
    success: true,
    data: result,
  });
});

const enable2FA = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const twoFactorService = require('../services/twoFactor.service');
  const result = await twoFactorService.enable2FA(req.user._id, token);

  // Log activity
  const { ActivityLog, ACTIVITY_TYPES } = require('../models/ActivityLog');
  await ActivityLog.createLog(
    req.user._id,
    ACTIVITY_TYPES.PROFILE_UPDATED,
    'Two-Factor Authentication enabled',
    req
  );

  res.status(200).json({
    success: true,
    message: '2FA enabled successfully',
    data: result,
  });
});

const disable2FA = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const twoFactorService = require('../services/twoFactor.service');
  const result = await twoFactorService.disable2FA(req.user._id, password);

  // Log activity
  const { ActivityLog, ACTIVITY_TYPES } = require('../models/ActivityLog');
  await ActivityLog.createLog(
    req.user._id,
    ACTIVITY_TYPES.PROFILE_UPDATED,
    'Two-Factor Authentication disabled',
    req
  );

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

module.exports = {
  register,
  verifyEmail,
  login,
  loginWith2FA,
  refreshToken,
  resendVerification,
  forgotPassword,
  resetPassword,
  clearCookie,
  logout,
  logoutAll,
  getMe,
  changePassword,
  updateProfile,
  getActivityLog,
  deleteAccount,
  updateEmailNotifications,
  generate2FASecret,
  enable2FA,
  disable2FA,
};
