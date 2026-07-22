import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  mentors: defineTable({
    userId: v.string(), // Clerk user ID
    name: v.string(),
    role: v.string(),
    subject: v.string(), // "frontend", "backend", etc.
    teachingStyle: v.string(),
    preferredLanguage: v.string(),
    avatarUrl: v.optional(v.string()),
    avatarColor: v.string(),
    voiceId: v.optional(v.string()), // VAPI Assistant ID
    learningGoal: v.string(),
    sessionDuration: v.number(),
    
    // Stats embedded for easy access
    progressPercent: v.number(),
    completedTopics: v.number(),
    totalTopics: v.number(),
    totalSessions: v.number(),
    totalMinutes: v.number(),
    learningStreak: v.number(),
    currentTopic: v.string(),
    lastSessionDate: v.optional(v.string()),

    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_userId", ["userId"]),
  
  // Future tables for resources, sessions, messages, etc.
});
