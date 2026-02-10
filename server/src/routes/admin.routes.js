const express = require('express');
const router = express.Router();
const { authenticate: protect } = require('../middleware/auth');
const admin = require('../middleware/admin.middleware');
const adminService = require('../services/admin.service');


// If asyncHandler doesn't exist as middleware, I'll inline a wrapper or use try-catch
// Checking codebase revealed previous usage of asyncHandler in auth.controller.js
// Let's implement these routes using standard patter

// Middleware for all admin routes
router.use(protect);
router.use(admin);

// @desc    Get System Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', async (req, res, next) => {
    try {
        const stats = await adminService.getSystemStats();
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
});

// @desc    Get All Users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', async (req, res, next) => {
    try {
        const { page, limit } = req.query;
        const result = await adminService.getAllUsers(page, limit);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// @desc    Get User Details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
router.get('/users/:id', async (req, res, next) => {
    try {
        const result = await adminService.getUserDetails(req.params.id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// @desc    Delete User
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', async (req, res, next) => {
    try {
        await adminService.deleteUser(req.params.id);
        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error) {
        next(error);
    }
});

// @desc    Revoke Session
// @route   DELETE /api/admin/sessions/:id
// @access  Private/Admin
router.delete('/sessions/:id', async (req, res, next) => {
    try {
        await adminService.revokeSession(req.params.id);
        res.status(200).json({ success: true, message: 'Session revoked' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
