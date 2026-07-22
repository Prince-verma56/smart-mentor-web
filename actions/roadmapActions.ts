"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";
import { getMentorById } from "./mentorActions";
import type { MentorRoadmap, RoadmapTopic } from "@/types/roadmap";

let _groq: Groq | null = null;
function getGroq() {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

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
    const prompt = `You are a world-class curriculum designer. Create a detailed structured learning roadmap.

Mentor Role: ${mentor.role}
Subject: ${mentor.subject}
Difficulty Level: ${mentor.difficulty_level}
Learning Goal: ${mentor.learning_goal || `Master ${mentor.subject} at ${mentor.difficulty_level} level`}

Generate a roadmap with 8-12 progressive topics. Each topic should build on the previous.

Respond with ONLY a valid JSON object (no markdown, no explanation):
{
  "title": "Descriptive roadmap title",
  "description": "One sentence describing the outcome",
  "total_estimated_hours": 40,
  "topics": [
    {
      "title": "Topic Title",
      "description": "Detailed description of what will be learned and why it matters",
      "difficulty": "beginner",
      "estimated_minutes": 45,
      "order_index": 1
    }
  ]
}

Difficulty must be one of: beginner, intermediate, advanced.
Make each topic progressively harder. Start with fundamentals.`;

    const completion = await getGroq().chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 2048,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || "";
    const jsonStr = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "");
    const roadmapData = JSON.parse(jsonStr);

    console.log(`[RoadmapService] AI generated. Saving to Supabase...`);

    // Insert Roadmap
    const { data: roadmap, error: roadmapError } = await supabase
      .from("roadmaps")
      .insert({
        mentor_id: mentorId,
        title: roadmapData.title || `${mentor.subject} Roadmap`,
        description: roadmapData.description || "",
        total_estimated_hours: roadmapData.total_estimated_hours || 40,
      })
      .select("id")
      .single();

    if (roadmapError || !roadmap) {
      console.error("[RoadmapService] Roadmap Insert Error:", roadmapError);
      throw new Error(`Failed to insert roadmap: ${roadmapError?.message || "Unknown error"}`);
    }

    // Insert Topics with all new fields
    const topicsToInsert = roadmapData.topics.map((t: any, index: number) => ({
      roadmap_id: roadmap.id,
      title: t.title || `Topic ${index + 1}`,
      description: t.description || "",
      difficulty: t.difficulty || "beginner",
      estimated_minutes: t.estimated_minutes || 30,
      order_index: t.order_index || index + 1,
      status: index === 0 ? "in-progress" : "locked",
    }));

    const { data: insertedTopics, error: topicsError } = await supabase
      .from("roadmap_topics")
      .insert(topicsToInsert)
      .select("*");

    if (topicsError) throw new Error("Failed to insert roadmap topics");

    console.log(`[RoadmapService] Successfully saved ${topicsToInsert.length} topics.`);

    const formattedTopics: RoadmapTopic[] = (insertedTopics || topicsToInsert).map((t: any, i: number) => ({
      id: t.id || `temp-${i}`,
      roadmap_id: roadmap.id,
      title: t.title,
      description: t.description || "",
      difficulty: t.difficulty || "beginner",
      estimated_minutes: t.estimated_minutes || 30,
      order_index: t.order_index,
      status: t.status,
      prerequisites: t.prerequisites || [],
      progress_percent: 0,
    }));

    return {
      id: roadmap.id,
      mentorId,
      title: roadmapData.title || `${mentor.subject} Roadmap`,
      description: roadmapData.description || "",
      total_estimated_hours: roadmapData.total_estimated_hours || 40,
      progress_percent: 0,
      phases: topicsToPhases(formattedTopics),
      currentTopicId: formattedTopics[0]?.id,
      currentTopic: formattedTopics[0] || null,
      lastUpdated: new Date().toISOString(),
    };
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
