"use server";

import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

export async function createChatSession(mentorId: string, title?: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      mentor_id: mentorId,
      user_id: userId,
      title: title || "New Conversation",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create chat session: ${error?.message}`);
  }

  return data.id;
}

export async function getChatHistory(sessionId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Optional: Verify session belongs to user
  const { data: session } = await supabase
    .from("chat_sessions")
    .select("user_id")
    .eq("id", sessionId)
    .single();

  if (!session || session.user_id !== userId) {
    throw new Error("Unauthorized session access");
  }

  const { data, error } = await supabase
    .from("messages")
    .select("id, role, content, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch chat history:", error);
    return [];
  }

  return data.map((msg: any) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content
  }));
}

export async function saveMessage(sessionId: string, role: string, content: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("messages")
    .insert({
      session_id: sessionId,
      role,
      content,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to save message:", error);
    return null;
  }

  return data.id;
}

export async function getChatSessions(mentorId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id, title, created_at")
    .eq("mentor_id", mentorId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch chat sessions:", error);
    return [];
  }

  return data;
}

export async function deleteChatSession(sessionId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("chat_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to delete chat session:", error);
    return false;
  }

  return true;
}
