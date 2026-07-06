import axios from 'axios';
import { useWorkspaceStore } from '../store/workspace';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies/sessions
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject workspace ID
api.interceptors.request.use((config) => {
  try {
    // Primary: read directly from in-memory Zustand store (no localStorage race condition)
    const activeWorkspaceId = useWorkspaceStore.getState().activeWorkspaceId;
    if (activeWorkspaceId) {
      config.headers['x-organization-id'] = activeWorkspaceId;
    } else {
      // Fallback: read from persisted localStorage in case store isn't hydrated yet
      const workspaceData = localStorage.getItem('stockflow-workspace');
      if (workspaceData) {
        const { state } = JSON.parse(workspaceData);
        if (state?.activeWorkspaceId) {
          config.headers['x-organization-id'] = state.activeWorkspaceId;
        }
      }
    }
  } catch (e) {
    // ignore
  }
  return config;
});

// Interceptor to handle global API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const publicPaths = ['/', '/login', '/signup', '/forgot-password'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
