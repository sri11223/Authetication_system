const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { Token, TOKEN_TYPES, TOKEN_EXPIRY } = require('../models/Token');
const { generateSecureToken, hashToken } = require('../utils/helpers');

/**
 * Generates a JWT access token.
 */
const generateAccessToken = (userId, sessionId) => {
  return jwt.sign({ userId, sessionId }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY,
  });
};

/**
 * Generates a JWT refresh token.
 */
const generateRefreshToken = (userId, sessionId) => {
  return jwt.sign({ userId, sessionId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
  });
};

/**
 * Generates both access and refresh tokens.
 */
const generateTokenPair = (userId, sessionId) => {
  return {
    accessToken: generateAccessToken(userId, sessionId),
    refreshToken: generateRefreshToken(userId, sessionId),
  };
};

/**
 * Verifies a refresh token.
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};

/**
 * Creates and stores a verification/reset token.
 * Returns the raw token (for email links), stores the hash.
 */
const createActionToken = async (userId, type) => {
  // Invalidate any existing tokens of this type for this user
  await Token.invalidateTokens(userId, type);

  const rawToken = generateSecureToken();
  const tokenHash = hashToken(rawToken);

  await Token.create({
    userId,
    tokenHash,
    type,
    expiresAt: new Date(Date.now() + TOKEN_EXPIRY[type]),
  });

  return rawToken;
};

/**
 * Validates and consumes an action token atomically.
 * Returns the token document if valid, null otherwise.
 */
const consumeActionToken = async (rawToken, type) => {
  const tokenHash = hashToken(rawToken);
  return Token.useToken(tokenHash, type);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyRefreshToken,
  createActionToken,
  consumeActionToken,
};
