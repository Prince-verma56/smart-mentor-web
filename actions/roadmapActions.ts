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

// ─── Fetch roadmap from Supabase ───────────────────────────────────────────────
// Returns null if no roadmap exists yet — does NOT trigger generation.

async function fetchRoadmapFromDB(mentorId: string): Promise<MentorRoadmap | null> {
  const { data: roadmaps, error } = await supabase
    .from("roadmaps")
    .select("*")
    .eq("mentor_id", mentorId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !roadmaps?.length) return null;

  const roadmap = roadmaps[0];

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

// ─── Generate Roadmap ─────────────────────────────────────────────────────────

export async function generateRoadmapForMentor(mentorId: string, userId: string): Promise<MentorRoadmap | null> {
  console.log(`[RoadmapService] Generating roadmap for mentor: ${mentorId}`);

  const mentor = await getMentorById(mentorId);
  if (!mentor) {
    console.error("[RoadmapService] Mentor not found");
    return null;
  }

  // Prevent duplicates — if a roadmap already exists, just return it
  const existing = await fetchRoadmapFromDB(mentorId);
  if (existing) {
    console.log(`[RoadmapService] Roadmap already exists, returning existing.`);
    return existing;
  }

  try {
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace('localhost', '127.0.0.1');
    
    // Fetch a fresh Clerk token — ONCE per call to avoid 401 from expired token in long loops
    const { userId: authUserId, getToken } = await auth();
    const token = await getToken();
    
    const response = await fetch(`${apiUrl}/api/v1/roadmaps/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        mentor_id: mentorId,
        user_id: authUserId || userId
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[RoadmapService] Backend generation failed: ${response.status} ${errorText}`);
      // Don't throw — return null gracefully so UI can still work
      return null;
    }

    const data = await response.json();
    console.log(`[RoadmapService] Backend generated successfully: ${JSON.stringify(data)}`);

    // Poll for the result in DB with a safe retry limit — NO recursion.
    // Backend may take a moment to write to Supabase after returning 200.
    const MAX_POLL = 5;
    for (let i = 0; i < MAX_POLL; i++) {
      await new Promise(r => setTimeout(r, 1200)); // wait 1.2s between polls
      const roadmap = await fetchRoadmapFromDB(mentorId);
      if (roadmap) {
        console.log(`[RoadmapService] Roadmap confirmed in DB after ${i + 1} poll(s).`);
        return roadmap;
      }
    }

    console.warn(`[RoadmapService] Roadmap not found in DB after ${MAX_POLL} polls. Backend may have saved it asynchronously.`);
    return null;
  } catch (error) {
    console.error("[RoadmapService] Failed to generate roadmap:", error);
    return null;
  }
}

// ─── Get or Generate Roadmap ──────────────────────────────────────────────────

export async function getOrGenerateRoadmap(mentorId: string, userId: string): Promise<MentorRoadmap | null> {
  // 1. Try to fetch existing roadmap from DB
  const existing = await fetchRoadmapFromDB(mentorId);
  if (existing) return existing;

  // 2. Nothing found — trigger generation ONCE (no recursive call back here)
  return await generateRoadmapForMentor(mentorId, userId);
}

// Note: toggleTopicStatusAction is exported from progressActions.ts directly
