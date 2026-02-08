/**
 * Test script to verify password hashing and comparison
 * Usage: node test-password.js <email> <password>
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const User = require('./src/models/User');
const env = require('./src/config/env');

async function testPassword() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.log('Usage: node test-password.js <email> <password>');
    process.exit(1);
  }

  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('[Test] Connected to MongoDB');

    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log(`[Test] User not found: ${email}`);
      process.exit(1);
    }

    console.log('[Test] User found:', {
      id: user._id,
      email: user.email,
      hasPassword: !!user.password,
      passwordHashLength: user.password?.length,
      passwordHashPrefix: user.password?.substring(0, 20),
    });

    console.log('[Test] Testing password comparison...');
    const isValid = await user.comparePassword(password);
    
    console.log('[Test] Password comparison result:', isValid);
    
    if (isValid) {
      console.log('[Test] ✅ Password is CORRECT');
    } else {
      console.log('[Test] ❌ Password is INCORRECT');
      console.log('[Test] The password you entered does not match the stored hash.');
      console.log('[Test] Suggestion: Use "Forgot Password" to reset your password.');
    }

    await mongoose.disconnect();
    process.exit(isValid ? 0 : 1);
  } catch (error) {
    console.error('[Test] Error:', error);
    process.exit(1);
  }
}

testPassword();
