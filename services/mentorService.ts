import { supabase } from "@/lib/supabase";
import { vapiService } from "@/services/vapiService";
import type { Mentor } from "@/types/mentor";

function mapToCamelCase(row: any): Mentor {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    role: row.role,
    subject: row.subject,
    specialization: row.specialization,
    difficultyLevel: row.difficulty_level,
    learningGoal: row.learning_goal,
    learningStyle: row.learning_style,
    conversationStyle: row.conversation_style,
    teachingSpeed: row.teaching_speed,
    responseLength: row.response_length,
    preferredLanguage: row.preferred_language,
    sessionDuration: row.session_duration,
    knowledgeFocus: row.knowledge_focus,
    additionalInstructions: row.additional_instructions,
    goalDeadline: row.goal_deadline,
    voiceId: row.voice_id,
    avatarUrl: row.avatar_url,
    avatarColor: row.avatar_color,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as Mentor;
}

export class MentorService {
  async getMentorsForUser(userId: string): Promise<Mentor[]> {
    const { data, error } = await supabase
      .from("mentors")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching mentors from Supabase:", error);
      return [];
    }

    // Attach mock stats for now, later we'll fetch from `topics` or similar tables
    return data.map((row) => {
      const mentor = mapToCamelCase(row);
      return {
        ...mentor,
        stats: {
          mentorId: mentor.id,
          totalSessions: 0,
          totalMinutes: 0,
          learningStreak: 0,
          progressPercent: 0,
          currentTopic: "Introduction",
          completedTopics: 0,
          totalTopics: 10,
        },
      };
    }) as unknown as Mentor[];
  }

  async getMentorById(mentorId: string, userId: string): Promise<Mentor | null> {
    const { data, error } = await supabase
      .from("mentors")
      .select("*")
      .eq("id", mentorId)
      .single();

    if (error || !data) {
      return null;
    }

    if (data.user_id !== userId) {
      console.warn(`User ${userId} attempted to access mentor ${mentorId} belonging to ${data.user_id}`);
      return null;
    }

    const mentor = mapToCamelCase(data);

    return {
      ...mentor,
      stats: {
        mentorId: mentor.id,
        totalSessions: 0,
        totalMinutes: 0,
        learningStreak: 0,
        progressPercent: 0,
        currentTopic: "Introduction",
        completedTopics: 0,
        totalTopics: 10,
      },
    } as unknown as Mentor;
  }

  async createMentor(
    userId: string,
    data: {
      name: string;
      role: string;
      subject: string;
      specialization: string;
      difficultyLevel: string;
      learningStyle: string;
      conversationStyle: string;
      teachingSpeed: string;
      responseLength: string;
      preferredLanguage: string;
      learningGoal: string;
      sessionDuration: number;
      knowledgeFocus: string;
      additionalInstructions?: string;
      goalDeadline?: string;
    }
  ): Promise<string> {
    const AVATAR_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    let voiceId: string | undefined;
    try {
      voiceId = await vapiService.createMentorAssistant({
        name: data.name,
        role: data.role,
        subject: data.subject,
        teachingStyle: data.teachingSpeed,
        learningGoal: data.learningGoal,
      });
    } catch (e) {
      console.error("Failed to create Voice Assistant", e);
    }

    const { data: inserted, error } = await supabase
      .from("mentors")
      .insert({
        user_id: userId,
        name: data.name,
        role: data.role,
        subject: data.subject,
        specialization: data.specialization,
        difficulty_level: data.difficultyLevel,
        learning_style: data.learningStyle,
        conversation_style: data.conversationStyle,
        teaching_speed: data.teachingSpeed,
        response_length: data.responseLength,
        preferred_language: data.preferredLanguage,
        learning_goal: data.learningGoal,
        session_duration: data.sessionDuration,
        knowledge_focus: data.knowledgeFocus,
        additional_instructions: data.additionalInstructions,
        goal_deadline: data.goalDeadline,
        avatar_color: avatarColor,
        voice_id: voiceId,
      })
      .select("id")
      .single();

    if (error || !inserted) {
      throw new Error(`Failed to create mentor in Supabase: ${error?.message}`);
    }

    // We will trigger AI Roadmap generation in the Action layer so it doesn't block

    return inserted.id;
  }
}

export const mentorService = new MentorService();
