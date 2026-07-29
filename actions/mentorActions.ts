"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { generateRoadmapForMentor } from "@/actions/roadmapActions";

export async function createMentorAction(formData: FormData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "You must be logged in to create a mentor." };
    }
    
    // Parse form data
    const name = formData.get("name") as string || "AI Mentor";
    const role = formData.get("role") as string || "General Guide";
    const subject = formData.get("subject") as string || "general";
    const specialization = formData.get("specialization") as string || "";
    const difficultyLevel = formData.get("difficultyLevel") as string || "beginner";
    const learningStyle = formData.get("learningStyle") as string || "mixed";
    const conversationStyle = formData.get("conversationStyle") as string || "encouraging";
    const teachingSpeed = formData.get("teachingSpeed") as string || "moderate";
    const responseLength = formData.get("responseLength") as string || "detailed";
    const preferredLanguage = formData.get("preferredLanguage") as string || "English";
    const learningGoal = formData.get("learningGoal") as string || "General learning";
    const knowledgeFocus = formData.get("knowledgeFocus") as string || "";
    const sessionDuration = parseInt(formData.get("sessionDuration") as string || "30", 10);

    const { data, error } = await supabase
      .from("mentors")
      .insert({
        user_id: userId,
        name,
        role,
        subject,
        specialization,
        difficulty_level: difficultyLevel,
        learning_style: learningStyle,
        conversation_style: conversationStyle,
        teaching_speed: teachingSpeed,
        response_length: responseLength,
        preferred_language: preferredLanguage,
        learning_goal: learningGoal,
        session_duration: sessionDuration,
        knowledge_focus: knowledgeFocus,
        voice_id: formData.get("voiceId") as string || "21m00Tcm4TlvDq8ikWAM"
      })
      .select("id")
      .single();

    if (error || !data) {
      throw new Error(`Failed to create mentor: ${error?.message}`);
    }

    const mentorId = data.id;

    // Generate AI roadmap immediately so it completes during the UI loading animation
    // (We will refactor roadmapService shortly to not use Convex)
    try {
      await generateRoadmapForMentor(mentorId, userId);
    } catch (err) {
      console.error("Roadmap Generation Failed during mentor creation:", err);
    }

    // Revalidate the mentors dashboard page so the new mentor shows up
    revalidatePath("/dashboard/mentors");
    
    return { success: true, mentorId };
  } catch (error) {
    console.error("Failed to create mentor:", error);
    return { error: "Failed to create AI mentor. Please try again." };
  }
}

export async function getMentorsForUser() {
  const { userId } = await auth();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("mentors")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch mentors:", error);
    return [];
  }

  if (!data || data.length === 0) return [];

  const mentorIds = data.map((m: any) => m.id);

  // ── Batch queries: fetch all related data in parallel ────────────────────
  const [roadmapsResult, sessionsResult, resourcesResult, memoryResult] = await Promise.all([
    supabase
      .from("roadmaps")
      .select("id, mentor_id, progress_percent")
      .in("mentor_id", mentorIds),
    supabase
      .from("chat_sessions")
      .select("id, mentor_id, message_count, last_message_at")
      .in("mentor_id", mentorIds)
      .eq("user_id", userId),
    supabase
      .from("resources")
      .select("id, mentor_id")
      .in("mentor_id", mentorIds),
    supabase
      .from("mentor_memories")
      .select("id, mentor_id")
      .in("mentor_id", mentorIds),
  ]);

  const roadmaps = roadmapsResult.data || [];
  const roadmapIds = roadmaps.map((r: any) => r.id);

  // Fetch all topics for all roadmaps in one query
  let allTopics: any[] = [];
  if (roadmapIds.length > 0) {
    const { data: topicsData } = await supabase
      .from("roadmap_topics")
      .select("id, roadmap_id, title, status, estimated_minutes, difficulty")
      .in("roadmap_id", roadmapIds);
    allTopics = topicsData || [];
  }

  // Build lookup maps for O(1) access
  const roadmapByMentorId = new Map<string, any>();
  for (const r of roadmaps) roadmapByMentorId.set(r.mentor_id, r);

  const topicsByRoadmapId = new Map<string, any[]>();
  for (const t of allTopics) {
    const existing = topicsByRoadmapId.get(t.roadmap_id) || [];
    existing.push(t);
    topicsByRoadmapId.set(t.roadmap_id, existing);
  }

  // Session counts & last session date per mentor
  const sessions = sessionsResult.data || [];
  const sessionsByMentorId = new Map<string, any[]>();
  for (const s of sessions) {
    const existing = sessionsByMentorId.get(s.mentor_id) || [];
    existing.push(s);
    sessionsByMentorId.set(s.mentor_id, existing);
  }

  // Resource counts per mentor
  const resources = resourcesResult.data || [];
  const resourceCountByMentorId = new Map<string, number>();
  for (const r of resources) {
    resourceCountByMentorId.set(r.mentor_id, (resourceCountByMentorId.get(r.mentor_id) || 0) + 1);
  }

  // Memory counts per mentor
  const memories = memoryResult.data || [];
  const memoryCountByMentorId = new Map<string, number>();
  for (const m of memories) {
    memoryCountByMentorId.set(m.mentor_id, (memoryCountByMentorId.get(m.mentor_id) || 0) + 1);
  }

  // ── Map mentors with enriched stats ──────────────────────────────────────
  return data.map((m: any) => {
    const roadmap = roadmapByMentorId.get(m.id);
    const topics = roadmap ? (topicsByRoadmapId.get(roadmap.id) || []) : [];
    const mentorSessions = sessionsByMentorId.get(m.id) || [];
    const filesUploaded = resourceCountByMentorId.get(m.id) || 0;
    const memoryCount = memoryCountByMentorId.get(m.id) || 0;

    const totalTopics = topics.length;
    const completedTopics = topics.filter((t: any) => t.status === "completed").length;
    const progressPercent = roadmap?.progress_percent ||
      (totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0);

    const activeTopic = topics.find((t: any) => t.status === "in-progress");
    const availableTopic = topics.find((t: any) => t.status === "available");
    const currentTopic = activeTopic?.title || availableTopic?.title || "Introduction";
    const currentTopicEstMinutes = activeTopic?.estimated_minutes || availableTopic?.estimated_minutes;
    const currentTopicDifficulty = activeTopic?.difficulty || availableTopic?.difficulty;

    // Next topic suggestion — first topic after the current one
    const activeIdx = activeTopic ? topics.findIndex((t: any) => t.id === activeTopic.id) : -1;
    const nextTopicSuggestion = activeIdx >= 0 ? topics[activeIdx + 1]?.title : undefined;

    const totalSessions = mentorSessions.length;
    const totalMinutes = totalSessions * 30;

    // Last session date — latest last_message_at across sessions
    const lastSessionDate = mentorSessions
      .map((s: any) => s.last_message_at)
      .filter(Boolean)
      .sort()
      .reverse()[0] ?? undefined;

    return {
      ...m,
      id: m.id,
      difficultyLevel: m.difficulty_level,
      learningStyle: m.learning_style,
      conversationStyle: m.conversation_style,
      teachingSpeed: m.teaching_speed,
      responseLength: m.response_length,
      preferredLanguage: m.preferred_language,
      learningGoal: m.learning_goal,
      sessionDuration: m.session_duration,
      knowledgeFocus: m.knowledge_focus,
      stats: {
        mentorId: m.id,
        totalSessions,
        totalMinutes,
        learningStreak: 0,
        progressPercent,
        currentTopic,
        currentTopicEstMinutes,
        currentTopicDifficulty,
        nextTopicSuggestion,
        lastSessionDate,
        completedTopics,
        totalTopics,
        filesUploaded,
        memoryCount,
        messagesCount: 0,
        questionsAsked: 0,
        projectsCompleted: 0,
      },
    };
  });
}

export async function getMentorById(mentorId: string) {
  const { userId } = await auth();
  if (!userId) return null;

  const { data, error } = await supabase
    .from("mentors")
    .select("*")
    .eq("id", mentorId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    console.error("Failed to fetch mentor:", error);
    return null;
  }

  // ── Fetch all stats in parallel ────────────────────────────────────────
  let stats = {
    mentorId: data.id,
    totalSessions: 0,
    totalMinutes: 0,
    learningStreak: 0,
    progressPercent: 0,
    currentTopic: "Introduction",
    currentTopicEstMinutes: undefined as number | undefined,
    currentTopicDifficulty: undefined as string | undefined,
    nextTopicSuggestion: undefined as string | undefined,
    lastSessionDate: undefined as string | undefined,
    completedTopics: 0,
    totalTopics: 0,
    filesUploaded: 0,
    memoryCount: 0,
    messagesCount: 0,
    questionsAsked: 0,
    projectsCompleted: 0,
  };

  try {
    const [roadmapResult, sessionsResult, resourcesResult, memoriesResult] = await Promise.all([
      supabase
        .from("roadmaps")
        .select("id, progress_percent")
        .eq("mentor_id", data.id)
        .single(),
      supabase
        .from("chat_sessions")
        .select("id, last_message_at")
        .eq("mentor_id", data.id)
        .eq("user_id", userId)
        .order("last_message_at", { ascending: false }),
      supabase
        .from("resources")
        .select("id", { count: "exact", head: true })
        .eq("mentor_id", data.id),
      supabase
        .from("mentor_memories")
        .select("id", { count: "exact", head: true })
        .eq("mentor_id", data.id),
    ]);

    const roadmap = roadmapResult.data;
    if (roadmap) {
      const { data: topics } = await supabase
        .from("roadmap_topics")
        .select("id, title, status, estimated_minutes, difficulty")
        .eq("roadmap_id", roadmap.id)
        .order("order_index", { ascending: true });

      if (topics && topics.length > 0) {
        stats.totalTopics = topics.length;
        stats.completedTopics = topics.filter((t: any) => t.status === "completed").length;
        stats.progressPercent = roadmap.progress_percent ||
          (topics.length > 0 ? Math.round((stats.completedTopics / topics.length) * 100) : 0);

        const activeTopic = topics.find((t: any) => t.status === "in-progress");
        const availableTopic = topics.find((t: any) => t.status === "available");
        const currentT = activeTopic || availableTopic;
        if (currentT) {
          stats.currentTopic = currentT.title;
          stats.currentTopicEstMinutes = currentT.estimated_minutes;
          stats.currentTopicDifficulty = currentT.difficulty;
        }

        // Next topic after the current one
        if (activeTopic) {
          const activeIdx = topics.findIndex((t: any) => t.id === activeTopic.id);
          stats.nextTopicSuggestion = topics[activeIdx + 1]?.title;
        }
      }
    }

    const mentorSessions = sessionsResult.data || [];
    stats.totalSessions = mentorSessions.length;
    stats.totalMinutes = mentorSessions.length * 30;
    stats.lastSessionDate = mentorSessions[0]?.last_message_at ?? undefined;

    stats.filesUploaded = resourcesResult.count || 0;
    stats.memoryCount = memoriesResult.count || 0;
  } catch {
    // Silently use defaults if stats fail
  }

  return {
    ...data,
    id: data.id,
    difficultyLevel: data.difficulty_level,
    learningStyle: data.learning_style,
    conversationStyle: data.conversation_style,
    teachingSpeed: data.teaching_speed,
    responseLength: data.response_length,
    preferredLanguage: data.preferred_language,
    learningGoal: data.learning_goal,
    sessionDuration: data.session_duration,
    knowledgeFocus: data.knowledge_focus,
    stats,
  };
}


export async function updateMentorAction(mentorId: string, updates: any) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("mentors")
    .update(updates)
    .eq("id", mentorId)
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to update mentor:", error);
    throw new Error("Failed to update mentor");
  }

  revalidatePath(`/dashboard/mentors/${mentorId}`);
  return { success: true };
}

export async function deleteMentorAction(mentorId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("mentors")
    .delete()
    .eq("id", mentorId)
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to delete mentor:", error);
    throw new Error("Failed to delete mentor");
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateMentorVoiceSettingsAction(mentorId: string, settings: any) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("mentors")
    .update({
      voice_provider: settings.voiceProvider,
      voice_model: settings.voiceModel,
      voice_language: settings.voiceLanguage,
      voice_greeting: settings.voiceGreeting,
      voice_speed: settings.voiceSpeed,
      voice_temperature: settings.voiceTemperature,
      voice_interruptions: settings.voiceInterruptions,
      voice_auto_start: settings.voiceAutoStart,
      voice_id: settings.voiceId,
    })
    .eq("id", mentorId)
    .eq("user_id", userId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/mentors", "layout");
  return { success: true };
}
