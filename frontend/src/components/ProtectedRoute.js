// src/components/ProtectedRoute.js
// Redirects unauthenticated users to login page

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show nothing while checking auth state
  if (loading) return <div className="loading-screen">Loading...</div>;

  // Redirect to login if not authenticated
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
