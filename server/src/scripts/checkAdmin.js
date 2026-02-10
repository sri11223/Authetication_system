const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');

const checkAdmin = async () => {
    try {
        await mongoose.connect(env.MONGODB_URI);
        const admin = await User.findOne({ email: 'admin@example.com' }).select('+password');

        if (admin) {
            console.log('Admin found:', admin.email);
            console.log('Role:', admin.role);
            console.log('Password hash length:', admin.password ? admin.password.length : 'No password');
        } else {
            console.log('Admin user NOT found.');
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkAdmin();
