const mongoose = require('mongoose');
const Session = require('../models/Session');
const User = require('../models/User');
const { generateTokenPair } = require('./token.service');
const { hashToken, calculateExpiry, extractDeviceInfo, createDeviceFingerprint } = require('../utils/helpers');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

/**
 * Creates a new session with race-condition safety.
 *
 * RACE CONDITION STRATEGY:
 * 1. A unique partial index on (userId, deviceFingerprint, isActive:true)
 *    prevents duplicate active sessions for the same device at the DB level.
 * 2. We use findOneAndUpdate with upsert for an atomic "create-or-update" operation.
 * 3. If two concurrent requests from the same device arrive:
 *    - Both compute the same deviceFingerprint
 *    - The upsert ensures only ONE active session exists per device
 *    - The second request will update the existing session instead of creating a duplicate
 * 4. For concurrent logins from DIFFERENT devices, MongoDB transactions ensure
 *    the session count remains consistent.
 */
const createSession = async (userId, req) => {
  const deviceInfo = extractDeviceInfo(req);
  const deviceFingerprint = createDeviceFingerprint(req);
  const refreshExpiry = calculateExpiry(env.JWT_REFRESH_EXPIRY);

  const mongoSession = await mongoose.startSession();

  try {
    mongoSession.startTransaction({
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' },
    });

    /**
     * Atomic upsert: If an active session for this device already exists,
     * update it. Otherwise, create a new one. This prevents duplicate
     * sessions from concurrent login requests on the same device.
     */
    const session = await Session.findOneAndUpdate(
      {
        userId,
        deviceFingerprint,
        isActive: true,
      },
      {
        $set: {
          deviceInfo,
          lastActiveAt: new Date(),
          expiresAt: refreshExpiry,
          // refreshToken will be set below after we know the session ID
        },
        $setOnInsert: {
          userId,
          deviceFingerprint,
          isActive: true,
        },
      },
      {
        upsert: true,
        new: true,
        session: mongoSession,
      }
    );

    // Generate tokens with the session ID
    const tokens = generateTokenPair(userId, session._id);
    const refreshTokenHash = hashToken(tokens.refreshToken);

    // Update the session with the hashed refresh token
    session.refreshToken = refreshTokenHash;
    await session.save({ session: mongoSession });

    // Update user's active session count atomically
    const activeCount = await Session.countDocuments(
      { userId, isActive: true },
      { session: mongoSession }
    );

    await User.findByIdAndUpdate(
      userId,
      { $set: { activeSessions: activeCount } },
      { session: mongoSession }
    );

    await mongoSession.commitTransaction();

    return {
      session,
      tokens,
    };
  } catch (error) {
    await mongoSession.abortTransaction();

    // Handle duplicate key error from race condition on unique index
    if (error.code === 11000) {
      // Retry once — the other concurrent request won, so update the existing session
      const existingSession = await Session.findOne({
        userId,
        deviceFingerprint,
        isActive: true,
      });

      if (existingSession) {
        const tokens = generateTokenPair(userId, existingSession._id);
        existingSession.refreshToken = hashToken(tokens.refreshToken);
        existingSession.lastActiveAt = new Date();
        existingSession.deviceInfo = deviceInfo;
        existingSession.expiresAt = refreshExpiry;
        await existingSession.save();

        return { session: existingSession, tokens };
      }
    }

    throw error;
  } finally {
    mongoSession.endSession();
  }
};

/**
 * Refreshes an access token using a valid refresh token.
 */
const refreshSession = async (refreshToken) => {
  const tokenService = require('./token.service');
  let decoded;

  try {
    decoded = tokenService.verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const refreshTokenHash = hashToken(refreshToken);

  const session = await Session.findOne({
    _id: decoded.sessionId,
    userId: decoded.userId,
    refreshToken: refreshTokenHash,
    isActive: true,
    expiresAt: { $gt: new Date() },
  });

  if (!session) {
    throw ApiError.unauthorized('Session expired or revoked');
  }

  // Generate new token pair and rotate refresh token
  const tokens = generateTokenPair(decoded.userId, session._id);
  session.refreshToken = hashToken(tokens.refreshToken);
  session.lastActiveAt = new Date();
  await session.save();

  return tokens;
};

/**
 * Revokes a specific session.
 */
const revokeSession = async (sessionId, userId) => {
  const session = await Session.deactivateSession(sessionId, userId);

  if (!session) {
    throw ApiError.notFound('Session not found or already revoked');
  }

  // Update active session count
  const activeCount = await Session.countDocuments({ userId, isActive: true });
  await User.findByIdAndUpdate(userId, { $set: { activeSessions: activeCount } });

  return session;
};

/**
 * Revokes all sessions for a user.
 */
const revokeAllSessions = async (userId, exceptSessionId = null) => {
  const filter = { userId, isActive: true };
  if (exceptSessionId) {
    filter._id = { $ne: exceptSessionId };
  }

  await Session.updateMany(filter, { $set: { isActive: false } });

  const activeCount = await Session.countDocuments({ userId, isActive: true });
  await User.findByIdAndUpdate(userId, { $set: { activeSessions: activeCount } });
};

/**
 * Gets all active sessions for a user.
 */
const getActiveSessions = async (userId) => {
  return Session.getActiveSessions(userId);
};

module.exports = {
  createSession,
  refreshSession,
  revokeSession,
  revokeAllSessions,
  getActiveSessions,
};
