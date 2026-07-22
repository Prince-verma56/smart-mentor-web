import { supabase } from "@/lib/supabase";
import Groq from "groq-sdk";
import type { MentorRoadmap, TopicStatus } from "@/types/roadmap";

// Lazy-initialize so the client is only created when a function is called,
// not at module evaluation time (avoids crashes if env vars load late).
let _groq: Groq | null = null;
function getGroq() {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

export class RoadmapService {
  /**
   * Auto-generates a roadmap for a mentor using Groq.
   * Saves to Supabase and returns the structured roadmap.
   */
  async generateRoadmapForMentor(mentorId: string, userId: string): Promise<MentorRoadmap | null> {
    console.log(`[RoadmapService] Generating roadmap for mentor: ${mentorId}`);

    // 1. Fetch mentor details
    const { data: mentor, error: mentorError } = await supabase
      .from("mentors")
      .select("*")
      .eq("id", mentorId)
      .single();

    if (mentorError || !mentor) {
      console.error("[RoadmapService] Mentor not found", mentorError);
      return null;
    }

    // 2. Generate roadmap using Groq (llama-3.1-8b-instant)
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
    {"title": "Topic 3 Title", "description": "What will be learned", "order_index": 3},
    {"title": "Topic 4 Title", "description": "What will be learned", "order_index": 4},
    {"title": "Topic 5 Title", "description": "What will be learned", "order_index": 5},
    {"title": "Topic 6 Title", "description": "What will be learned", "order_index": 6}
  ]
}`;

      const completion = await getGroq().chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens: 1024,
      });

      const raw = completion.choices[0]?.message?.content?.trim() || "";
      // Strip any markdown code fences if present
      const jsonStr = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "");
      const roadmapData = JSON.parse(jsonStr);

      console.log(`[RoadmapService] AI generated. Saving to DB...`);

      // 3. Insert Roadmap record
      const { data: insertedRoadmap, error: roadmapError } = await supabase
        .from("roadmaps")
        .insert({
          mentor_id: mentor.id,
          title: roadmapData.title,
          description: roadmapData.description,
        })
        .select("id")
        .single();

      if (roadmapError || !insertedRoadmap) {
        throw new Error(`Failed to insert roadmap: ${roadmapError?.message}`);
      }

      // 4. Insert Topics
      const topicsToInsert = roadmapData.topics.map((t: any) => ({
        roadmap_id: insertedRoadmap.id,
        mentor_id: mentor.id,
        title: t.title,
        description: t.description,
        order_index: t.order_index,
        status: t.order_index === 1 ? "in-progress" : "locked",
      }));

      const { error: topicsError } = await supabase.from("topics").insert(topicsToInsert);
      if (topicsError) {
        throw new Error(`Failed to insert topics: ${topicsError.message}`);
      }

      console.log(`[RoadmapService] Roadmap saved for mentor: ${mentorId}`);

      // 5. Return the freshly created roadmap
      return await this.getRoadmapForMentor(mentorId);
    } catch (e) {
      console.error("[RoadmapService] Error generating roadmap:", e);
      return null;
    }
  }

  /**
   * Fetches the existing roadmap from DB and maps it to MentorRoadmap type.
   */
  async getRoadmapForMentor(mentorId: string): Promise<MentorRoadmap | null> {
    const { data: roadmap, error: roadmapError } = await supabase
      .from("roadmaps")
      .select("*")
      .eq("mentor_id", mentorId)
      .single();

    if (roadmapError || !roadmap) return null;

    const { data: topics, error: topicsError } = await supabase
      .from("topics")
      .select("*")
      .eq("roadmap_id", roadmap.id)
      .order("order_index", { ascending: true });

    if (topicsError || !topics) return null;

    const completedCount = topics.filter((t) => t.status === "completed").length;

    const mappedTopics = topics.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description || "",
      estimatedMinutes: 60,
      status: t.status as TopicStatus,
      order: t.order_index,
    }));

    return {
      mentorId: roadmap.mentor_id,
      title: roadmap.title,
      description: roadmap.description,
      totalEstimatedHours: Math.round((topics.length * 60) / 60),
      lastUpdated: roadmap.updated_at || new Date().toISOString(),
      currentTopicId: topics.find((t) => t.status === "in-progress")?.id,
      phases: [
        {
          id: roadmap.id,
          title: "Learning Journey",
          description: "Your AI-generated personalised roadmap",
          order: 1,
          completedCount,
          totalCount: topics.length,
          topics: mappedTopics,
        },
      ],
    };
  }

  /**
   * Fetch or auto-generate roadmap. Call this from page.tsx.
   */
  async getOrGenerateRoadmap(mentorId: string, userId: string): Promise<MentorRoadmap | null> {
    const existing = await this.getRoadmapForMentor(mentorId);
    if (existing) return existing;
    // No roadmap yet — generate one
    return this.generateRoadmapForMentor(mentorId, userId);
  }
}

export const roadmapService = new RoadmapService();
