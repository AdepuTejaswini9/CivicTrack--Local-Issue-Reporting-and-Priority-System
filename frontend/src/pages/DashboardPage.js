// src/pages/DashboardPage.js
// Main dashboard: stats overview + full issue list with filters

import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import IssueCard from '../components/IssueCard';
import StatsCard from '../components/StatsCard';

const CATEGORIES = ['All', 'Road', 'Water', 'Electricity', 'Sanitation', 'Parks', 'Safety', 'Other'];
const PRIORITIES = ['All', 'High', 'Medium', 'Low'];
const STATUSES = ['All', 'Pending', 'In Progress', 'Resolved'];

const DashboardPage = () => {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [filters, setFilters] = useState({
    category: 'All',
    priority: 'All',
    status: 'All',
    search: '',
  });

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const res = await api.get('/issues/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  // Fetch issues with current filters
  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      // Build query params from filters
      const params = {};
      if (filters.category !== 'All') params.category = filters.category;
      if (filters.priority !== 'All') params.priority = filters.priority;
      if (filters.status !== 'All') params.status = filters.status;
      if (filters.search.trim()) params.search = filters.search.trim();

      const res = await api.get('/issues', { params });
      setIssues(res.data.issues);
    } catch (err) {
      setError('Failed to load issues. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load data on mount and when filters change
  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // Handle issue deletion
  const handleDelete = async (id) => {
    try {
      await api.delete(`/issues/${id}`);
      setIssues(issues.filter((i) => i._id !== id));
      fetchStats(); // Refresh stats
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  // Handle status update (admin)
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await api.put(`/issues/${id}/status`, { status: newStatus });
      setIssues(issues.map((i) => (i._id === id ? res.data.issue : i)));
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  // Handle upvote toggle
  const handleUpvote = async (id) => {
    try {
      const res = await api.post(`/issues/${id}/upvote`);
      setIssues(issues.map((i) =>
        i._id === id
          ? { ...i, upvotes: res.data.upvotes }
          : i
      ));
    } catch (err) {
      console.error('Upvote error:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📊 Community Dashboard</h1>
        <p>Track and manage local issues in your area</p>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="stats-grid">
          <StatsCard icon="📋" label="Total Issues" value={stats.total} color="#6366f1" />
          <StatsCard icon="🕐" label="Pending" value={stats.pending} color="#f59e0b" />
          <StatsCard icon="🔧" label="In Progress" value={stats.inProgress} color="#3b82f6" />
          <StatsCard icon="✅" label="Resolved" value={stats.resolved} color="#10b981" />
        </div>
      )}

      {/* Filters Section */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search issues by title, description, location..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="form-input search-input"
          />
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="form-input filter-select"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="form-input filter-select"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="form-input filter-select"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button
            className="btn-secondary"
            onClick={() => setFilters({ category: 'All', priority: 'All', status: 'All', search: '' })}
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Issues List */}
      <div className="issues-section">
        <div className="section-header">
          <h2>
            {loading ? 'Loading issues...' : `${issues.length} Issue${issues.length !== 1 ? 's' : ''} Found`}
          </h2>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="skeleton-card" />
            ))}
          </div>
        ) : issues.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No issues found</h3>
            <p>Try adjusting your filters or be the first to report an issue!</p>
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
    </div>
  );
};

export default DashboardPage;
