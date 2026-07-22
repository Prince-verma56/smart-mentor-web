import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mentors")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("mentors") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createMentor = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    role: v.string(),
    subject: v.string(),
    teachingStyle: v.string(),
    preferredLanguage: v.string(),
    learningGoal: v.string(),
    sessionDuration: v.number(),
    avatarUrl: v.optional(v.string()),
    avatarColor: v.string(),
    voiceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("mentors", {
      ...args,
      progressPercent: 0,
      completedTopics: 0,
      totalTopics: 10, // Default for now
      totalSessions: 0,
      totalMinutes: 0,
      learningStreak: 0,
      currentTopic: "Introduction",
      createdAt: now,
      updatedAt: now,
    });
  },
});
