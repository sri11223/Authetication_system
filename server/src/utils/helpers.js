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
 * Extracts the real client IP address from request headers.
 * Handles proxies, load balancers, and localhost cases.
 */
const getClientIp = (req) => {
  // Priority order for IP extraction:
  // 1. Custom header from client (if client sends real IP)
  // 2. X-Forwarded-For (first IP in chain)
  // 3. X-Real-IP
  // 4. CF-Connecting-IP (Cloudflare)
  // 5. request-ip library result
  // 6. Connection remote address
  
  let ip = req.headers['x-client-real-ip'] || // Custom header from client
           req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           req.headers['x-real-ip'] ||
           req.headers['cf-connecting-ip'] ||
           req.clientIp ||
           req.headers['x-client-ip'] ||
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           req.ip;
  
  // Clean up IPv6-mapped IPv4 addresses (::ffff:192.168.1.1 -> 192.168.1.1)
  if (ip && ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }
  
  // Remove brackets from IPv6 addresses
  if (ip && ip.startsWith('[') && ip.endsWith(']')) {
    ip = ip.slice(1, -1);
  }
  
  // Handle localhost cases - show better message
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
    // In development, show a friendly message
    if (process.env.NODE_ENV === 'development') {
      return 'Localhost';
    }
    return 'Unknown';
  }
  
  return ip;
};

/**
 * Extracts device info from user-agent and IP.
 */
const extractDeviceInfo = (req) => {
  const userAgent = req.useragent || {};
  const ip = getClientIp(req);

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
