const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    refreshToken: {
      type: String,
      required: true,
      index: true,
    },
    deviceFingerprint: {
      type: String,
      required: true,
    },
    deviceInfo: {
      browser: { type: String, default: 'Unknown' },
      browserVersion: { type: String, default: 'Unknown' },
      os: { type: String, default: 'Unknown' },
      platform: { type: String, default: 'Unknown' },
      device: { type: String, default: 'Desktop' },
      ip: { type: String, default: 'Unknown' },
      userAgentString: { type: String, default: 'Unknown' },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Compound index to prevent duplicate active sessions per device per user.
 * This is critical for race condition prevention — MongoDB will reject
 * duplicate inserts atomically at the database level.
 */
sessionSchema.index(
  { userId: 1, deviceFingerprint: 1, isActive: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true },
    name: 'unique_active_session_per_device',
  }
);

sessionSchema.index({ userId: 1, isActive: 1 });

sessionSchema.statics.deactivateSessionsByUser = async function (userId) {
  return this.updateMany(
    { userId, isActive: true },
    { $set: { isActive: false } }
  );
};

sessionSchema.statics.deactivateSession = async function (sessionId, userId) {
  return this.findOneAndUpdate(
    { _id: sessionId, userId, isActive: true },
    { $set: { isActive: false } },
    { new: true }
  );
};

sessionSchema.statics.getActiveSessions = async function (userId) {
  return this.find({ userId, isActive: true })
    .sort({ lastActiveAt: -1 })
    .select('-refreshToken')
    .lean();
};

sessionSchema.statics.updateLastActive = async function (sessionId) {
  return this.findByIdAndUpdate(
    sessionId,
    { $set: { lastActiveAt: new Date() } },
    { new: true }
  );
};

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
