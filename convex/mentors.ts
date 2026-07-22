import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx: any, args: any) => {
    return await ctx.db
      .query("mentors")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("mentors") },
  handler: async (ctx: any, args: any) => {
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
    description: v.optional(v.string()),
    difficulty: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
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
export const updateMentor = mutation({
  args: {
    id: v.id("mentors"),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    subject: v.optional(v.string()),
    teachingStyle: v.optional(v.string()),
    description: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
    welcomeMessage: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    temperature: v.optional(v.number()),
    maxTokens: v.optional(v.number()),
    visibility: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return await ctx.db.get(id);
  },
});

export const deleteMentor = mutation({
  args: { id: v.id("mentors") },
  handler: async (ctx: any, args: any) => {
    // Delete all chats for this mentor
    const chats = await ctx.db
      .query("chat_sessions")
      .withIndex("by_mentor_user", (q: any) => q.eq("mentorId", args.id))
      .collect();
      
    for (const chat of chats) {
      // delete messages
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_session", (q: any) => q.eq("sessionId", chat._id))
        .collect();
      for (const msg of messages) {
        await ctx.db.delete(msg._id);
      }
      await ctx.db.delete(chat._id);
    }
    
    await ctx.db.delete(args.id);
  },
});
