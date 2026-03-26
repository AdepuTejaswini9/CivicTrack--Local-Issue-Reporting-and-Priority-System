// src/context/AuthContext.js
// Global authentication state using React Context

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

// Create the context
const AuthContext = createContext(null);

// Provider component wraps the entire app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Check localStorage on startup

  // On app load: restore user session from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('civictrack_user');
    const storedToken = localStorage.getItem('civictrack_token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login: save token and user to state + localStorage
  const login = (token, userData) => {
    localStorage.setItem('civictrack_token', token);
    localStorage.setItem('civictrack_user', JSON.stringify(userData));
    setUser(userData);
  };

  // Logout: clear everything
  const logout = () => {
    localStorage.removeItem('civictrack_token');
    localStorage.removeItem('civictrack_user');
    setUser(null);
  };

  // Check if current user is admin
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
