const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
  updateProfileSchema,
  deleteAccountSchema,
  updateEmailNotificationsSchema,
  login2FASchema,
  enable2FASchema,
  disable2FASchema,
} = require('../validators/auth.validator');
const {
  authLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
} = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.post('/resend-verification', emailVerificationLimiter, authController.resendVerification);
router.post('/clear-cookie', authController.clearCookie); // Public endpoint to clear cookie

// Protected routes
router.get('/me', authenticate, authController.getMe);
// Logout uses optional auth - works even if session is invalid (to clear cookie)
router.post('/logout', optionalAuthenticate, authController.logout);
router.post('/logout-all', authenticate, authController.logoutAll);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);
router.patch('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile);
router.get('/activity', authenticate, authController.getActivityLog);
router.delete('/account', authenticate, validate(deleteAccountSchema), authController.deleteAccount);
router.patch('/email-notifications', authenticate, validate(updateEmailNotificationsSchema), authController.updateEmailNotifications);
router.post('/login-2fa', validate(login2FASchema), authController.loginWith2FA);
router.get('/2fa/secret', authenticate, authController.generate2FASecret);
router.post('/2fa/enable', authenticate, validate(enable2FASchema), authController.enable2FA);
router.post('/2fa/disable', authenticate, validate(disable2FASchema), authController.disable2FA);

module.exports = router;
