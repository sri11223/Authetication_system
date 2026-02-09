// Script to disable 2FA for a user
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth_system';
const USER_EMAIL = 'nutalapatisrikrishna85@gmail.com';

async function disable2FA() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected successfully!');

        // Get the users collection directly
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        // Find the user
        const user = await usersCollection.findOne({ email: USER_EMAIL });

        if (!user) {
            console.log('User not found!');
            return;
        }

        console.log('Found user:', {
            id: user._id,
            email: user.email,
            twoFactorEnabled: user.twoFactorEnabled,
            hasSecret: !!user.twoFactorSecret,
            secretLength: user.twoFactorSecret?.length,
        });

        // Disable 2FA
        const result = await usersCollection.updateOne(
            { email: USER_EMAIL },
            {
                $set: { twoFactorEnabled: false },
                $unset: {
                    twoFactorSecret: '',
                    twoFactorBackupCodes: ''
                }
            }
        );

        console.log('Update result:', result);
        console.log('\n✅ 2FA has been disabled for', USER_EMAIL);
        console.log('You can now login normally and re-enable 2FA from the Security page.');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

disable2FA();
