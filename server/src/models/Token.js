const mongoose = require('mongoose');

const TOKEN_TYPES = {
  EMAIL_VERIFICATION: 'email_verification',
  PASSWORD_RESET: 'password_reset',
};

const TOKEN_EXPIRY = {
  [TOKEN_TYPES.EMAIL_VERIFICATION]: 24 * 60 * 60 * 1000, // 24 hours
  [TOKEN_TYPES.PASSWORD_RESET]: 60 * 60 * 1000, // 1 hour
};

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(TOKEN_TYPES),
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
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

tokenSchema.index({ userId: 1, type: 1 });

/**
 * Atomically marks a token as used. Returns null if already used or expired.
 * Prevents double-use via findOneAndUpdate atomic operation.
 */
tokenSchema.statics.useToken = async function (tokenHash, type) {
  return this.findOneAndUpdate(
    {
      tokenHash,
      type,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    },
    { $set: { isUsed: true } },
    { new: true }
  );
};

tokenSchema.statics.invalidateTokens = async function (userId, type) {
  return this.updateMany(
    { userId, type, isUsed: false },
    { $set: { isUsed: true } }
  );
};

const Token = mongoose.model('Token', tokenSchema);

module.exports = { Token, TOKEN_TYPES, TOKEN_EXPIRY };
