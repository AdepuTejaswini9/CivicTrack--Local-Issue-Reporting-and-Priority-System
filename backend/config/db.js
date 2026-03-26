// config/db.js
// Handles MongoDB connection using Mongoose

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // FIX: Mongoose 8+ removed useNewUrlParser & useUnifiedTopology options
    // Passing them caused silent failures — connect with URI only
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('👉 Fix: Make sure MongoDB is running locally.');
    console.error('   Linux:   sudo systemctl start mongod');
    console.error('   Mac:     brew services start mongodb-community');
    console.error('   Windows: net start MongoDB');
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB runtime error:', err.message);
});

module.exports = connectDB;
