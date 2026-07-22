import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import Groq from "groq-sdk";
import type { MentorRoadmap, TopicStatus } from "@/types/roadmap";
import { mentorService } from "./mentorService";

let _groq: Groq | null = null;
function getGroq() {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export class RoadmapService {
  async generateRoadmapForMentor(mentorId: string, userId: string): Promise<MentorRoadmap | null> {
    console.log(`[RoadmapService] Generating roadmap for mentor: ${mentorId}`);

    const mentor = await mentorService.getMentorById(mentorId, userId);
    if (!mentor) {
      console.error("[RoadmapService] Mentor not found");
      return null;
    }

    try {
      const prompt = `You are a world-class curriculum designer. Create a structured learning roadmap for a student.
Mentor Role: ${mentor.role}
Subject: ${mentor.subject}
Difficulty Level: ${mentor.difficultyLevel}
Learning Goal: ${mentor.learningGoal || `Master ${mentor.subject} at ${mentor.difficultyLevel} level`}

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

      console.log(`[RoadmapService] AI generated. Saving to Convex...`);

      const topicsToInsert = roadmapData.topics.map((t: any, index: number) => ({
        title: t.title || `Topic ${index + 1}`,
        description: t.description || "",
        orderIndex: t.order_index || index + 1,
        status: index === 0 ? "in-progress" : "locked",
      }));

      await convex.mutation(api.roadmaps.createRoadmap as any, {
        mentorId: mentor.id,
        title: roadmapData.title,
        description: roadmapData.description,
        topics: topicsToInsert
      });

      console.log(`[RoadmapService] Roadmap saved for mentor: ${mentorId}`);
      return await this.getRoadmapForMentor(mentorId);
    } catch (e) {
      console.error("[RoadmapService] Error generating roadmap:", e);
      return null;
    }
  }

  async getRoadmapForMentor(mentorId: string): Promise<MentorRoadmap | null> {
    const data = await convex.query(api.roadmaps.getRoadmap as any, { mentorId });
    if (!data || !data.roadmap) return null;

    const { roadmap, topics } = data;
    const completedCount = topics.filter((t: any) => t.status === "completed").length;

    const mappedTopics = topics.map((t: any) => ({
      id: t._id,
      title: t.title,
      description: t.description || "",
      estimatedMinutes: 60,
      status: t.status as TopicStatus,
      order: t.orderIndex,
    }));

    return {
      mentorId: roadmap.mentorId,
      title: roadmap.title,
      description: roadmap.description,
      totalEstimatedHours: Math.round((topics.length * 60) / 60),
      lastUpdated: roadmap.updatedAt || new Date().toISOString(),
      currentTopicId: topics.find((t: any) => t.status === "in-progress")?._id,
      phases: [
        {
          id: roadmap._id,
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

  async getOrGenerateRoadmap(mentorId: string, userId: string): Promise<MentorRoadmap | null> {
    const existing = await this.getRoadmapForMentor(mentorId);
    if (existing) return existing;
    return this.generateRoadmapForMentor(mentorId, userId);
  }
}

export const roadmapService = new RoadmapService();
