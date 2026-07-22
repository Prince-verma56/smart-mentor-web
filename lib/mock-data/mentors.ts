import type { MentorWithStats } from "@/types/mentor";

// ─── Mock Avatar Colors ───────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#f97316", // orange
];

function pickColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── Mock Mentors ─────────────────────────────────────────────────────────────

export const MOCK_MENTORS: MentorWithStats[] = [
  {
    id: "mentor-1",
    userId: "user-mock",
    name: "React Mentor",
    role: "Senior Frontend Engineer",
    subject: "frontend",
    specialization: "React, Next.js, TypeScript, Performance",
    difficultyLevel: "intermediate",
    learningGoal: "Master React ecosystem and build production-grade apps",
    learningStyle: "hands-on",
    conversationStyle: "encouraging",
    avatarColor: pickColor("React Mentor"),
    teachingSpeed: "moderate",
    responseLength: "detailed",
    preferredLanguage: "English",
    sessionDuration: 45,
    knowledgeFocus: "React hooks, state management, performance optimization",
    status: "active",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    stats: {
      mentorId: "mentor-1",
      totalSessions: 12,
      totalMinutes: 540,
      learningStreak: 5,
      progressPercent: 38,
      currentTopic: "React Server Components",
      lastSessionDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      nextTopicSuggestion: "Suspense & Error Boundaries",
      completedTopics: 8,
      totalTopics: 21,
    },
  },
  {
    id: "mentor-2",
    userId: "user-mock",
    name: "DSA Mentor",
    role: "Competitive Programmer",
    subject: "dsa",
    specialization: "Data Structures, Algorithms, Problem Solving",
    difficultyLevel: "advanced",
    learningGoal: "Crack FAANG-level coding interviews",
    learningStyle: "theoretical",
    conversationStyle: "socratic",
    avatarColor: pickColor("DSA Mentor"),
    teachingSpeed: "moderate",
    responseLength: "comprehensive",
    preferredLanguage: "English",
    sessionDuration: 60,
    knowledgeFocus: "Graphs, Dynamic Programming, Trees",
    status: "active",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    stats: {
      mentorId: "mentor-2",
      totalSessions: 24,
      totalMinutes: 1440,
      learningStreak: 12,
      progressPercent: 61,
      currentTopic: "Dynamic Programming – Knapsack",
      lastSessionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      nextTopicSuggestion: "Graph Shortest Paths",
      completedTopics: 31,
      totalTopics: 51,
    },
  },
  {
    id: "mentor-3",
    userId: "user-mock",
    name: "Career Mentor",
    role: "Engineering Manager at a Top Tech Company",
    subject: "career",
    specialization: "Job Search, Resume, Salary Negotiation, LinkedIn",
    difficultyLevel: "beginner",
    learningGoal: "Land a software engineering role at a top company",
    learningStyle: "mixed",
    conversationStyle: "encouraging",
    avatarColor: pickColor("Career Mentor"),
    teachingSpeed: "slow",
    responseLength: "detailed",
    preferredLanguage: "English",
    sessionDuration: 30,
    knowledgeFocus: "Resume optimization, interview strategy, networking",
    status: "active",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    stats: {
      mentorId: "mentor-3",
      totalSessions: 4,
      totalMinutes: 120,
      learningStreak: 2,
      progressPercent: 15,
      currentTopic: "Crafting a Strong Resume",
      lastSessionDate: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      nextTopicSuggestion: "LinkedIn Profile Optimization",
      completedTopics: 2,
      totalTopics: 14,
    },
  },
];
