const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { generateSecureToken } = require('../utils/helpers');

/**
 * Generates a 2FA secret for a user.
 */
const generateSecret = async (userId, email) => {
  const secret = speakeasy.generateSecret({
    name: `Auth System (${email})`,
    issuer: 'Auth System',
    length: 32,
  });

  // Store the secret temporarily (user needs to verify before enabling)
  await User.findByIdAndUpdate(userId, {
    $set: { twoFactorSecret: secret.base32 },
  });

  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32,
    qrCode: qrCodeUrl,
    manualEntryKey: secret.base32,
  };
};

/**
 * Verifies a 2FA token.
 */
const verifyToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2, // Allow 2 time steps (60 seconds) of tolerance
  });
};

/**
 * Generates backup codes for 2FA recovery.
 */
const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push(generateSecureToken(8).toUpperCase());
  }
  return codes;
};

/**
 * Verifies a backup code and removes it if valid.
 */
const verifyBackupCode = async (userId, code) => {
  const user = await User.findById(userId).select('+twoFactorBackupCodes');
  if (!user || !user.twoFactorEnabled) {
    return false;
  }

  const codeIndex = user.twoFactorBackupCodes.indexOf(code.toUpperCase());
  if (codeIndex === -1) {
    return false;
  }

  // Remove used backup code
  user.twoFactorBackupCodes.splice(codeIndex, 1);
  await user.save();

  return true;
};

/**
 * Enables 2FA for a user after verification.
 */
const enable2FA = async (userId, token) => {
  const user = await User.findById(userId).select('+twoFactorSecret +twoFactorBackupCodes');
  if (!user || !user.twoFactorSecret) {
    throw ApiError.badRequest('2FA secret not found. Please generate a new one.');
  }

  // Verify the token
  const isValid = verifyToken(user.twoFactorSecret, token);
  if (!isValid) {
    throw ApiError.badRequest('Invalid 2FA token. Please try again.');
  }

  // Generate backup codes
  const backupCodes = generateBackupCodes();

  // Enable 2FA
  user.twoFactorEnabled = true;
  user.twoFactorBackupCodes = backupCodes;
  await user.save();

  return { backupCodes };
};

/**
 * Disables 2FA for a user.
 */
const disable2FA = async (userId, password) => {
  const user = await User.findById(userId).select('+password +twoFactorSecret +twoFactorBackupCodes');
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Password is incorrect');
  }

  // Disable 2FA
  user.twoFactorEnabled = false;
  user.twoFactorSecret = null;
  user.twoFactorBackupCodes = [];
  await user.save();

  return { message: '2FA disabled successfully' };
};

/**
 * Verifies 2FA during login.
 */
const verify2FALogin = async (userId, token) => {
  const user = await User.findById(userId).select('+twoFactorSecret +twoFactorBackupCodes');
  if (!user || !user.twoFactorEnabled) {
    throw ApiError.badRequest('2FA is not enabled for this account');
  }

  // Try TOTP token first
  const isValidToken = verifyToken(user.twoFactorSecret, token);
  if (isValidToken) {
    return true;
  }

  // Try backup code
  const isValidBackupCode = await verifyBackupCode(userId, token);
  if (isValidBackupCode) {
    return true;
  }

  throw ApiError.unauthorized('Invalid 2FA token or backup code');
};

module.exports = {
  generateSecret,
  verifyToken,
  generateBackupCodes,
  verifyBackupCode,
  enable2FA,
  disable2FA,
  verify2FALogin,
};
