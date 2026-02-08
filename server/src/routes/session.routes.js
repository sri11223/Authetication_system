const express = require('express');
const sessionController = require('../controllers/session.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All session routes are protected
router.use(authenticate);

router.get('/', sessionController.getActiveSessions);
router.delete('/:sessionId', sessionController.revokeSession);
router.delete('/', sessionController.revokeOtherSessions);

module.exports = router;
