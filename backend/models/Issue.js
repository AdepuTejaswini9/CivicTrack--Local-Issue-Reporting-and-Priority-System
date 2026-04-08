// models/Issue.js
const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 1000,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Road','Water','Electricity','Sanitation','Parks','Safety','Other'],
  },
  priority: {
    type: String,
    enum: ['Low','Medium','High'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Pending','In Progress','Resolved'],
    default: 'Pending',
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  image: {
    type: String,
    default: '',
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  adminNote: {
    type: String,
    default: '',
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  upvotedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);
