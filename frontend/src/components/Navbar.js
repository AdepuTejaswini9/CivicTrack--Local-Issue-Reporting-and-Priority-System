// src/components/Navbar.js
// Top navigation bar with links and logout button

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">
          <span className="brand-icon">🏙️</span>
          <span className="brand-text">CivicTrack</span>
        </Link>
      </div>

      {/* Hamburger for mobile */}
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>

      <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        <Link
          to="/dashboard"
          className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          onClick={() => setMenuOpen(false)}
        >
          📊 Dashboard
        </Link>
        <Link
          to="/report-issue"
          className={`nav-link ${isActive('/report-issue') ? 'active' : ''}`}
          onClick={() => setMenuOpen(false)}
        >
          ➕ Report Issue
        </Link>
        <Link
          to="/my-issues"
          className={`nav-link ${isActive('/my-issues') ? 'active' : ''}`}
          onClick={() => setMenuOpen(false)}
        >
          📋 My Issues
        </Link>

        <div className="nav-user">
          <span className="user-badge">
            {isAdmin ? '🛡️ Admin' : '👤'} {user?.name}
          </span>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
