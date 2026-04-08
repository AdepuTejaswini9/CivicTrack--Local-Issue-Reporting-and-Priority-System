// routes/issueRoutes.js
const express = require('express');
const router  = express.Router();
const {
  createIssue, getAllIssues, getMyIssues, getStats,
  getIssueById, updateIssueStatus, updateIssue,
  deleteIssue, upvoteIssue,
} = require('../controllers/issueController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Stats and user-specific — must be BEFORE /:id routes
router.get('/stats', protect, getStats);
router.get('/my',    protect, getMyIssues);

// Main CRUD
router.route('/')
  .get(protect, getAllIssues)
  .post(protect, upload.single('image'), createIssue);

router.route('/:id')
  .get(protect, getIssueById)
  .put(protect, upload.single('image'), updateIssue)
  .delete(protect, deleteIssue);

// Admin status update
router.put('/:id/status', protect, adminOnly, updateIssueStatus);

// Upvote
router.post('/:id/upvote', protect, upvoteIssue);

module.exports = router;
