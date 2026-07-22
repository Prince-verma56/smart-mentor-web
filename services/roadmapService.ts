import { supabase } from "@/lib/supabase";
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export class RoadmapService {
  async generateRoadmapForMentor(mentorId: string, userId: string) {
    console.log(`[RoadmapService] Starting roadmap generation for mentor: ${mentorId}`);
    
    // 1. Fetch mentor details
    const { data: mentor, error: mentorError } = await supabase
      .from("mentors")
      .select("*")
      .eq("id", mentorId)
      .single();

    if (mentorError || !mentor) {
      console.error("[RoadmapService] Mentor not found", mentorError);
      return;
    }

    // 2. Generate Roadmap using AI
    try {
      const { object: roadmapData } = await generateObject({
        model: openrouter("openai/gpt-4-turbo-preview"),
        schema: z.object({
          title: z.string().describe("The title of the learning roadmap"),
          description: z.string().describe("A short description of what the user will achieve"),
          topics: z.array(
            z.object({
              title: z.string().describe("Topic title"),
              description: z.string().describe("Detailed description of the topic"),
              order_index: z.number().describe("The sequential order index (1, 2, 3...)")
            })
          ).length(5).describe("Exactly 5 learning topics forming a logical progression")
        }),
        prompt: `Create a structured learning roadmap for a student.
          Mentor Role: ${mentor.role}
          Subject: ${mentor.subject}
          Difficulty: ${mentor.difficulty_level}
          Student's Goal: ${mentor.learning_goal}
          
          Generate a tailored roadmap with a title, description, and exactly 5 topics in sequential order.`,
      });

      console.log(`[RoadmapService] AI generated roadmap successfully! Inserting into DB...`);

      // 3. Insert Roadmap
      const { data: insertedRoadmap, error: roadmapError } = await supabase
        .from("roadmaps")
        .insert({
          mentor_id: mentor.id,
          user_id: userId,
          title: roadmapData.title,
          description: roadmapData.description,
        })
        .select("id")
        .single();

      if (roadmapError || !insertedRoadmap) {
        throw new Error(`Failed to insert roadmap: ${roadmapError?.message}`);
      }

      // 4. Insert Topics
      const topicsToInsert = roadmapData.topics.map(t => ({
        roadmap_id: insertedRoadmap.id,
        mentor_id: mentor.id,
        title: t.title,
        description: t.description,
        order_index: t.order_index,
        status: "pending"
      }));

      const { error: topicsError } = await supabase
        .from("topics")
        .insert(topicsToInsert);

      if (topicsError) {
        throw new Error(`Failed to insert topics: ${topicsError.message}`);
      }

      console.log(`[RoadmapService] Roadmap and topics saved to DB for mentor: ${mentorId}`);

    } catch (e) {
      console.error("[RoadmapService] Error generating roadmap", e);
    }
  }

  async getRoadmapForMentor(mentorId: string) {
    // Fetch roadmap
    const { data: roadmap, error: roadmapError } = await supabase
      .from("roadmaps")
      .select("*")
      .eq("mentor_id", mentorId)
      .single();

    if (roadmapError || !roadmap) return null;

    // Fetch topics
    const { data: topics, error: topicsError } = await supabase
      .from("topics")
      .select("*")
      .eq("roadmap_id", roadmap.id)
      .order("order_index", { ascending: true });

    if (topicsError) return null;

    const completedCount = topics.filter(t => t.status === "completed").length;

    return {
      mentorId: roadmap.mentor_id,
      title: roadmap.title,
      description: roadmap.description,
      totalEstimatedHours: 10,
      lastUpdated: roadmap.updated_at || new Date().toISOString(),
      phases: [
        {
          id: "phase-1",
          title: "Learning Journey",
          description: "Your personalized AI roadmap",
          order: 1,
          completedCount: completedCount,
          totalCount: topics.length,
          topics: topics.map((t, idx) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            estimatedMinutes: 60,
            status: t.status === "pending" && idx === completedCount ? "in-progress" 
                  : t.status === "pending" && idx > completedCount ? "locked" 
                  : t.status === "pending" ? "available" : t.status,
            order: t.order_index,
          }))
        }
      ]
    };
  }
}

export const roadmapService = new RoadmapService();
