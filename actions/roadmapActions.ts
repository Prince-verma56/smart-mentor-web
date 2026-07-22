"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

import Groq from "groq-sdk";
import { getMentorById } from "./mentorActions";

let _groq: Groq | null = null;
function getGroq() {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

export async function generateRoadmapForMentor(mentorId: string, userId: string) {
  console.log(`[RoadmapService] Generating roadmap for mentor: ${mentorId}`);

  const mentor = await getMentorById(mentorId);
  if (!mentor) {
    console.error("[RoadmapService] Mentor not found");
    return null;
  }

  try {
    const prompt = `You are a world-class curriculum designer. Create a structured learning roadmap for a student.
Mentor Role: ${mentor.role}
Subject: ${mentor.subject}
Difficulty Level: ${mentor.difficulty_level}
Learning Goal: ${mentor.learning_goal || `Master ${mentor.subject} at ${mentor.difficulty_level} level`}

Respond with ONLY a valid JSON object in this exact format (no markdown, no explanation):
{
  "title": "Roadmap title here",
  "description": "A clear one-sentence description of what the student will achieve.",
  "topics": [
    {"title": "Topic 1 Title", "description": "What will be learned", "order_index": 1},
    {"title": "Topic 2 Title", "description": "What will be learned", "order_index": 2},
    {"title": "Topic 3 Title", "description": "What will be learned", "order_index": 3}
  ]
}`;

    const completion = await getGroq().chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 1024,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || "";
    const jsonStr = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "");
    const roadmapData = JSON.parse(jsonStr);

    console.log(`[RoadmapService] AI generated. Saving to Supabase...`);

    // Insert Roadmap
    const { data: roadmap, error: roadmapError } = await supabase
      .from("roadmaps")
      .insert({
        mentor_id: mentorId,
        title: roadmapData.title || `${mentor.subject} Roadmap`,
        description: roadmapData.description || "",
      })
      .select("id")
      .single();

    if (roadmapError || !roadmap) throw new Error("Failed to insert roadmap");

    // Insert Topics
    const topicsToInsert = roadmapData.topics.map((t: any, index: number) => ({
      roadmap_id: roadmap.id,
      title: t.title || `Topic ${index + 1}`,
      description: t.description || "",
      order_index: t.order_index || index + 1,
      status: index === 0 ? "in-progress" : "locked",
    }));

    const { error: topicsError } = await supabase
      .from("roadmap_topics")
      .insert(topicsToInsert);

    if (topicsError) throw new Error("Failed to insert roadmap topics");

    console.log(`[RoadmapService] Successfully saved roadmap and topics.`);
    
    // Return the generated roadmap directly to prevent infinite loops
    // in case the Supabase select fails to read it back.
    const formattedTopics = topicsToInsert.map((t: any) => ({
      ...t,
      id: t.id || Math.random().toString(),
      orderIndex: t.order_index,
    }));

    return {
      ...roadmap,
      id: roadmap.id,
      mentorId: mentorId,
      phases: [{
        id: "phase-1",
        title: "Learning Path",
        description: "Your personalized roadmap",
        order: 1,
        topics: formattedTopics,
        completedCount: formattedTopics.filter((t: any) => t.status === "completed").length,
        totalCount: formattedTopics.length,
      }]
    };

  } catch (error) {
    console.error("[RoadmapService] Failed to generate roadmap:", error);
    return null;
  }
}

export async function getOrGenerateRoadmap(mentorId: string, userId: string) {
  const { data: roadmap, error } = await supabase
    .from("roadmaps")
    .select("*")
    .eq("mentor_id", mentorId)
    .single();

  if (error && error.code !== "PGRST116") { // PGRST116 is 'not found'
    console.error("Failed to fetch roadmap:", error);
    return null;
  }

  if (roadmap) {
    // Fetch topics
    const { data: topics } = await supabase
      .from("roadmap_topics")
      .select("*")
      .eq("roadmap_id", roadmap.id)
      .order("order_index", { ascending: true });

    const formattedTopics = (topics || []).map((t: any) => ({
      ...t,
      id: t.id,
      orderIndex: t.order_index,
    }));

    return {
      ...roadmap,
      id: roadmap.id,
      mentorId: roadmap.mentor_id,
      phases: [{
        id: "phase-1",
        title: "Learning Path",
        description: "Your personalized roadmap",
        order: 1,
        topics: formattedTopics,
        completedCount: formattedTopics.filter((t: any) => t.status === "completed").length,
        totalCount: formattedTopics.length,
      }]
    };
  }

  // Not found, generate it!
  return await generateRoadmapForMentor(mentorId, userId);
}

/**
 * Toggle a topic's status between "completed" and "in-progress".
 * After completing a topic, unlocks the next locked topic in sequence.
 */
export async function toggleTopicStatusAction(topicId: string, currentStatus: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const isCompleting = currentStatus !== "completed";
    const newStatus = isCompleting ? "completed" : "in-progress";

    const { data: topic, error: fetchError } = await supabase
      .from("roadmap_topics")
      .select("id, roadmap_id, order_index")
      .eq("id", topicId)
      .single();

    if (fetchError || !topic) {
      return { error: "Topic not found" };
    }

    // Update the toggled topic
    const { error: updateError } = await supabase
      .from("roadmap_topics")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", topicId);

    if (updateError) {
      console.error("Failed to update topic status:", updateError);
      return { error: "Failed to update progress" };
    }

    // If completing: find and unlock the next topic in the same roadmap
    if (isCompleting) {
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

    revalidatePath("/dashboard/mentors", "layout");
    return { success: true, newStatus };
  } catch (error) {
    console.error("Error toggling topic status:", error);
    return { error: "Something went wrong" };
  }
}
