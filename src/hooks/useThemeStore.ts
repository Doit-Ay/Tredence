import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: (localStorage.getItem('wf-theme') as Theme) || 'light',

  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('wf-theme', next);
    document.documentElement.setAttribute('data-theme', next);
    set({ theme: next });
  },
}));

// Initialize theme on load
const saved = localStorage.getItem('wf-theme') || 'light';
document.documentElement.setAttribute('data-theme', saved);
