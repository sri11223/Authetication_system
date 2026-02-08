const rateLimit = require('express-rate-limit');

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
