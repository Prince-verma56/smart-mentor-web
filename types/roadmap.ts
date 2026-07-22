// ─── Learning State Engine Types ─────────────────────────────────────────────

export type TopicStatus =
  | "locked"
  | "available"
  | "in-progress"
  | "completed"
  | "skipped"
  | "revision-required";

export interface RoadmapTopic {
  id: string;
  roadmap_id?: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimated_minutes: number;
  order_index: number;
  status: TopicStatus;
  prerequisites?: string[];
  completed_at?: string | null;
  notes?: string | null;
  revision_required?: boolean;
  quiz_score?: number | null;
  confidence_score?: number | null;
  is_skipped?: boolean;
  progress_percent?: number;
  // UI helpers (computed)
  isCurrentTopic?: boolean;
}

export interface RoadmapPhase {
  id: string;
  title: string;
  description: string;
  order: number;
  topics: RoadmapTopic[];
  completedCount: number;
  totalCount: number;
  progressPercent?: number;
}

export interface MentorRoadmap {
  id?: string;
  mentorId: string;
  title: string;
  description: string;
  total_estimated_hours?: number;
  progress_percent?: number;
  phases: RoadmapPhase[];
  currentTopicId?: string;
  currentTopic?: RoadmapTopic | null;
  lastUpdated?: string;
}

// ─── Learning State (from Learning State Engine) ──────────────────────────────

export interface LearningState {
  mentorId: string;
  userId: string;
  // Current position
  currentTopic: RoadmapTopic | null;
  currentTopicIndex: number;
  // Progress
  completedTopics: RoadmapTopic[];
  remainingTopics: RoadmapTopic[];
  skippedTopics: RoadmapTopic[];
  revisionTopics: RoadmapTopic[];
  // Metrics
  totalTopics: number;
  completedCount: number;
  progressPercent: number;
  // For AI context
  allTopics: RoadmapTopic[];
  roadmapTitle: string;
  roadmapDescription: string;
  // Session
  recentMessages: { role: string; content: string }[];
  sessionCount: number;
  messagesCount: number;
}
