const rateLimit = require('express-rate-limit');

/**
 * Custom key generator that safely extracts IP even with trust proxy enabled
 */
const getKeyGenerator = () => {
  return (req) => {
    // Try to get IP from request-ip first (handles most cases safely)
    let ip = req.clientIp;

    // Fallback to req.ip if clientIp is not available
    if (!ip || ip === '::1' || ip === '127.0.0.1') {
      ip = req.ip;
    }

    // Clean up IPv6-mapped IPv4 addresses
    if (ip && ip.startsWith('::ffff:')) {
      ip = ip.replace('::ffff:', '');
    }

    // Return a safe default if IP is still invalid
    return ip || 'unknown';
  };
};

const createLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Use custom key generator to safely handle trust proxy
    keyGenerator: getKeyGenerator(),
    // Skip rate limiting for localhost in development
    skip: (req) => {
      if (process.env.NODE_ENV === 'development') {
        const ip = req.clientIp || req.ip || '';
        return ip === '::1' || ip === '127.0.0.1' || ip.startsWith('::ffff:127.0.0.1');
      }
      return false;
    },
  });
};

/** General API rate limiter: 100 requests per 15 minutes */
const apiLimiter = createLimiter(
  15 * 60 * 1000,
  100,
  'Too many requests from this IP'
);

/** Auth endpoints: 10 attempts per 15 minutes */
const authLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  'Too many authentication attempts. Please try again later'
);

/** Password reset: 5 attempts per hour */
const passwordResetLimiter = createLimiter(
  60 * 60 * 1000,
  5,
  'Too many password reset requests. Please try again later'
);

/** Email verification: 3 resend attempts per hour */
const emailVerificationLimiter = createLimiter(
  60 * 60 * 1000,
  3,
  'Too many verification email requests. Please try again later'
);

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
};
