import { create } from 'zustand';

interface SidebarState {
  isOpen: boolean;
  activeTab: 'outline' | 'info' | 'stats' | 'ai';
  setIsOpen: (isOpen: boolean) => void;
  setActiveTab: (tab: 'outline' | 'info' | 'stats' | 'ai') => void;
}

export const useSidebarStore = create<SidebarState>()((set) => ({
  isOpen: true,
  activeTab: 'outline',
  setIsOpen: (isOpen) => set({ isOpen }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
