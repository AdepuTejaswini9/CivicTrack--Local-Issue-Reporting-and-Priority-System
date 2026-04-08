// controllers/issueController.js
const Issue = require('../models/Issue');

// POST /api/issues — Create issue
const createIssue = async (req, res) => {
  console.log('📋 Create issue body:', req.body);
  console.log('📎 File:', req.file);
  try {
    const { title, description, category, priority, location } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({ message: 'Title, description, category and location are required' });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

    const issue = await Issue.create({
      title,
      description,
      category,
      priority: priority || 'Medium',
      location,
      image: imagePath,
      reportedBy: req.user._id,
    });

    await issue.populate('reportedBy', 'name email');
    console.log('✅ Issue saved to DB:', issue._id);
    res.status(201).json({ message: 'Issue reported successfully', issue });
  } catch (err) {
    console.error('❌ Create issue error:', err);
    res.status(500).json({ message: err.message || 'Failed to create issue' });
  }
};

// GET /api/issues — Get all with filters
const getAllIssues = async (req, res) => {
  try {
    const { category, priority, status, search } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (priority && priority !== 'All') filter.priority = priority;
    if (status   && status   !== 'All') filter.status   = status;
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location:    { $regex: search, $options: 'i' } },
      ];
    }
    const issues = await Issue.find(filter)
      .populate('reportedBy', 'name email')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ count: issues.length, issues });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch issues' });
  }
};

// GET /api/issues/my
const getMyIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ reportedBy: req.user._id })
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ count: issues.length, issues });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/issues/stats
const getStats = async (req, res) => {
  try {
    const total      = await Issue.countDocuments();
    const pending    = await Issue.countDocuments({ status: 'Pending' });
    const inProgress = await Issue.countDocuments({ status: 'In Progress' });
    const resolved   = await Issue.countDocuments({ status: 'Resolved' });
    const categoryStats = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.status(200).json({ total, pending, inProgress, resolved, categoryStats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/issues/:id
const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email')
      .populate('resolvedBy', 'name');
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    res.status(200).json({ issue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/issues/:id/status — Admin update status
const updateIssueStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    if (!['Pending','In Progress','Resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.status    = status;
    issue.adminNote = adminNote || issue.adminNote;
    if (status === 'Resolved') issue.resolvedBy = req.user._id;

    await issue.save();
    await issue.populate('reportedBy', 'name email');
    await issue.populate('resolvedBy', 'name');
    res.status(200).json({ message: 'Status updated', issue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/issues/:id — Edit issue
const updateIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const isOwner = issue.reportedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, category, priority, location } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : issue.image;

    const updated = await Issue.findByIdAndUpdate(
      req.params.id,
      { title, description, category, priority, location, image: imagePath },
      { new: true, runValidators: true }
    ).populate('reportedBy', 'name email');

    res.status(200).json({ message: 'Issue updated', issue: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/issues/:id
const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const isOwner = issue.reportedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Issue.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Issue deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/issues/:id/upvote
const upvoteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const userId = req.user._id.toString();
    const alreadyUpvoted = issue.upvotedBy.map(id => id.toString()).includes(userId);

    if (alreadyUpvoted) {
      issue.upvotedBy = issue.upvotedBy.filter(id => id.toString() !== userId);
      issue.upvotes   = Math.max(0, issue.upvotes - 1);
    } else {
      issue.upvotedBy.push(req.user._id);
      issue.upvotes += 1;
    }

    await issue.save();
    res.status(200).json({ upvotes: issue.upvotes, upvoted: !alreadyUpvoted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createIssue, getAllIssues, getMyIssues, getStats,
  getIssueById, updateIssueStatus, updateIssue,
  deleteIssue, upvoteIssue,
};
