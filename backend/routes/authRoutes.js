// routes/authRoutes.js
// Defines all authentication-related API endpoints

const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// POST /api/auth/register — Create new user account
router.post('/register', register);

// POST /api/auth/login — Login and receive JWT token
router.post('/login', login);

// GET /api/auth/me — Get current user profile (requires login)
router.get('/me', protect, getMe);

module.exports = router;
