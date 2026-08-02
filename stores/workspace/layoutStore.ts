import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LayoutMode, ThemeMode } from './types';

interface LayoutState {
  layoutMode: LayoutMode;
  theme: ThemeMode;
  setLayoutMode: (mode: LayoutMode) => void;
  setTheme: (theme: ThemeMode) => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      layoutMode: 'hierarchy',
      theme: 'cyber',
      setLayoutMode: (mode) => set({ layoutMode: mode }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'layout-storage' }
  )
);
