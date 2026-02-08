const crypto = require('crypto');

/**
 * Generates a cryptographically secure random token (hex string).
 */
const generateSecureToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Hashes a token using SHA-256 for secure storage.
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Extracts device info from user-agent and IP.
 */
const extractDeviceInfo = (req) => {
  const userAgent = req.useragent || {};
  const ip = req.clientIp || req.ip || 'unknown';

  return {
    browser: userAgent.browser || 'Unknown',
    browserVersion: userAgent.version || 'Unknown',
    os: userAgent.os || 'Unknown',
    platform: userAgent.platform || 'Unknown',
    device: userAgent.isMobile ? 'Mobile' : userAgent.isTablet ? 'Tablet' : 'Desktop',
    ip,
    userAgentString: req.headers['user-agent'] || 'Unknown',
  };
};

/**
 * Creates a device fingerprint from request info for session deduplication.
 */
const createDeviceFingerprint = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.clientIp || req.ip || '';
  const raw = `${userAgent}-${ip}`;
  return crypto.createHash('md5').update(raw).digest('hex');
};

/**
 * Calculates token expiry date from a duration string (e.g., '15m', '7d', '1h').
 */
const calculateExpiry = (duration) => {
  const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  const match = duration.match(/^(\d+)([smhd])$/);

  if (!match) {
    throw new Error(`Invalid duration format: ${duration}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  return new Date(Date.now() + value * units[unit]);
};

module.exports = {
  generateSecureToken,
  hashToken,
  extractDeviceInfo,
  createDeviceFingerprint,
  calculateExpiry,
};
