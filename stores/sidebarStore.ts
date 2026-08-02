import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  collapsed: boolean;
  setCollapsed: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false, // Default to open
      setCollapsed: (val) => set((state) => ({
        collapsed: typeof val === 'function' ? val(state.collapsed) : val
      })),
    }),
    {
      name: 'mentor-sidebar-state',
    }
  )
);
