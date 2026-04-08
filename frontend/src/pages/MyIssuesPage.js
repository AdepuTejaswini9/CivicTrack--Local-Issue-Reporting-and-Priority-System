// src/pages/MyIssuesPage.js
// Shows only the issues reported by the currently logged-in user

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import IssueCard from '../components/IssueCard';
import { useAuth } from '../context/AuthContext';

const MyIssuesPage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchMyIssues();
  }, []);

  const fetchMyIssues = async () => {
    try {
      const res = await api.get('/issues/my');
      setIssues(res.data.issues);
    } catch (err) {
      setError('Failed to load your issues.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/issues/${id}`);
      setIssues(issues.filter((i) => i._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await api.put(`/issues/${id}/status`, { status: newStatus });
      setIssues(issues.map((i) => (i._id === id ? res.data.issue : i)));
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleUpvote = async (id) => {
    try {
      const res = await api.post(`/issues/${id}/upvote`);
      setIssues(issues.map((i) =>
        i._id === id ? { ...i, upvotes: res.data.upvotes } : i
      ));
    } catch (err) {
      console.error('Upvote error:', err);
    }
  };

  // Quick status counts for the user
  const counts = {
    total: issues.length,
    pending: issues.filter((i) => i.status === 'Pending').length,
    inProgress: issues.filter((i) => i.status === 'In Progress').length,
    resolved: issues.filter((i) => i.status === 'Resolved').length,
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📋 My Reported Issues</h1>
        <p>Issues you've submitted — track their progress here</p>
      </div>

      {/* User mini-stats */}
      {issues.length > 0 && (
        <div className="my-stats-row">
          <div className="my-stat">
            <span className="my-stat-value">{counts.total}</span>
            <span className="my-stat-label">Total</span>
          </div>
          <div className="my-stat">
            <span className="my-stat-value" style={{ color: '#f59e0b' }}>{counts.pending}</span>
            <span className="my-stat-label">Pending</span>
          </div>
          <div className="my-stat">
            <span className="my-stat-value" style={{ color: '#3b82f6' }}>{counts.inProgress}</span>
            <span className="my-stat-label">In Progress</span>
          </div>
          <div className="my-stat">
            <span className="my-stat-value" style={{ color: '#10b981' }}>{counts.resolved}</span>
            <span className="my-stat-label">Resolved</span>
          </div>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-grid">
          {[1, 2].map((n) => <div key={n} className="skeleton-card" />)}
        </div>
      ) : issues.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>You haven't reported any issues yet</h3>
          <p>Help your community by reporting local problems that need attention.</p>
          <Link to="/report-issue" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
            ➕ Report Your First Issue
          </Link>
        </div>
      ) : (
        <div className="issues-grid">
          {issues.map((issue) => (
            <IssueCard
              key={issue._id}
              issue={issue}
              onDelete={handleDelete}
              onStatusUpdate={handleStatusUpdate}
              onUpvote={handleUpvote}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyIssuesPage;
