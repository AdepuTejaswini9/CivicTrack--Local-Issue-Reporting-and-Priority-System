// src/components/IssueCard.js
// Displays a single issue in card format

import React from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

// Maps priority to colors
const priorityColors = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#10b981',
};

// Maps status to icons and colors
const statusConfig = {
  Pending: { icon: '🕐', color: '#f59e0b', bg: '#fef3c7' },
  'In Progress': { icon: '🔧', color: '#3b82f6', bg: '#dbeafe' },
  Resolved: { icon: '✅', color: '#10b981', bg: '#d1fae5' },
};

const categoryIcons = {
  Road: '🛣️',
  Water: '💧',
  Electricity: '⚡',
  Sanitation: '🗑️',
  Parks: '🌳',
  Safety: '🚨',
  Other: '📌',
};

const IssueCard = ({ issue, onDelete, onStatusUpdate, onUpvote }) => {
  const { user, isAdmin } = useAuth();
  const status = statusConfig[issue.status];
  const isOwner = user?._id === issue.reportedBy?._id || user?.id === issue.reportedBy?._id;
  const hasUpvoted = issue.upvotedBy?.includes(user?.id) || issue.upvotedBy?.includes(user?._id);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  return (
    <div className="issue-card">
      {/* Priority stripe on left border */}
      <div
        className="priority-stripe"
        style={{ backgroundColor: priorityColors[issue.priority] }}
      />

      <div className="card-content">
        {/* Header row */}
        <div className="card-header">
          <div className="card-title-row">
            <span className="category-icon">{categoryIcons[issue.category] || '📌'}</span>
            <h3 className="card-title">{issue.title}</h3>
          </div>
          <div className="card-badges">
            <span
              className="priority-badge"
              style={{ backgroundColor: priorityColors[issue.priority] + '20', color: priorityColors[issue.priority] }}
            >
              {issue.priority}
            </span>
            <span
              className="status-badge"
              style={{ backgroundColor: status.bg, color: status.color }}
            >
              {status.icon} {issue.status}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="card-description">{issue.description}</p>

        {/* Image if exists */}
        {issue.image && (
          <img
            src={`http://localhost:5000${issue.image}`}
            alt="Issue"
            className="card-image"
          />
        )}

        {/* Meta info */}
        <div className="card-meta">
          <span>📍 {issue.location}</span>
          <span>🏷️ {issue.category}</span>
          <span>👤 {issue.reportedBy?.name}</span>
          <span>📅 {formatDate(issue.createdAt)}</span>
        </div>

        {/* Admin note */}
        {issue.adminNote && (
          <div className="admin-note">
            <strong>🛡️ Admin Note:</strong> {issue.adminNote}
          </div>
        )}

        {/* Action row */}
        <div className="card-actions">
          {/* Upvote button */}
          <button
            className={`btn-upvote ${hasUpvoted ? 'upvoted' : ''}`}
            onClick={() => onUpvote(issue._id)}
          >
            👍 {issue.upvotes || 0}
          </button>

          {/* Admin: Status update dropdown */}
          {isAdmin && (
            <select
              className="status-select"
              value={issue.status}
              onChange={(e) => onStatusUpdate(issue._id, e.target.value)}
            >
              <option value="Pending">🕐 Pending</option>
              <option value="In Progress">🔧 In Progress</option>
              <option value="Resolved">✅ Resolved</option>
            </select>
          )}

          {/* Delete button (admin or owner) */}
          {(isAdmin || isOwner) && (
            <button
              className="btn-delete"
              onClick={() => {
                if (window.confirm('Delete this issue?')) onDelete(issue._id);
              }}
            >
              🗑️ Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
