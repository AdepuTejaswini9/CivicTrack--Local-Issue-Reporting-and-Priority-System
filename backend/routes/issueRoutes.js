// routes/issueRoutes.js
// Defines all issue-related API endpoints

const express = require('express');
const router = express.Router();
const {
  createIssue,
  getAllIssues,
  getMyIssues,
  getIssueById,
  updateIssueStatus,
  updateIssue,
  deleteIssue,
  upvoteIssue,
  getStats,
} = require('../controllers/issueController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes below require authentication (JWT)

// GET /api/issues/stats — Dashboard statistics
router.get('/stats', protect, getStats);

// GET /api/issues/my — Get current user's issues
router.get('/my', protect, getMyIssues);

// GET /api/issues — Get all issues (with filters)
// POST /api/issues — Create a new issue (with optional image upload)
router
  .route('/')
  .get(protect, getAllIssues)
  .post(protect, upload.single('image'), createIssue);
  // upload.single('image') processes a single file with field name 'image'

// GET /api/issues/:id — Get single issue
// PUT /api/issues/:id — Update issue
// DELETE /api/issues/:id — Delete issue
router
  .route('/:id')
  .get(protect, getIssueById)
  .put(protect, upload.single('image'), updateIssue)
  .delete(protect, deleteIssue);

// PUT /api/issues/:id/status — Admin: Update issue status
router.put('/:id/status', protect, adminOnly, updateIssueStatus);

// POST /api/issues/:id/upvote — Toggle upvote
router.post('/:id/upvote', protect, upvoteIssue);

module.exports = router;
