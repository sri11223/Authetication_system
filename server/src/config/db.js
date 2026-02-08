const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  try {
    // Log connection attempt (without password)
    const uriWithoutPassword = env.MONGODB_URI.replace(/:[^:@]+@/, ':****@');
    console.log(`[DB] Attempting to connect to: ${uriWithoutPassword}`);

    const conn = await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // Increased to 10 seconds
      socketTimeoutMS: 45000,
    });

    console.log(`[DB] MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`[DB] MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[DB] MongoDB disconnected. Attempting reconnect...');
    });

    return conn;
  } catch (error) {
    console.error(`[DB] MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
