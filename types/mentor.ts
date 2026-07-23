// ─── Mentor Types ─────────────────────────────────────────────────────────────

export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";
export type LearningStyle = "visual" | "hands-on" | "theoretical" | "mixed";
export type ConversationStyle = "encouraging" | "strict" | "socratic" | "casual";
export type TeachingSpeed = "slow" | "moderate" | "fast";
export type ResponseLength = "concise" | "detailed" | "comprehensive";
export type MentorSubject =
  | "frontend"
  | "backend"
  | "fullstack"
  | "devops"
  | "machine-learning"
  | "data-science"
  | "dsa"
  | "system-design"
  | "career"
  | "interview"
  | "communication"
  | "english"
  | "resume"
  | "startup"
  | "fitness"
  | "custom";

export type MentorMode = "conversation" | "live-teaching";
export type MentorStatus = "active" | "archived" | "paused";

// ─── Core Mentor Model ────────────────────────────────────────────────────────

export interface Mentor {
  id: string;
  userId: string;
  name: string;
  role: string;
  subject: MentorSubject;
  specialization: string;
  difficultyLevel: DifficultyLevel;
  learningGoal: string;
  learningStyle: LearningStyle;
  conversationStyle: ConversationStyle;
  
  // Voice AI extension point
  voiceId?: string;
  voiceProvider?: string;
  voiceModel?: string;
  voiceLanguage?: string;
  voiceGreeting?: string;
  voiceSpeed?: number;
  voiceTemperature?: number;
  voiceInterruptions?: boolean;
  voiceAutoStart?: boolean;
  
  avatarUrl?: string;
  avatarColor: string; // fallback color for initials avatar
  teachingSpeed: TeachingSpeed;
  responseLength: ResponseLength;
  preferredLanguage: string;
  sessionDuration: number; // in minutes
  knowledgeFocus: string;
  additionalInstructions?: string;
  goalDeadline?: string; // ISO date string
  status: MentorStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Mentor Creation Form ─────────────────────────────────────────────────────

export interface CreateMentorStep1 {
  name: string;
  subject: MentorSubject;
  role: string;
  specialization: string;
}

export interface CreateMentorStep2 {
  difficultyLevel: DifficultyLevel;
  learningStyle: LearningStyle;
  conversationStyle: ConversationStyle;
  teachingSpeed: TeachingSpeed;
  responseLength: ResponseLength;
}

export interface CreateMentorStep3 {
  learningGoal: string;
  sessionDuration: number;
  preferredLanguage: string;
  knowledgeFocus: string;
  additionalInstructions?: string;
  goalDeadline?: string;
}

export type CreateMentorData = CreateMentorStep1 & CreateMentorStep2 & CreateMentorStep3;

// ─── Mentor Stats (for dashboard card) ───────────────────────────────────────

export interface MentorStats {
  mentorId: string;
  totalSessions: number;
  totalMinutes: number;
  learningStreak: number; // consecutive days
  progressPercent: number;
  currentTopic: string;
  lastSessionDate?: string;
  nextTopicSuggestion?: string;
  completedTopics: number;
  totalTopics: number;
  messagesCount?: number;
  questionsAsked?: number;
  filesUploaded?: number;
  projectsCompleted?: number;
}

// ─── Mentor with Stats (for card display) ────────────────────────────────────

export interface MentorWithStats extends Mentor {
  stats: MentorStats;
}
