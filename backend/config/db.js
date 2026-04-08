// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // IMPORTANT: No options object needed for Mongoose 8+
    // Using 127.0.0.1 instead of localhost avoids IPv6 resolution issues on Windows
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log('========================================');
    console.log('✅  MongoDB Connected Successfully!');
    console.log(`📍  Host     : ${conn.connection.host}`);
    console.log(`📦  Database : ${conn.connection.name}`);
    console.log('========================================');
  } catch (error) {
    console.error('========================================');
    console.error('❌  MONGODB CONNECTION FAILED!');
    console.error(`    Error   : ${error.message}`);
    console.error('    Fix     : Run this in terminal:');
    console.error('              net start MongoDB');
    console.error('========================================');
    process.exit(1);
  }
};

mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('🟡 Mongoose disconnected from DB');
});

module.exports = connectDB;
