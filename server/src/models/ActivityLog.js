const mongoose = require('mongoose');

const ACTIVITY_TYPES = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  LOGOUT_ALL: 'logout_all',
  PASSWORD_RESET: 'password_reset',
  PASSWORD_CHANGED: 'password_changed',
  PROFILE_UPDATED: 'profile_updated',
  EMAIL_VERIFIED: 'email_verified',
  SESSION_REVOKED: 'session_revoked',
};

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(ACTIVITY_TYPES),
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      default: 'Unknown',
    },
    userAgent: {
      type: String,
      default: 'Unknown',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ userId: 1, type: 1, createdAt: -1 });

activityLogSchema.statics.createLog = async function (userId, type, description, req, metadata = {}) {
  return this.create({
    userId,
    type,
    description,
    ip: req?.clientIp || req?.ip || 'Unknown',
    userAgent: req?.headers?.['user-agent'] || 'Unknown',
    metadata,
  });
};

activityLogSchema.statics.getUserActivity = async function (userId, limit = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = { ActivityLog, ACTIVITY_TYPES };
