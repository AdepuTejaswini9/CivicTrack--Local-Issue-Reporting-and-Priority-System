// src/utils/api.js
// Centralized Axios instance for all API calls

import axios from 'axios';

// Create a reusable axios instance pointing to our backend
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔒 Request Interceptor: Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (stored on login)
    const token = localStorage.getItem('civictrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔄 Response Interceptor: Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token is expired or invalid, clear storage and redirect
    if (error.response?.status === 401) {
      localStorage.removeItem('civictrack_token');
      localStorage.removeItem('civictrack_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
