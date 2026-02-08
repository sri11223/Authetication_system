/**
 * Test MongoDB Connection Script
 * Run: node test-connection.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');

console.log('🔍 Testing MongoDB Connection...\n');

// Check if .env file exists
const fs = require('fs');
const envPath = require('path').join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  console.log('   Run: npm run setup:env');
  process.exit(1);
}

// Check if MONGODB_URI is set
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env file!');
  process.exit(1);
}

// Show connection string (without password)
const uriWithoutPassword = process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@');
console.log('📋 Connection String:');
console.log(`   ${uriWithoutPassword}\n`);

// Parse connection string to show details
try {
  const uri = process.env.MONGODB_URI;
  const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)/);
  
  if (match) {
    const [, username, , host, database] = match;
    console.log('📊 Connection Details:');
    console.log(`   Username: ${username}`);
    console.log(`   Host: ${host}`);
    console.log(`   Database: ${database}\n`);
  }
} catch (err) {
  // Ignore parsing errors
}

console.log('🔄 Attempting to connect...\n');

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 15000, // 15 seconds
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✅ SUCCESS! Connected to MongoDB Atlas');
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Ready State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}\n`);
    
    // Test a simple query
    return mongoose.connection.db.admin().ping();
  })
  .then(() => {
    console.log('✅ Database ping successful!\n');
    console.log('🎉 Everything is working correctly!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Connection failed!\n');
    console.error('Error Details:');
    console.error(`   Message: ${err.message}\n`);
    
    // Provide specific error guidance
    if (err.message.includes('authentication failed')) {
      console.log('💡 Possible Solutions:');
      console.log('   1. Check username and password in MongoDB Atlas');
      console.log('   2. Verify user has "Read and write to any database" permissions');
      console.log('   3. Go to: https://cloud.mongodb.com/v2#/security/database/users\n');
    } else if (err.message.includes('IP')) {
      console.log('💡 Possible Solutions:');
      console.log('   1. Add your IP to MongoDB Atlas Network Access');
      console.log('   2. Or use 0.0.0.0/0 to allow from anywhere (development only)');
      console.log('   3. Go to: https://cloud.mongodb.com/v2#/security/network/whitelist\n');
    } else if (err.message.includes('timeout')) {
      console.log('💡 Possible Solutions:');
      console.log('   1. Check your internet connection');
      console.log('   2. Check if firewall is blocking MongoDB');
      console.log('   3. Try again in a few moments\n');
    } else if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
      console.log('💡 Possible Solutions:');
      console.log('   1. Check your internet connection');
      console.log('   2. Verify the cluster hostname is correct');
      console.log('   3. Check if DNS is resolving correctly\n');
    } else {
      console.log('💡 Check the troubleshooting guide: TROUBLESHOOTING.md\n');
    }
    
    process.exit(1);
  });
