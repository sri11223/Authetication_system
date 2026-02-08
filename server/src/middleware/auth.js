const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const Session = require('../models/Session');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Protects routes by validating the access token and checking session validity.
 */
const authenticate = asyncHandler(async (req, _res, next) => {
  // 1. Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Access token is required');
  }

  const accessToken = authHeader.split(' ')[1];

  // 2. Verify the token
  let decoded;
  try {
    decoded = jwt.verify(accessToken, env.JWT_ACCESS_SECRET);
  } catch {
    throw ApiError.unauthorized('Invalid or expired access token');
  }

  // 3. Check if user still exists
  const user = await User.findById(decoded.userId);
  if (!user) {
    throw ApiError.unauthorized('User no longer exists');
  }

  // 4. Check if password was changed after token was issued
  if (user.hasPasswordChangedAfter(decoded.iat)) {
    throw ApiError.unauthorized('Password was recently changed. Please log in again');
  }

  // 5. Check if the session is still active
  if (decoded.sessionId) {
    const session = await Session.findOne({
      _id: decoded.sessionId,
      userId: decoded.userId,
      isActive: true,
    });

    if (!session) {
      throw ApiError.unauthorized('Session has been revoked');
    }

    // Update last active timestamp
    await Session.updateLastActive(session._id);
    req.sessionId = decoded.sessionId;
  }

  // 6. Attach user to request
  req.user = user;
  next();
});

/**
 * Optional authentication - tries to authenticate but doesn't fail if it can't.
 * Useful for endpoints that need to work even when session is invalid (like logout).
 */
const optionalAuthenticate = asyncHandler(async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token, continue without auth
    }

    const accessToken = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = jwt.verify(accessToken, env.JWT_ACCESS_SECRET);
    } catch {
      return next(); // Invalid token, continue without auth
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(); // User not found, continue without auth
    }

    if (decoded.sessionId) {
      const session = await Session.findOne({
        _id: decoded.sessionId,
        userId: decoded.userId,
        isActive: true,
      });

      if (session) {
        req.sessionId = decoded.sessionId;
        req.user = user;
      }
    }
  } catch {
    // Any error, just continue without auth
  }

  next();
});

module.exports = { authenticate, optionalAuthenticate };
