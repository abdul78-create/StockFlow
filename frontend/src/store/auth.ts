import { create } from 'zustand';
import { api } from '../lib/api';
import { Role } from '../config/navigation';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  organizationId: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  sessionExpired: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false, // Don't start loading immediately for mock
  error: null,
  
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false, error: null }),
  
  checkAuth: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/auth/me').catch(() => null);
      if (response?.data?.success) {
        set({ user: response.data.data, isAuthenticated: true });
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
        const user = response.data.data.user;
        set({ user, isAuthenticated: true });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Invalid email or password.';
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await api.post('/auth/logout');
      set({ user: null, isAuthenticated: false, error: null });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      set({ isLoading: false });
    }
  },

  sessionExpired: () => {
    set({ user: null, isAuthenticated: false, error: 'Your session has expired.' });
    window.location.href = '/unauthorized';
  },
}));
