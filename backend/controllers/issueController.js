// controllers/issueController.js
// Handles all issue-related operations

const Issue = require('../models/Issue');

// @route   POST /api/issues
// @desc    Create a new issue report
// @access  Private
const createIssue = async (req, res) => {
  try {
    const { title, description, category, priority, location } = req.body;

    // Validate required fields
    if (!title || !description || !category || !location) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    // If an image was uploaded via Multer, store its path
    const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

    // Create the issue linked to the logged-in user
    const issue = await Issue.create({
      title,
      description,
      category,
      priority: priority || 'Medium',
      location,
      image: imagePath,
      reportedBy: req.user._id, // From JWT middleware
    });

    // Populate reporter info before sending response
    await issue.populate('reportedBy', 'name email');

    res.status(201).json({
      message: 'Issue reported successfully',
      issue,
    });
  } catch (error) {
    console.error('Create issue error:', error.message);
    res.status(500).json({ message: 'Server error while creating issue' });
  }
};

// @route   GET /api/issues
// @desc    Get all issues with optional filters
// @access  Private
const getAllIssues = async (req, res) => {
  try {
    const { category, priority, status, search } = req.query;

    // Build filter object dynamically
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (priority && priority !== 'All') filter.priority = priority;
    if (status && status !== 'All') filter.status = status;

    // Text search across title and description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const issues = await Issue.find(filter)
      .populate('reportedBy', 'name email') // Get reporter details
      .populate('resolvedBy', 'name')       // Get resolver details
      .sort({ createdAt: -1 });             // Newest first

    res.status(200).json({
      count: issues.length,
      issues,
    });
  } catch (error) {
    console.error('Get issues error:', error.message);
    res.status(500).json({ message: 'Server error while fetching issues' });
  }
};

// @route   GET /api/issues/my
// @desc    Get issues reported by the logged-in user
// @access  Private
const getMyIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ reportedBy: req.user._id })
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ count: issues.length, issues });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/issues/:id
// @desc    Get a single issue by ID
// @access  Private
const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email')
      .populate('resolvedBy', 'name');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.status(200).json({ issue });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   PUT /api/issues/:id/status
// @desc    Update issue status (Admin only)
// @access  Private + Admin
const updateIssueStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    // Validate status value
    if (!['Pending', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Update status and record who resolved it
    issue.status = status;
    issue.adminNote = adminNote || issue.adminNote;
    if (status === 'Resolved') {
      issue.resolvedBy = req.user._id;
    }

    await issue.save();
    await issue.populate('reportedBy', 'name email');
    await issue.populate('resolvedBy', 'name');

    res.status(200).json({
      message: 'Issue status updated successfully',
      issue,
    });
  } catch (error) {
    console.error('Update status error:', error.message);
    res.status(500).json({ message: 'Server error while updating status' });
  }
};

// @route   PUT /api/issues/:id
// @desc    Update issue details (owner or admin)
// @access  Private
const updateIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Only the reporter or an admin can edit
    if (issue.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this issue' });
    }

    const { title, description, category, priority, location } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : issue.image;

    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      { title, description, category, priority, location, image: imagePath },
      { new: true, runValidators: true }
    ).populate('reportedBy', 'name email');

    res.status(200).json({ message: 'Issue updated', issue: updatedIssue });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   DELETE /api/issues/:id
// @desc    Delete an issue (Admin or owner)
// @access  Private
const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Only the reporter or an admin can delete
    if (issue.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this issue' });
    }

    await Issue.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Delete issue error:', error.message);
    res.status(500).json({ message: 'Server error while deleting' });
  }
};

// @route   POST /api/issues/:id/upvote
// @desc    Toggle upvote on an issue
// @access  Private
const upvoteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const userId = req.user._id.toString();
    const alreadyUpvoted = issue.upvotedBy.map(id => id.toString()).includes(userId);

    if (alreadyUpvoted) {
      // Remove upvote
      issue.upvotedBy = issue.upvotedBy.filter(id => id.toString() !== userId);
      issue.upvotes = Math.max(0, issue.upvotes - 1);
    } else {
      // Add upvote
      issue.upvotedBy.push(req.user._id);
      issue.upvotes += 1;
    }

    await issue.save();
    res.status(200).json({ upvotes: issue.upvotes, upvoted: !alreadyUpvoted });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/issues/stats
// @desc    Get dashboard statistics
// @access  Private
const getStats = async (req, res) => {
  try {
    const totalIssues = await Issue.countDocuments();
    const pendingCount = await Issue.countDocuments({ status: 'Pending' });
    const inProgressCount = await Issue.countDocuments({ status: 'In Progress' });
    const resolvedCount = await Issue.countDocuments({ status: 'Resolved' });

    // Category breakdown
    const categoryStats = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      total: totalIssues,
      pending: pendingCount,
      inProgress: inProgressCount,
      resolved: resolvedCount,
      categoryStats,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createIssue,
  getAllIssues,
  getMyIssues,
  getIssueById,
  updateIssueStatus,
  updateIssue,
  deleteIssue,
  upvoteIssue,
  getStats,
};
