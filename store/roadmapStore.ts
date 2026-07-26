import { create } from 'zustand';

export type MilestoneStatus = 'locked' | 'available' | 'active' | 'completed';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  estimated_time: string;
  status: MilestoneStatus;
  summary_metric: string;
  coordinates?: { x: number, y: number }; // Percentage-based positioning
}

interface RoadmapState {
  milestones: Milestone[];
  activeNodeId: string | null;
  setMilestones: (milestones: Milestone[]) => void;
  setActiveNodeId: (id: string | null) => void;
}

export const useRoadmapStore = create<RoadmapState>((set) => ({
  milestones: [],
  activeNodeId: null,
  setMilestones: (milestones) => set({ milestones }),
  setActiveNodeId: (id) => set({ activeNodeId: id }),
}));
