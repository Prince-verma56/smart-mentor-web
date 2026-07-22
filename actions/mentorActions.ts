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

  // Map to the existing UI format
  return data.map((m: any) => ({
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
    // Add dummy stats for now (or fetch from a stats table later)
    stats: {
      mentorId: m.id,
      totalSessions: 0,
      totalMinutes: 0,
      learningStreak: 0,
      progressPercent: 0,
      currentTopic: "Introduction",
      completedTopics: 0,
      totalTopics: 10,
      messagesCount: 0,
      questionsAsked: 0,
      filesUploaded: 0,
      projectsCompleted: 0,
    }
  }));
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

  // Get real stats from database (async, non-blocking)
  let stats = {
    mentorId: data.id,
    totalSessions: 0,
    totalMinutes: 0,
    learningStreak: 0,
    progressPercent: 0,
    currentTopic: "Introduction",
    completedTopics: 0,
    totalTopics: 0,
    messagesCount: 0,
    questionsAsked: 0,
    filesUploaded: 0,
    projectsCompleted: 0,
  };

  try {
    // Fetch roadmap stats
    const { data: roadmap } = await supabase
      .from("roadmaps")
      .select("id, progress_percent")
      .eq("mentor_id", data.id)
      .single();

    if (roadmap) {
      const { data: topics } = await supabase
        .from("roadmap_topics")
        .select("id, title, status")
        .eq("roadmap_id", roadmap.id);

      if (topics) {
        stats.totalTopics = topics.length;
        stats.completedTopics = topics.filter((t: any) => t.status === "completed").length;
        stats.progressPercent = roadmap.progress_percent || 
          (topics.length > 0 ? Math.round((stats.completedTopics / topics.length) * 100) : 0);
        const activeTopic = topics.find((t: any) => t.status === "in-progress");
        if (activeTopic) stats.currentTopic = (activeTopic as any).title;
      }
    }

    // Fetch session count
    const { count: sessCount } = await supabase
      .from("chat_sessions")
      .select("id", { count: "exact", head: true })
      .eq("mentor_id", data.id)
      .eq("user_id", userId);
    stats.totalSessions = sessCount || 0;
    stats.totalMinutes = (sessCount || 0) * 30;
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
