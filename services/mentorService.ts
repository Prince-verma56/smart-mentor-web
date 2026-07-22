import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { vapiService } from "@/services/vapiService";
import type { Mentor, MentorWithStats } from "@/types/mentor";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export class MentorService {
  async getMentorsForUser(userId: string): Promise<MentorWithStats[]> {
    try {
      const mentors = await convex.query(api.mentors.getByUserId as any, { userId });
      return mentors.map((m: any) => ({
        ...m,
        id: m._id,
        conversationStyle: m.teachingStyle || "encouraging",
        knowledgeFocus: m.subject || "general",
        difficultyLevel: m.difficulty || "beginner",
        learningStyle: m.learningStyle || "visual",
        teachingSpeed: m.teachingSpeed || "moderate",
        responseLength: m.responseLength || "concise",
        stats: {
          mentorId: m._id,
          totalSessions: m.totalSessions || 0,
          totalMinutes: m.totalMinutes || 0,
          learningStreak: m.learningStreak || 0,
          progressPercent: m.progressPercent || 0,
          currentTopic: m.currentTopic || "Introduction",
          completedTopics: m.completedTopics || 0,
          totalTopics: m.totalTopics || 10,
          messagesCount: m.messagesCount || 0,
          questionsAsked: m.questionsAsked || 0,
          filesUploaded: m.filesUploaded || 0,
          projectsCompleted: m.projectsCompleted || 0,
        }
      })) as MentorWithStats[];
    } catch (error) {
      console.error("Error fetching mentors from Convex:", error);
      return [];
    }
  }

  async getMentorById(mentorId: string, userId: string): Promise<MentorWithStats | null> {
    try {
      const mentor = await convex.query(api.mentors.getById as any, { id: mentorId });
      if (!mentor || mentor.userId !== userId) return null;
      
      return {
        ...mentor,
        id: mentor._id,
        conversationStyle: mentor.teachingStyle || "encouraging",
        knowledgeFocus: mentor.subject || "general",
        difficultyLevel: mentor.difficulty || "beginner",
        learningStyle: mentor.learningStyle || "visual",
        teachingSpeed: mentor.teachingSpeed || "moderate",
        responseLength: mentor.responseLength || "concise",
        stats: {
          mentorId: mentor._id,
          totalSessions: mentor.totalSessions || 0,
          totalMinutes: mentor.totalMinutes || 0,
          learningStreak: mentor.learningStreak || 0,
          progressPercent: mentor.progressPercent || 0,
          currentTopic: mentor.currentTopic || "Introduction",
          completedTopics: mentor.completedTopics || 0,
          totalTopics: mentor.totalTopics || 10,
          messagesCount: mentor.messagesCount || 0,
          questionsAsked: mentor.questionsAsked || 0,
          filesUploaded: mentor.filesUploaded || 0,
          projectsCompleted: mentor.projectsCompleted || 0,
        }
      } as MentorWithStats;
    } catch (error) {
      console.error("Error fetching mentor from Convex:", error);
      return null;
    }
  }

  async createMentor(
    userId: string,
    data: any
  ): Promise<string> {
    const AVATAR_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    let voiceId: string | undefined | null;
    try {
      const createdId = await vapiService.createMentorAssistant({
        name: data.name,
        role: data.role,
        subject: data.subject,
        teachingStyle: data.teachingSpeed,
        learningGoal: data.learningGoal,
      });
      voiceId = createdId === null ? undefined : createdId;
    } catch (e) {
      console.error("Failed to create Voice Assistant", e);
    }

    const mentorId = await convex.mutation(api.mentors.createMentor as any, {
      userId,
      name: data.name,
      role: data.role,
      subject: data.subject,
      teachingStyle: data.conversationStyle,
      preferredLanguage: data.preferredLanguage || "English",
      learningGoal: data.learningGoal,
      sessionDuration: data.sessionDuration || 30,
      avatarColor,
      voiceId,
      description: data.additionalInstructions,
      difficulty: data.difficultyLevel,
    });

    return mentorId;
  }
}

export const mentorService = new MentorService();
