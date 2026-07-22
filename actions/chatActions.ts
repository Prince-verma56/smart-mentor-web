"use server";

import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// ─── Create ─────────────────────────────────────────────────────────────────

export async function createChatSession(mentorId: string, title?: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      mentor_id: mentorId,
      user_id: userId,
      title: title || "New Conversation",
      is_pinned: false,
      is_archived: false,
      message_count: 0
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create chat session: ${error?.message}`);
  }

  revalidatePath(`/dashboard/mentors/${mentorId}`);
  return data.id;
}

// ─── Read ───────────────────────────────────────────────────────────────────

export async function getChatSessions(mentorId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id, title, created_at, is_pinned, is_archived, summary, message_count, last_message_at")
    .eq("mentor_id", mentorId)
    .eq("user_id", userId)
    .order("is_pinned", { ascending: false })
    .order("last_message_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch chat sessions:", error);
    return [];
  }

  return data;
}

export async function getChatHistory(sessionId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { data: session, error: fetchError } = await supabase
    .from("chat_sessions")
    .select("user_id")
    .eq("id", sessionId)
    .single();

  console.log(`[getChatHistory] sessionId: ${sessionId}, userId: ${userId}, session found:`, session, "error:", fetchError);

  if (!session || session.user_id !== userId) {
    throw new Error("Unauthorized session access");
  }

  const { data, error } = await supabase
    .from("messages")
    .select("id, role, content, created_at, token_count, metadata")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch chat history:", error);
    return [];
  }

  return data;
}

// ─── Update ─────────────────────────────────────────────────────────────────

export async function renameChatSession(sessionId: string, title: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("chat_sessions")
    .update({ title })
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to rename chat session:", error);
    return false;
  }

  return true;
}

export async function pinChatSession(sessionId: string, isPinned: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("chat_sessions")
    .update({ is_pinned: isPinned })
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to pin chat session:", error);
    return false;
  }

  return true;
}

export async function archiveChatSession(sessionId: string, isArchived: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("chat_sessions")
    .update({ is_archived: isArchived })
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to archive chat session:", error);
    return false;
  }

  return true;
}

// ─── Delete ─────────────────────────────────────────────────────────────────

export async function deleteChatSession(sessionId: string, mentorId: string) {
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

  revalidatePath(`/dashboard/mentors/${mentorId}`);
  return true;
}

// ─── Messages ───────────────────────────────────────────────────────────────

export async function saveMessage(
  sessionId: string, 
  role: string, 
  content: string, 
  tokenCount?: number, 
  metadata?: any
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("messages")
    .insert({
      session_id: sessionId,
      role,
      content,
      token_count: tokenCount || null,
      metadata: metadata || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to save message:", error);
    return null;
  }

  // The database trigger updates message_count and last_message_at
  return data.id;
}
