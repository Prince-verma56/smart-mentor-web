import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getRoadmap = query({
  args: { mentorId: v.id("mentors") },
  handler: async (ctx: any, args: any) => {
    const roadmap = await ctx.db
      .query("roadmaps")
      .withIndex("by_mentor", (q: any) => q.eq("mentorId", args.mentorId))
      .first();

    if (!roadmap) return null;

    const topics = await ctx.db
      .query("topics")
      .withIndex("by_roadmap", (q: any) => q.eq("roadmapId", roadmap._id))
      .collect();

    topics.sort((a: any, b: any) => a.orderIndex - b.orderIndex);

    return { roadmap, topics };
  },
});

export const createRoadmap = mutation({
  args: {
    mentorId: v.id("mentors"),
    title: v.string(),
    description: v.string(),
    topics: v.array(v.object({
      title: v.string(),
      description: v.string(),
      orderIndex: v.number(),
      status: v.string(),
    }))
  },
  handler: async (ctx: any, args: any) => {
    const roadmapId = await ctx.db.insert("roadmaps", {
      mentorId: args.mentorId,
      title: args.title,
      description: args.description,
      updatedAt: new Date().toISOString(),
    });

    for (const topic of args.topics) {
      await ctx.db.insert("topics", {
        roadmapId,
        mentorId: args.mentorId,
        title: topic.title,
        description: topic.description,
        orderIndex: topic.orderIndex,
        status: topic.status,
      });
    }

    // Update mentor totalTopics
    await ctx.db.patch(args.mentorId, {
      totalTopics: args.topics.length,
      completedTopics: 0,
      progressPercent: 0,
    });

    return roadmapId;
  },
});

export const updateTopicStatus = mutation({
  args: {
    topicId: v.id("topics"),
    status: v.string(), // The new status (e.g. "completed" or "available")
  },
  handler: async (ctx: any, args: any) => {
    const topic = await ctx.db.get(args.topicId);
    if (!topic) throw new Error("Topic not found");

    const isCompleting = args.status === "completed";
    
    // Update the topic itself
    await ctx.db.patch(args.topicId, { status: args.status });

    // If completing, unlock the next topic
    if (isCompleting) {
      const nextTopic = await ctx.db
        .query("topics")
        .withIndex("by_roadmap", (q: any) => q.eq("roadmapId", topic.roadmapId))
        .filter((q: any) => q.eq(q.field("orderIndex"), topic.orderIndex + 1))
        .first();

      if (nextTopic && nextTopic.status === "locked") {
        await ctx.db.patch(nextTopic._id, { status: "in-progress" });
      }
    }

    // Re-calculate mentor progress
    const allTopics = await ctx.db
      .query("topics")
      .withIndex("by_mentor", (q: any) => q.eq("mentorId", topic.mentorId))
      .collect();
      
    const completedTopics = allTopics.filter((t: any) => t.status === "completed").length;
    const totalTopics = allTopics.length;
    const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    
    const currentTopicObj = allTopics.find((t: any) => t.status === "in-progress");
    const currentTopic = currentTopicObj ? currentTopicObj.title : "All Completed!";

    await ctx.db.patch(topic.mentorId, {
      completedTopics,
      progressPercent,
      currentTopic
    });

    return { success: true, newStatus: args.status };
  },
});
