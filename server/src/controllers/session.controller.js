const sessionService = require('../services/session.service');
const { ActivityLog, ACTIVITY_TYPES } = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');

const getActiveSessions = asyncHandler(async (req, res) => {
  const sessions = await sessionService.getActiveSessions(req.user._id);

  // Mark current session
  const sessionsWithCurrent = sessions.map((session) => ({
    ...session,
    isCurrent: session._id.toString() === req.sessionId,
  }));

  res.status(200).json({
    success: true,
    data: {
      sessions: sessionsWithCurrent,
      total: sessionsWithCurrent.length,
    },
  });
});

const revokeSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  await sessionService.revokeSession(sessionId, req.user._id);

  // Log session revocation
  await ActivityLog.createLog(
    req.user._id,
    ACTIVITY_TYPES.SESSION_REVOKED,
    'Session revoked from security settings',
    req,
    { sessionId }
  );

  res.status(200).json({
    success: true,
    message: 'Session revoked successfully',
  });
});

const revokeOtherSessions = asyncHandler(async (req, res) => {
  await sessionService.revokeAllSessions(req.user._id, req.sessionId);

  res.status(200).json({
    success: true,
    message: 'All other sessions revoked successfully',
  });
});

module.exports = {
  getActiveSessions,
  revokeSession,
  revokeOtherSessions,
};
