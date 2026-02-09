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
    name: `AuthSystem (${email})`,
    issuer: 'AuthSystem',
    length: 32,
  });

  console.log('[2FA Setup] Generated secret:', {
    base32: secret.base32,
    base32Length: secret.base32.length,
    otpauth_url: secret.otpauth_url,
  });

  // Store the base32 secret
  const secretToStore = secret.base32;

  await User.findByIdAndUpdate(userId, {
    $set: { twoFactorSecret: secretToStore },
  });

  // IMPORTANT: Build the otpauth URL manually using the SAME secret we store
  // This ensures the QR code contains the exact same secret as what's in the database
  const otpauthUrl = `otpauth://totp/AuthSystem:${encodeURIComponent(email)}?secret=${secretToStore}&issuer=AuthSystem&algorithm=SHA1&digits=6&period=30`;

  console.log('[2FA Setup] Using otpauth URL:', otpauthUrl);

  // Generate QR code using our manually constructed URL
  const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

  return {
    secret: secretToStore,
    qrCode: qrCodeUrl,
    manualEntryKey: secretToStore,
  };
};

/**
 * Verifies a 2FA token.
 */
const verifyToken = (secret, token) => {
  const now = new Date();
  console.log('[2FA verifyToken] Verifying token:', {
    tokenLength: token?.length,
    secretExists: !!secret,
    secretLength: secret?.length,
    serverTime: now.toISOString(),
    serverTimestamp: Math.floor(now.getTime() / 1000),
    timeStep: Math.floor(now.getTime() / 30000), // 30-second steps
  });

  // Generate current expected token for debugging
  try {
    const expectedToken = speakeasy.totp({
      secret,
      encoding: 'base32',
    });
    console.log('[2FA verifyToken] Expected token now:', expectedToken);
    console.log('[2FA verifyToken] Received token:', token);
    console.log('[2FA verifyToken] Tokens match:', expectedToken === token);

    // Generate tokens for adjacent time windows
    const tokens = [];
    for (let step = -4; step <= 4; step++) {
      const t = speakeasy.totp({
        secret,
        encoding: 'base32',
        step: 30,
        epoch: 0,
        time: Math.floor(Date.now() / 1000) + (step * 30),
      });
      tokens.push({ step, token: t });
    }
    console.log('[2FA verifyToken] Tokens for time windows:', tokens);
  } catch (err) {
    console.error('[2FA verifyToken] Error generating expected token:', err.message);
  }

  const result = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 4, // Allow 4 time steps (2 minutes) of tolerance for time sync issues
  });

  console.log('[2FA verifyToken] Verification result:', result);
  return result;
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
  console.log('[2FA] Verifying login for userId:', userId);
  console.log('[2FA] Token received:', { token, length: token?.length, type: typeof token });

  const user = await User.findById(userId).select('+twoFactorSecret +twoFactorBackupCodes');
  if (!user || !user.twoFactorEnabled) {
    console.log('[2FA] 2FA not enabled for this user');
    throw ApiError.badRequest('2FA is not enabled for this account');
  }

  console.log('[2FA] User has 2FA enabled, secret exists:', !!user.twoFactorSecret);

  // Sanitize token - remove any non-digit characters and trim
  const sanitizedToken = token?.toString().replace(/\D/g, '').trim();
  console.log('[2FA] Sanitized token:', { sanitizedToken, length: sanitizedToken?.length });

  // Try TOTP token first
  const isValidToken = verifyToken(user.twoFactorSecret, sanitizedToken);
  console.log('[2FA] TOTP verification result:', isValidToken);

  if (isValidToken) {
    console.log('[2FA] TOTP token valid!');
    return true;
  }

  // Try backup code (use original token for backup codes as they may contain letters)
  console.log('[2FA] TOTP failed, trying backup code...');
  const isValidBackupCode = await verifyBackupCode(userId, token);
  console.log('[2FA] Backup code result:', isValidBackupCode);

  if (isValidBackupCode) {
    console.log('[2FA] Backup code valid!');
    return true;
  }

  console.log('[2FA] Both TOTP and backup code verification failed');
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
