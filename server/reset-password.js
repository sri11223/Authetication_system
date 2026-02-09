/**
 * Quick password reset script
 * Usage: node reset-password.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// The email to reset password for
const EMAIL = 'nutalapatisrikrishna85@gmail.com';
// Set your new password here (must be at least 8 characters)
const NEW_PASSWORD = 'Test@1234';

async function resetPassword() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    // Get the User model
    const userSchema = new mongoose.Schema({
      email: String,
      password: String,
      failedLoginAttempts: Number,
      lockUntil: Date,
      isLocked: Boolean,
    });
    
    const User = mongoose.model('User', userSchema);
    
    // Find the user
    const user = await User.findOne({ email: EMAIL });
    if (!user) {
      console.log('User not found!');
      process.exit(1);
    }
    
    console.log('Found user:', user._id);
    console.log('Current failed login attempts:', user.failedLoginAttempts);
    
    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);
    
    // Update the user
    await User.updateOne(
      { email: EMAIL },
      { 
        $set: { 
          password: hashedPassword,
          failedLoginAttempts: 0,
        },
        $unset: {
          lockUntil: 1,
          isLocked: 1,
        }
      }
    );
    
    console.log('\n✅ Password reset successfully!');
    console.log('New password:', NEW_PASSWORD);
    console.log('Failed login attempts reset to 0');
    console.log('\nYou can now login with your new password.');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

resetPassword();
