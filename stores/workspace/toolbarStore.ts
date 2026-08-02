import { create } from 'zustand';

interface ToolbarState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  filterDifficulty: string | null;
  setFilterDifficulty: (difficulty: string | null) => void;
}

export const useToolbarStore = create<ToolbarState>()((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  filterDifficulty: null,
  setFilterDifficulty: (difficulty) => set({ filterDifficulty: difficulty }),
}));
