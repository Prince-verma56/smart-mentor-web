// ─── Roadmap Types ────────────────────────────────────────────────────────────

export type TopicStatus = "locked" | "available" | "in-progress" | "completed";

export interface RoadmapTopic {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  status: TopicStatus;
  order: number;
  subtopics?: string[];
  resourceLinks?: string[];
}

export interface RoadmapPhase {
  id: string;
  title: string;
  description: string;
  order: number;
  topics: RoadmapTopic[];
  completedCount: number;
  totalCount: number;
}

export interface MentorRoadmap {
  mentorId: string;
  title: string;
  description: string;
  totalEstimatedHours: number;
  phases: RoadmapPhase[];
  currentTopicId?: string;
  lastUpdated: string;
}
