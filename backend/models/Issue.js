// models/Issue.js
// Defines the Issue schema for MongoDB

const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Issue title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      // Predefined categories for civic issues
      enum: ['Road', 'Water', 'Electricity', 'Sanitation', 'Parks', 'Safety', 'Other'],
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'Pending', // All new issues start as Pending
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    image: {
      type: String,
      default: '', // File path to uploaded image
    },
    // Reference to the user who reported this issue
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Track who last updated the status (admin)
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Admin notes when updating status
    adminNote: {
      type: String,
      default: '',
      maxlength: [500, 'Admin note cannot exceed 500 characters'],
    },
    // Number of upvotes from other citizens
    upvotes: {
      type: Number,
      default: 0,
    },
    upvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for faster querying by category and status
issueSchema.index({ category: 1, status: 1, priority: 1 });

module.exports = mongoose.model('Issue', issueSchema);
