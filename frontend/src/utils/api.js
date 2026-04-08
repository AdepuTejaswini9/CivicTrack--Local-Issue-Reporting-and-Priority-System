// src/utils/api.js
import axios from 'axios';

// Direct URL to backend — most reliable, avoids CRA proxy issues
const API_BASE = 'https://civictrack-backend-y1vm.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10 second timeout
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('civictrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🌐 API ${config.method?.toUpperCase()} → ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses and auth errors
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response ${response.status} ← ${response.config.url}`);
    return response;
  },
  (error) => {
    const msg = error.response?.data?.message || error.message;
    console.error(`❌ API Error: ${msg}`);
    if (error.response?.status === 401) {
      localStorage.removeItem('civictrack_token');
      localStorage.removeItem('civictrack_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
