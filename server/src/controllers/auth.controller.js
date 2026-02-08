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
  const result = await authService.login(req.body, req);

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
  res.clearCookie('refreshToken', { path: '/' });

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.sessionId, req.user._id);

  res.clearCookie('refreshToken', { path: '/' });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAll(req.user._id);

  res.clearCookie('refreshToken', { path: '/' });

  res.status(200).json({
    success: true,
    message: 'Logged out from all devices',
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

module.exports = {
  register,
  verifyEmail,
  login,
  refreshToken,
  resendVerification,
  forgotPassword,
  resetPassword,
  logout,
  logoutAll,
  getMe,
};
