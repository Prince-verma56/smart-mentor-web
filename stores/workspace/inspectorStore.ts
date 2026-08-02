import { create } from 'zustand';

interface InspectorState {
  isOpen: boolean;
  activeTab: 'details' | 'resources' | 'discussion';
  setIsOpen: (isOpen: boolean) => void;
  setActiveTab: (tab: 'details' | 'resources' | 'discussion') => void;
}

export const useInspectorStore = create<InspectorState>()((set) => ({
  isOpen: false,
  activeTab: 'details',
  setIsOpen: (isOpen) => set({ isOpen }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
