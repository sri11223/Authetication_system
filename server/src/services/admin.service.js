const User = require('../models/User');
const Session = require('../models/Session');

const getSystemStats = async () => {
    const totalUsers = await User.countDocuments();
    const activeSessions = await Session.countDocuments({ isActive: true });

    // Calculate verified users percentage
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
    const verifiedPercentage = totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0;

    // Get recent logins (sessions created in last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentLogins = await Session.countDocuments({ createdAt: { $gte: oneDayAgo } });

    // Login Trends (Last 7 Days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const loginStats = await ActivityLog.aggregate([
        {
            $match: {
                type: 'login',
                createdAt: { $gte: sevenDaysAgo }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 },
                date: { $first: "$createdAt" }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Map to required format (Mon, Tue, etc.) - fill in missing days with 0?
    // For simplicity, let's just map existing data first, frontend handles gaps? 
    // actually better to send last 7 days names.
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const loginTrends = loginStats.map(stat => ({
        name: days[new Date(stat.date).getDay()],
        logins: stat.count
    }));

    // OS Distribution (Active Sessions)
    const osStats = await Session.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: "$deviceInfo.os",
                value: { $sum: 1 }
            }
        }
    ]);

    const osDistribution = osStats.map(stat => ({
        name: stat._id || 'Unknown',
        value: stat.value
    }));

    return {
        totalUsers,
        activeSessions,
        verifiedPercentage,
        recentLogins,
        loginTrends,
        osDistribution
    };
};

const getAllUsers = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const users = await User.find()
        .select('-password -__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await User.countDocuments();

    return {
        users: users.map(user => ({
            ...user,
            id: user._id
        })),
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / limit),
        },
    };
};

const deleteUser = async (userId) => {
    // Prevent deleting self (though logic should be in controller too)
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
        throw new Error('User not found');
    }
    // Delete all sessions for this user
    await Session.deleteMany({ userId });
    return { message: 'User deleted successfully' };
};

const revokeSession = async (sessionId) => {
    const session = await Session.findByIdAndUpdate(
        sessionId,
        { isActive: false },
        { new: true }
    );

    if (!session) {
        throw new Error('Session not found');
    }
    return { message: 'Session revoked successfully' };
};

const { ActivityLog } = require('../models/ActivityLog');

const getUserDetails = async (userId) => {
    const userDoc = await User.findById(userId).select('-password -__v').lean();
    if (!userDoc) {
        throw new Error('User not found');
    }

    const user = { ...userDoc, id: userDoc._id };

    // Get all sessions (active and inactive) to show history if needed, 
    // but for now let's show active ones primarily or all? 
    // The requirement says "sessions and settings". 
    // Let's get active sessions first as they are most relevant.
    const sessions = await Session.find({ userId }).sort({ lastActiveAt: -1 }).lean();

    // Get recent activity
    const activity = await ActivityLog.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

    return {
        user,
        sessions,
        activity,
    };
};

module.exports = {
    getSystemStats,
    getAllUsers,
    deleteUser,
    revokeSession,
    getUserDetails,
};
