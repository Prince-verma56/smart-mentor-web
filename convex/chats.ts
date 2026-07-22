import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getSessions = query({
  args: { mentorId: v.id("mentors"), userId: v.string() },
  handler: async (ctx: any, args: any) => {
    return await ctx.db
      .query("chat_sessions")
      .withIndex("by_mentor_user", (q: any) => 
        q.eq("mentorId", args.mentorId).eq("userId", args.userId)
      )
      .order("desc")
      .collect();
  },
});

export const createSession = mutation({
  args: {
    mentorId: v.id("mentors"),
    userId: v.string(),
    title: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("chat_sessions", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const deleteSession = mutation({
  args: {
    sessionId: v.id("chat_sessions"),
    userId: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== args.userId) {
      throw new Error("Unauthorized or session not found");
    }
    
    // Get all messages and delete them
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_session", (q: any) => q.eq("sessionId", args.sessionId))
      .collect();
      
    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
    
    await ctx.db.delete(args.sessionId);
    return true;
  },
});

export const getMessages = query({
  args: { sessionId: v.id("chat_sessions") },
  handler: async (ctx: any, args: any) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_session", (q: any) => q.eq("sessionId", args.sessionId))
      .collect();
  },
});

export const saveMessage = mutation({
  args: {
    sessionId: v.id("chat_sessions"),
    role: v.string(),
    content: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const now = new Date().toISOString();
    const messageId = await ctx.db.insert("messages", {
      ...args,
      createdAt: now,
    });
    
    // Update session timestamp
    await ctx.db.patch(args.sessionId, { updatedAt: now });
    
    return messageId;
  },
});

export const updateSessionTitle = mutation({
  args: {
    sessionId: v.id("chat_sessions"),
    userId: v.string(),
    title: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== args.userId) {
      throw new Error("Unauthorized or session not found");
    }
    await ctx.db.patch(args.sessionId, {
      title: args.title,
      updatedAt: new Date().toISOString(),
    });
  },
});
