const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { ActivityLog, ACTIVITY_TYPES } = require('../models/ActivityLog');
const User = require('../models/User');
const Session = require('../models/Session');

/**
 * @route   GET /api/activity/stats
 * @desc    Get login activity stats for last 7 days + security score data
 * @access  Private
 */
router.get('/stats', authenticate, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Get login counts per day for last 7 days
        const loginStats = await ActivityLog.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    type: ACTIVITY_TYPES.LOGIN,
                    createdAt: { $gte: sevenDaysAgo },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Build 7-day array with zero-fill for missing days
        const dailyLogins = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            const found = loginStats.find((s) => s._id === dateStr);
            dailyLogins.push({
                date: dateStr,
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                count: found ? found.count : 0,
            });
        }

        // Get user data for security score
        const user = await User.findById(userId).select(
            'isEmailVerified twoFactorEnabled passwordChangedAt createdAt'
        );

        // Get active session count
        const activeSessions = await Session.countDocuments({
            userId: req.user._id,
            isActive: true,
        });

        // Calculate security score (0-100)
        let score = 0;
        const scoreBreakdown = {
            emailVerified: { points: 25, earned: user.isEmailVerified },
            twoFactorEnabled: { points: 30, earned: user.twoFactorEnabled || false },
            recentPasswordChange: {
                points: 20,
                earned: user.passwordChangedAt
                    ? new Date().getTime() - new Date(user.passwordChangedAt).getTime() < 90 * 24 * 60 * 60 * 1000
                    : false,
            },
            activeSessions: {
                points: 15,
                earned: activeSessions <= 3, // Fewer sessions = more secure
            },
            accountAge: {
                points: 10,
                earned: new Date().getTime() - new Date(user.createdAt).getTime() > 7 * 24 * 60 * 60 * 1000,
            },
        };

        Object.values(scoreBreakdown).forEach((item) => {
            if (item.earned) score += item.points;
        });

        res.json({
            success: true,
            data: {
                dailyLogins,
                totalLogins: loginStats.reduce((sum, s) => sum + s.count, 0),
                securityScore: {
                    score,
                    maxScore: 100,
                    breakdown: scoreBreakdown,
                },
                activeSessions,
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/activity/recent
 * @desc    Get recent activity timeline
 * @access  Private
 */
router.get('/recent', authenticate, async (req, res, next) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);

        const activities = await ActivityLog.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        // Enrich with relative time
        const enrichedActivities = activities.map((activity) => ({
            ...activity,
            timeAgo: getRelativeTime(activity.createdAt),
        }));

        res.json({
            success: true,
            data: {
                activities: enrichedActivities,
                total: enrichedActivities.length,
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * Helper: Get relative time string
 */
function getRelativeTime(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
}

module.exports = router;
