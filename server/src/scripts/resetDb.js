const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');
const Session = require('../models/Session');
const { ActivityLog } = require('../models/ActivityLog'); // ActivityLog might be a named export based on previous usage

const resetDb = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(env.MONGODB_URI);
        console.log('Connected.');

        console.log('Clearing collections...');
        await User.deleteMany({});
        await Session.deleteMany({});
        await ActivityLog.deleteMany({});
        console.log('Collections cleared.');

        console.log('Creating default admin user...');
        const adminUser = new User({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'adminpassword123',
            role: 'admin',
            isEmailVerified: true
        });

        await adminUser.save();
        console.log('Default admin created: admin@example.com / adminpassword123');

        console.log('Database reset successful.');
        process.exit(0);
    } catch (error) {
        console.error('Error resetting database:', error);
        process.exit(1);
    }
};

resetDb();
