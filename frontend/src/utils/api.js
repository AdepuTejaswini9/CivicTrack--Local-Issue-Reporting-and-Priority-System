// src/utils/api.js
// Centralized Axios instance for all API calls

import axios from 'axios';

// FIX: Use relative baseURL so Create React App's proxy (in package.json)
// forwards requests to http://localhost:5000 automatically.
// This avoids CORS issues and works in both dev and production.
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔒 Request Interceptor: Attach JWT token to every request automatically
api.interceptors.request.use(
  (config) => {
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
    if (error.response?.status === 401) {
      localStorage.removeItem('civictrack_token');
      localStorage.removeItem('civictrack_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
