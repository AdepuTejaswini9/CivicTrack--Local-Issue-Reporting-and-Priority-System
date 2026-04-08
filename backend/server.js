// server.js — CivicTrack Backend Entry Point

// ✅ STEP 1: Load .env FIRST before anything else
require('dotenv').config();

const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const mongoose = require('mongoose');

// ✅ STEP 2: Connect to MongoDB
const connectDB = require('./config/db');
connectDB();

const app = express();

// ─── CORS ─────────────────────────────────────────────────────
// Must be BEFORE all routes
app.use(cors({
  origin: '*',           // Allow all origins in development
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS','PATCH'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.options('*', cors()); // Handle preflight for all routes

// ─── Body Parsers ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static Files ─────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Debug Middleware (logs every request) ────────────────────
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth',   require('./routes/authRoutes'));
app.use('/api/issues', require('./routes/issueRoutes'));

// ─── Health Check ─────────────────────────────────────────────
app.get('/', (req, res) => {
  const mongoState = {
    0: '❌ Disconnected',
    1: '✅ Connected',
    2: '🔄 Connecting',
    3: '🔄 Disconnecting',
  };
  res.json({
    server : '🏙️ CivicTrack API is running!',
    mongo  : mongoState[mongoose.connection.readyState],
    db     : mongoose.connection.name || 'not connected',
    port   : process.env.PORT,
    uri    : process.env.MONGO_URI,
  });
});

// ─── 404 ──────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('💥 Error:', err.message);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Max 5MB allowed.' });
  }
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// ─── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('==========================================');
  console.log(`🚀  Server     : http://localhost:${PORT}`);
  console.log(`🗄️   MongoDB    : ${process.env.MONGO_URI}`);
  console.log(`🔑  JWT Loaded : ${process.env.JWT_SECRET ? 'YES ✅' : 'NO ❌'}`);
  console.log('==========================================');
  console.log('');
});
