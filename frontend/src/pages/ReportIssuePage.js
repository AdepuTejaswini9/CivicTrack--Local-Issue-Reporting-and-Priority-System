// src/pages/ReportIssuePage.js
// Form for creating a new issue report with image upload

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const CATEGORIES = ['Road', 'Water', 'Electricity', 'Sanitation', 'Parks', 'Safety', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const ReportIssuePage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Medium',
    location: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // Handle image selection and show preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setImageFile(file);
      // Create a local URL to preview the image before uploading
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate required fields
    if (!formData.title || !formData.description || !formData.category || !formData.location) {
      return setError('Please fill all required fields');
    }

    setLoading(true);

    try {
      // Use FormData to send both text fields AND file
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('priority', formData.priority);
      data.append('location', formData.location);
      if (imageFile) {
        data.append('image', imageFile); // Must match multer field name
      }

      // Send with multipart/form-data content type for file upload
      await api.post('/issues', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('✅ Issue reported successfully! Redirecting...');

      // Reset form
      setFormData({ title: '', description: '', category: '', priority: 'Medium', location: '' });
      setImageFile(null);
      setImagePreview('');

      // Go to dashboard after short delay
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>➕ Report an Issue</h1>
        <p>Help your community by reporting local problems that need attention</p>
      </div>

      <div className="form-container">
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="issue-form">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">
              Issue Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Large pothole on Main Street"
              className="form-input"
              maxLength={100}
            />
            <span className="char-count">{formData.title.length}/100</span>
          </div>

          {/* Category + Priority (side by side) */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">
                Category <span className="required">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">-- Select Category --</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority Level</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-input"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label htmlFor="location">
              Location <span className="required">*</span>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., 123 Main St, Downtown, Near City Park"
              className="form-input"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the issue in detail. Include when you noticed it, how severe it is, etc."
              className="form-input form-textarea"
              rows={5}
              maxLength={1000}
            />
            <span className="char-count">{formData.description.length}/1000</span>
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label>Photo Evidence (Optional)</label>
            <div className="upload-area">
              {imagePreview ? (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                  <button type="button" className="btn-remove-image" onClick={removeImage}>
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <label htmlFor="image" className="upload-label">
                  <span className="upload-icon">📷</span>
                  <span>Click to upload image</span>
                  <span className="upload-hint">JPEG, PNG, GIF, WebP — Max 5MB</span>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Priority visual indicator */}
          <div className={`priority-indicator priority-${formData.priority.toLowerCase()}`}>
            <strong>Priority:</strong> {formData.priority === 'High' ? '🔴 High — Requires immediate attention' : formData.priority === 'Medium' ? '🟡 Medium — Should be addressed soon' : '🟢 Low — Can be scheduled'}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '⏳ Submitting...' : '📤 Submit Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportIssuePage;
