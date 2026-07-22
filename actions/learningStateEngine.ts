// ─── Learning State Engine ─────────────────────────────────────────────────────

/**
 * ============================================================
 * LEARNING STATE ENGINE
 * The single source of truth for every mentor's learning state.
 * Every AI response must call buildLearningState() first.
 * ============================================================
 */

import { supabase } from "@/lib/supabase";
import type { LearningState, RoadmapTopic } from "@/types/roadmap";

// ─── Build Full Learning State ────────────────────────────────────────────────

export async function buildLearningState(
  mentorId: string,
  userId: string,
  sessionId?: string | null
): Promise<LearningState | null> {
  try {
    // 1. Fetch the mentor's roadmap
    const { data: roadmap, error: roadmapError } = await supabase
      .from("roadmaps")
      .select("id, title, description, progress_percent")
      .eq("mentor_id", mentorId)
      .single();

    if (roadmapError || !roadmap) {
      // No roadmap yet — return minimal state
      return {
        mentorId,
        userId,
        currentTopic: null,
        currentTopicIndex: -1,
        completedTopics: [],
        remainingTopics: [],
        skippedTopics: [],
        revisionTopics: [],
        totalTopics: 0,
        completedCount: 0,
        progressPercent: 0,
        allTopics: [],
        roadmapTitle: "Learning Roadmap",
        roadmapDescription: "Your personalized roadmap is being generated.",
        recentMessages: [],
        sessionCount: 0,
        messagesCount: 0,
      };
    }

    // 2. Fetch all topics in order
    const { data: topics, error: topicsError } = await supabase
      .from("roadmap_topics")
      .select("*")
      .eq("roadmap_id", roadmap.id)
      .order("order_index", { ascending: true });

    const allTopics: RoadmapTopic[] = (topics || []).map((t: any) => ({
      id: t.id,
      roadmap_id: t.roadmap_id,
      title: t.title,
      description: t.description || "",
      difficulty: t.difficulty || "beginner",
      estimated_minutes: t.estimated_minutes || 30,
      order_index: t.order_index,
      status: t.status,
      prerequisites: t.prerequisites || [],
      completed_at: t.completed_at,
      notes: t.notes,
      revision_required: t.revision_required,
      quiz_score: t.quiz_score,
      confidence_score: t.confidence_score,
      is_skipped: t.is_skipped,
      progress_percent: t.progress_percent || 0,
    }));

    // 3. Categorize topics
    const completedTopics = allTopics.filter((t) => t.status === "completed");
    const skippedTopics = allTopics.filter((t) => t.status === "skipped");
    const revisionTopics = allTopics.filter((t) => t.status === "revision-required");
    const currentTopic = allTopics.find((t) => t.status === "in-progress") || null;
    const currentTopicIndex = currentTopic
      ? allTopics.findIndex((t) => t.id === currentTopic.id)
      : -1;
    const remainingTopics = allTopics.filter(
      (t) => t.status === "locked" || t.status === "available"
    );

    const progressPercent =
      allTopics.length > 0
        ? Math.round((completedTopics.length / allTopics.length) * 100)
        : 0;

    // 4. Fetch recent conversation messages (last 15 for context)
    let recentMessages: { role: string; content: string }[] = [];
    if (sessionId) {
      const { data: messages } = await supabase
        .from("messages")
        .select("role, content")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false })
        .limit(15);

      recentMessages = (messages || []).reverse().map((m: any) => ({
        role: m.role,
        content: m.content,
      }));
    }

    // 5. Fetch stats
    const { count: sessionCount } = await supabase
      .from("chat_sessions")
      .select("id", { count: "exact", head: true })
      .eq("mentor_id", mentorId)
      .eq("user_id", userId);

    const { count: messagesCount } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .in(
        "session_id",
        (
          await supabase
            .from("chat_sessions")
            .select("id")
            .eq("mentor_id", mentorId)
            .eq("user_id", userId)
        ).data?.map((s: any) => s.id) || []
      );

    return {
      mentorId,
      userId,
      currentTopic,
      currentTopicIndex,
      completedTopics,
      remainingTopics,
      skippedTopics,
      revisionTopics,
      totalTopics: allTopics.length,
      completedCount: completedTopics.length,
      progressPercent,
      allTopics,
      roadmapTitle: roadmap.title,
      roadmapDescription: roadmap.description || "",
      recentMessages,
      sessionCount: sessionCount || 0,
      messagesCount: messagesCount || 0,
    };
  } catch (error) {
    console.error("[LearningStateEngine] Failed to build learning state:", error);
    return null;
  }
}

// ─── Build Context String for AI Prompt ──────────────────────────────────────

export function buildContextString(state: LearningState): string {
  const completedList =
    state.completedTopics.length > 0
      ? state.completedTopics.map((t) => `  ✔ ${t.title}`).join("\n")
      : "  (none yet)";

  const currentInfo = state.currentTopic
    ? `  ➡ ${state.currentTopic.title} (ID: ${state.currentTopic.id})\n     Difficulty: ${state.currentTopic.difficulty}, ~${state.currentTopic.estimated_minutes} min`
    : "  (no active topic)";

  const remainingList =
    state.remainingTopics.length > 0
      ? state.remainingTopics
          .slice(0, 5)
          .map((t) => `  🔒 ${t.title}`)
          .join("\n")
      : "  (all topics completed!)";

  const revisionList =
    state.revisionTopics.length > 0
      ? state.revisionTopics.map((t) => `  ⚠ ${t.title}`).join("\n")
      : "";

  return `
=== LEARNING STATE (Read from Database — Do NOT guess) ===
Roadmap: "${state.roadmapTitle}"
Progress: ${state.completedCount}/${state.totalTopics} topics (${state.progressPercent}%)

COMPLETED TOPICS:
${completedList}

CURRENT ACTIVE TOPIC:
${currentInfo}

NEXT TOPICS (Locked):
${remainingList}

${revisionList ? `NEEDS REVISION:\n${revisionList}\n` : ""}
Total Sessions: ${state.sessionCount} | Total Messages: ${state.messagesCount}
=== END LEARNING STATE ===`;
}

// ─── Update Topic Status ──────────────────────────────────────────────────────

export async function updateTopicStatus(
  topicId: string,
  newStatus: string,
  completedAt?: string
) {
  const updates: Record<string, any> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (newStatus === "completed" && completedAt) {
    updates.completed_at = completedAt;
  }
  if (newStatus === "revision-required") {
    updates.revision_required = true;
  }
  if (newStatus === "skipped") {
    updates.is_skipped = true;
  }

  const { data: topic, error: fetchError } = await supabase
    .from("roadmap_topics")
    .select("id, roadmap_id, order_index")
    .eq("id", topicId)
    .single();

  if (fetchError || !topic) return { error: "Topic not found" };

  const { error } = await supabase
    .from("roadmap_topics")
    .update(updates)
    .eq("id", topicId);

  if (error) {
    console.error("[LearningStateEngine] Failed to update topic:", error);
    return { error: "Failed to update topic status" };
  }

  // If completing: unlock the next topic
  if (newStatus === "completed") {
    const { data: nextTopic } = await supabase
      .from("roadmap_topics")
      .select("id, status")
      .eq("roadmap_id", topic.roadmap_id)
      .eq("order_index", topic.order_index + 1)
      .single();

    if (nextTopic && nextTopic.status === "locked") {
      await supabase
        .from("roadmap_topics")
        .update({ status: "in-progress", updated_at: new Date().toISOString() })
        .eq("id", nextTopic.id);
    }
  }

  return { success: true };
}

// ─── Get Real Mentor Stats ────────────────────────────────────────────────────

export async function getRealMentorStats(mentorId: string, userId: string) {
  // 1. Get roadmap and topics
  const { data: roadmap } = await supabase
    .from("roadmaps")
    .select("id, title, progress_percent")
    .eq("mentor_id", mentorId)
    .single();

  let currentTopic = "Introduction";
  let completedTopics = 0;
  let totalTopics = 0;
  let progressPercent = 0;

  if (roadmap) {
    const { data: topics } = await supabase
      .from("roadmap_topics")
      .select("id, title, status, order_index")
      .eq("roadmap_id", roadmap.id)
      .order("order_index", { ascending: true });

    if (topics && topics.length > 0) {
      totalTopics = topics.length;
      completedTopics = topics.filter((t: any) => t.status === "completed").length;
      const active = topics.find((t: any) => t.status === "in-progress");
      if (active) currentTopic = active.title;
      progressPercent = roadmap.progress_percent || Math.round((completedTopics / totalTopics) * 100);
    }
  }

  // 2. Get session/message counts
  const { count: totalSessions } = await supabase
    .from("chat_sessions")
    .select("id", { count: "exact", head: true })
    .eq("mentor_id", mentorId)
    .eq("user_id", userId);

  const sessionIds = (
    await supabase
      .from("chat_sessions")
      .select("id")
      .eq("mentor_id", mentorId)
      .eq("user_id", userId)
  ).data?.map((s: any) => s.id) || [];

  let messagesCount = 0;
  if (sessionIds.length > 0) {
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .in("session_id", sessionIds);
    messagesCount = count || 0;
  }

  return {
    mentorId,
    totalSessions: totalSessions || 0,
    totalMinutes: (totalSessions || 0) * 30, // estimate
    learningStreak: 0, // TODO: calculate from session dates
    progressPercent,
    currentTopic,
    completedTopics,
    totalTopics,
    messagesCount,
    questionsAsked: 0,
    filesUploaded: 0,
    projectsCompleted: 0,
  };
}
