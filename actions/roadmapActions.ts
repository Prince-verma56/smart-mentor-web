import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { getMentorById } from "./mentorActions";
import type { MentorRoadmap, RoadmapTopic } from "@/types/roadmap";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function topicsToPhases(topics: RoadmapTopic[]): MentorRoadmap["phases"] {
  return [
    {
      id: "phase-1",
      title: "Learning Path",
      description: "Your personalized learning path",
      order: 1,
      topics,
      completedCount: topics.filter((t) => t.status === "completed").length,
      totalCount: topics.length,
      progressPercent: topics.length > 0
        ? Math.round((topics.filter((t) => t.status === "completed").length / topics.length) * 100)
        : 0,
    },
  ];
}

// ─── Generate Roadmap ─────────────────────────────────────────────────────────

export async function generateRoadmapForMentor(mentorId: string, userId: string): Promise<MentorRoadmap | null> {
  console.log(`[RoadmapService] Generating roadmap for mentor: ${mentorId}`);

  const mentor = await getMentorById(mentorId);
  if (!mentor) {
    console.error("[RoadmapService] Mentor not found");
    return null;
  }

  // Prevent duplicates just in case
  const { data: existingRoadmaps } = await supabase
    .from("roadmaps")
    .select("id")
    .eq("mentor_id", mentorId)
    .limit(1);

  if (existingRoadmaps && existingRoadmaps.length > 0) {
    console.log(`[RoadmapService] Roadmap already exists for mentor: ${mentorId}`);
    return null; // or fetch and return it
  }

  try {
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace('localhost', '127.0.0.1');
    
    // Check auth
    const { userId, getToken } = await auth();
    const token = await getToken();
    
    const response = await fetch(`${apiUrl}/api/v1/roadmaps/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        mentor_id: mentorId,
        user_id: userId
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[RoadmapService] Backend generation failed: ${response.status} ${errorText}`);
      throw new Error("Failed to generate roadmap from backend.");
    }

    const data = await response.json();
    console.log(`[RoadmapService] Backend generated successfully: ${JSON.stringify(data)}`);

    // The backend handles DB insertion, so just fetch the final result from DB
    return await getOrGenerateRoadmap(mentorId, userId);
  } catch (error) {
    console.error("[RoadmapService] Failed to generate roadmap:", error);
    return null;
  }
}

// ─── Get or Generate Roadmap ──────────────────────────────────────────────────

export async function getOrGenerateRoadmap(mentorId: string, userId: string): Promise<MentorRoadmap | null> {
  const { data: roadmaps, error } = await supabase
    .from("roadmaps")
    .select("*")
    .eq("mentor_id", mentorId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Failed to fetch roadmap:", error);
    return null;
  }
  
  const roadmap = roadmaps?.[0];

  if (roadmap) {
    const { data: topics } = await supabase
      .from("roadmap_topics")
      .select("*")
      .eq("roadmap_id", roadmap.id)
      .order("order_index", { ascending: true });

    const formattedTopics: RoadmapTopic[] = (topics || []).map((t: any) => ({
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
      is_skipped: t.is_skipped,
      progress_percent: t.progress_percent || 0,
    }));

    const currentTopic = formattedTopics.find((t) => t.status === "in-progress") || null;

    return {
      id: roadmap.id,
      mentorId: roadmap.mentor_id,
      title: roadmap.title,
      description: roadmap.description || "",
      total_estimated_hours: roadmap.total_estimated_hours || 0,
      progress_percent: roadmap.progress_percent || 0,
      phases: topicsToPhases(formattedTopics),
      currentTopicId: currentTopic?.id,
      currentTopic,
      lastUpdated: roadmap.updated_at,
    };
  }

  // Not found — generate it
  return await generateRoadmapForMentor(mentorId, userId);
}

// Note: toggleTopicStatusAction is exported from progressActions.ts directly
