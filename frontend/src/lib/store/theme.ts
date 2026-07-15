import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggleDark: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false, // Default to light theme as requested
      toggleDark: () => set((state) => ({ isDark: !state.isDark })),
    }),
    { name: 'theme-storage' }
  )
);
