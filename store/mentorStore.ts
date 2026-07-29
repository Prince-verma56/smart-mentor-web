import { create } from "zustand";

interface MentorWorkspaceState {
  workflowStatus: "idle" | "processing" | "error";
  setWorkflowStatus: (status: "idle" | "processing" | "error") => void;
}

export const useMentorStore = create<MentorWorkspaceState>((set) => ({
  workflowStatus: "idle",
  setWorkflowStatus: (status) => set({ workflowStatus: status }),
}));
