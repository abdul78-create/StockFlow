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
      // In a real app, this hits /auth/me
      // For this UX mock, we assume not authenticated unless set manually
      const response = await api.get('/auth/me').catch(() => null);
      if (response?.data?.success) {
        set({ user: response.data.data, isAuthenticated: true });
      } else {
        // We do not overwrite if user is already set (for mock purposes)
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
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock validation
      if (email === 'admin@test.com' && password === 'password') {
        const mockUser: User = {
          id: '1',
          email,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          organizationId: 'org_1',
        };
        set({ user: mockUser, isAuthenticated: true });
      } else {
        set({ error: 'Invalid email or password. Try admin@test.com / password' });
      }
    } catch (err) {
      set({ error: 'A network error occurred. Please try again later.' });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      // await api.post('/auth/logout');
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ user: null, isAuthenticated: false, error: null });
      // window.location.href = '/login';
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
