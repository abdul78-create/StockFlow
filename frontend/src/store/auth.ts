import { create } from 'zustand';
import { api } from '../lib/api';
import { useWorkspaceStore } from './workspace';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  sessionExpired: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false, error: null }),
  
  checkAuth: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/auth/me').catch(() => null);
      if (response?.data?.success) {
        const data = response.data.data;
        useWorkspaceStore.getState().setOrganizations(data.organizations || []);
        set({ user: data, isAuthenticated: true });
      }
    } catch (error) {
      // Ignore
    } finally {
      set({ isLoading: false });
    }
  },
  
  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data?.success) {
        const data = response.data.data;
        useWorkspaceStore.getState().setOrganizations(data.organizations || []);
        set({ user: data.user, isAuthenticated: true });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Invalid email or password.';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  googleLogin: async (idToken) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/auth/google', { idToken });
      
      if (response.data?.success) {
        const data = response.data.data;
        useWorkspaceStore.getState().setOrganizations(data.organizations || []);
        set({ user: data.user, isAuthenticated: true });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Google Authentication failed.';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (firstName, lastName, email, password) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/auth/signup', { firstName, lastName, email, password });
      
      if (response.data?.success) {
        const data = response.data.data;
        useWorkspaceStore.getState().setOrganizations(data.organizations || []);
        set({ user: data.user, isAuthenticated: true });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to sign up.';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await api.post('/auth/logout');
      useWorkspaceStore.getState().clearWorkspace();
      set({ user: null, isAuthenticated: false, error: null });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      set({ isLoading: false });
    }
  },

  sessionExpired: () => {
    useWorkspaceStore.getState().clearWorkspace();
    set({ user: null, isAuthenticated: false, error: 'Your session has expired.' });
    window.location.href = '/unauthorized';
  },
}));
