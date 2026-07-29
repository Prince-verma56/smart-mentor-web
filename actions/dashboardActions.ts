"use server";

import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { isToday, isYesterday, isThisWeek, parseISO } from "date-fns";

export async function getDashboardStats() {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    // 1. Get active mentors count
    const { data: mentors } = await supabase
      .from("mentors")
      .select("id")
      .eq("user_id", userId);
    
    const activeMentors = mentors?.length || 0;
    const mentorIds = mentors?.map(m => m.id) || [];

    // 2. Get completed topics count
    let completedTopics = 0;
    if (mentorIds.length > 0) {
      const { data: roadmaps } = await supabase
        .from("roadmaps")
        .select("id")
        .in("mentor_id", mentorIds);
        
      const roadmapIds = roadmaps?.map(r => r.id) || [];
      if (roadmapIds.length > 0) {
        const { count } = await supabase
          .from("roadmap_topics")
          .select("id", { count: "exact", head: true })
          .in("roadmap_id", roadmapIds)
          .eq("status", "completed");
        
        completedTopics = count || 0;
      }
    }

    // 3. Get total study time (from chat_sessions message_count proxy or voice_sessions)
    let totalMinutes = 0;
    if (mentorIds.length > 0) {
      const { data: sessions } = await supabase
        .from("chat_sessions")
        .select("message_count")
        .in("mentor_id", mentorIds);
        
      // Rough estimation: each message ~ 2 minutes of study time
      const totalMessages = sessions?.reduce((sum, s) => sum + (s.message_count || 0), 0) || 0;
      totalMinutes += totalMessages * 2;
      
      const { data: voiceSessions } = await supabase
        .from("voice_sessions")
        .select("duration")
        .in("mentor_id", mentorIds)
        .eq("status", "completed");
        
      const voiceMinutes = voiceSessions?.reduce((sum, s) => sum + Math.round((s.duration || 0) / 60), 0) || 0;
      totalMinutes += voiceMinutes;
    }

    // 4. Get Voice Sessions count
    let voiceSessionsCount = 0;
    if (mentorIds.length > 0) {
      const { count } = await supabase
        .from("voice_sessions")
        .select("id", { count: "exact", head: true })
        .in("mentor_id", mentorIds);
      voiceSessionsCount = count || 0;
    }

    // 5. Get Knowledge Sources count
    let knowledgeSourcesCount = 0;
    if (mentorIds.length > 0) {
      const { count } = await supabase
        .from("resources")
        .select("id", { count: "exact", head: true })
        .in("mentor_id", mentorIds);
      knowledgeSourcesCount = count || 0;
    }
    // 6. Compute real streak from chat session activity
    let currentStreak = 0;
    if (mentorIds.length > 0) {
      const { data: activitySessions } = await supabase
        .from("chat_sessions")
        .select("last_message_at")
        .in("mentor_id", mentorIds)
        .not("last_message_at", "is", null)
        .order("last_message_at", { ascending: false });

      if (activitySessions && activitySessions.length > 0) {
        // Collect unique active dates (YYYY-MM-DD)
        const activeDays = new Set(
          activitySessions
            .map((s) => s.last_message_at)
            .filter(Boolean)
            .map((ts: string) => new Date(ts).toISOString().slice(0, 10))
        );

        // Walk backwards from today counting consecutive days with activity
        const checkDate = new Date();
        while (true) {
          const key = checkDate.toISOString().slice(0, 10);
          if (activeDays.has(key)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    return {
      activeMentors,
      completedTopics,
      totalStudyHours: Math.round(totalMinutes / 60),
      voiceSessions: voiceSessionsCount,
      knowledgeSources: knowledgeSourcesCount,
      currentStreak,
    };

  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return null;
  }
}

export async function getLearningJourney() {
  const { userId } = await auth();
  if (!userId) return [];

  // Define the permanent global milestones
  const MILESTONES = [
    { id: "create_mentor", title: "Create Your First Mentor", description: "Design a specialized AI guide for your workspace.", icon: "Bot", xp_reward: 50, estimated_time: "5 min" },
    { id: "first_conversation", title: "First AI Conversation", description: "Say hello to your new mentor.", icon: "MessageSquare", xp_reward: 20, estimated_time: "2 min" },
    { id: "first_lesson", title: "First Lesson", description: "Finish a topic on your learning roadmap.", icon: "BookOpen", xp_reward: 100, estimated_time: "15 min" },
    { id: "upload_knowledge", title: "Knowledge Upload", description: "Give your mentor some custom context.", icon: "FileUp", xp_reward: 80, estimated_time: "5 min" },
    { id: "first_voice", title: "First Voice Session", description: "Practice speaking in real-time.", icon: "Mic", xp_reward: 150, estimated_time: "10 min" },
    { id: "first_quiz", title: "Quiz Master", description: "Test your knowledge and prove your skills.", icon: "Target", xp_reward: 200, estimated_time: "10 min" },
    { id: "level_2", title: "Reach Level 2", description: "Accumulate enough XP to level up.", icon: "Trophy", xp_reward: 500, estimated_time: "---" },
  ];

  try {
    // 1. Fetch user's actual database records to evaluate progress
    const { data: mentors } = await supabase.from("mentors").select("id").eq("user_id", userId);
    const mentorIds = mentors?.map(m => m.id) || [];
    
    let chatCount = 0;
    let completedTopicsCount = 0;
    let resourceCount = 0;
    let voiceCount = 0;
    let quizCount = 0;

    if (mentorIds.length > 0) {
      const { count: chats } = await supabase.from("chat_sessions").select("id", { count: "exact", head: true }).in("mentor_id", mentorIds);
      chatCount = chats || 0;

      const { data: roadmaps } = await supabase.from("roadmaps").select("id").in("mentor_id", mentorIds);
      const roadmapIds = roadmaps?.map(r => r.id) || [];
      if (roadmapIds.length > 0) {
        const { data: topics } = await supabase.from("roadmap_topics").select("id, status, quiz_score").in("roadmap_id", roadmapIds);
        completedTopicsCount = topics?.filter(t => t.status === "completed").length || 0;
        quizCount = topics?.filter(t => t.quiz_score !== null).length || 0;
      }

      const { count: resources } = await supabase.from("resources").select("id", { count: "exact", head: true }).in("mentor_id", mentorIds);
      resourceCount = resources || 0;

      const { count: voices } = await supabase.from("voice_sessions").select("id", { count: "exact", head: true }).in("mentor_id", mentorIds);
      voiceCount = voices || 0;
    }

    let foundActive = false;
    
    const journey = MILESTONES.map((milestone) => {
      let isMet = false;
      let summary_metric = "Not started yet";

      switch (milestone.id) {
        case "create_mentor": 
          isMet = mentorIds.length > 0; 
          summary_metric = isMet ? `${mentorIds.length} mentors created` : "Create a mentor to unlock";
          break;
        case "first_conversation": 
          isMet = chatCount > 0; 
          summary_metric = isMet ? `${chatCount} conversations completed` : "Start a chat to unlock";
          break;
        case "first_lesson": 
          isMet = completedTopicsCount > 0; 
          summary_metric = isMet ? `${completedTopicsCount} lessons finished` : "Complete a lesson to unlock";
          break;
        case "upload_knowledge": 
          isMet = resourceCount > 0; 
          summary_metric = isMet ? `${resourceCount} resources uploaded` : "Upload context to unlock";
          break;
        case "first_voice": 
          isMet = voiceCount > 0; 
          summary_metric = isMet ? `${voiceCount} sessions completed` : "Start a voice session to unlock";
          break;
        case "first_quiz": 
          isMet = quizCount > 0; 
          summary_metric = isMet ? `${quizCount} quizzes passed` : "Finish a quiz to unlock";
          break;
        case "level_2": 
          isMet = completedTopicsCount >= 5; 
          summary_metric = isMet ? `You reached Level 2!` : `${Math.min(completedTopicsCount, 5)}/5 topics needed`;
          break;
      }

      let status = "locked";
      if (isMet) {
        status = "completed";
      } else if (!foundActive) {
        status = "active";
        foundActive = true;
      }

      return {
        ...milestone,
        status,
        summary_metric
      };
    });

    // Second pass to set "available"
    let activeSeen = false;
    let availableCount = 0;
    for (let i = 0; i < journey.length; i++) {
      if (journey[i].status === "active") {
        activeSeen = true;
      } else if (activeSeen && availableCount < 2) {
        journey[i].status = "available";
        availableCount++;
      }
    }

    return journey;
  } catch (error) {
    console.error("Failed to fetch learning journey:", error);
    return [];
  }
}
