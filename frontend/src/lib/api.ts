import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies/sessions
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to handle global API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // We can handle global redirects here, e.g. 401 Unauthorized -> redirect to login
    if (error.response?.status === 401) {
      // Avoid infinite redirects if already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
