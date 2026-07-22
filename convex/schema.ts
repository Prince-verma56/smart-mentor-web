import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  mentors: defineTable({
    userId: v.string(), // Clerk user ID
    name: v.string(),
    role: v.string(),
    subject: v.string(), // "frontend", "backend", etc. (Expertise)
    teachingStyle: v.string(), // Personality
    preferredLanguage: v.string(),
    avatarUrl: v.optional(v.string()),
    avatarColor: v.string(),
    voiceId: v.optional(v.string()), // VAPI Assistant ID
    learningGoal: v.string(),
    sessionDuration: v.number(),
    
    // Mentor Settings
    description: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
    welcomeMessage: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    temperature: v.optional(v.number()),
    maxTokens: v.optional(v.number()),
    visibility: v.optional(v.string()), // "private", "public"
    
    // Stats embedded for easy access
    progressPercent: v.number(),
    completedTopics: v.number(),
    totalTopics: v.number(),
    totalSessions: v.number(),
    totalMinutes: v.number(),
    learningStreak: v.number(),
    currentTopic: v.string(),
    lastSessionDate: v.optional(v.string()),
    
    // Additional Stats requested
    messagesCount: v.optional(v.number()),
    questionsAsked: v.optional(v.number()),
    filesUploaded: v.optional(v.number()),
    projectsCompleted: v.optional(v.number()),

    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_userId", ["userId"]),
  
  chat_sessions: defineTable({
    mentorId: v.id("mentors"),
    userId: v.string(),
    title: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_mentor_user", ["mentorId", "userId"]),

  messages: defineTable({
    sessionId: v.id("chat_sessions"),
    role: v.string(), // "user" | "assistant" | "system"
    content: v.string(),
    createdAt: v.string(),
  }).index("by_session", ["sessionId"]),

  roadmaps: defineTable({
    mentorId: v.id("mentors"),
    title: v.string(),
    description: v.string(),
    updatedAt: v.optional(v.string()),
  }).index("by_mentor", ["mentorId"]),

  topics: defineTable({
    roadmapId: v.id("roadmaps"),
    mentorId: v.id("mentors"),
    title: v.string(),
    description: v.optional(v.string()),
    orderIndex: v.number(),
    status: v.string(), // "locked" | "in-progress" | "completed"
  }).index("by_roadmap", ["roadmapId"]).index("by_mentor", ["mentorId"]),
});
