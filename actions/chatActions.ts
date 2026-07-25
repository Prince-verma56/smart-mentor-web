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
    .select("id, title, created_at, is_pinned, is_archived, is_favorite, summary, ai_summary, message_count, last_message_at, voice_count, color, description")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create chat session: ${error?.message}`);
  }

  revalidatePath(`/dashboard/mentors/${mentorId}`);
  return data;
}

// ─── Read ───────────────────────────────────────────────────────────────────

export async function getChatSessions(mentorId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("chat_sessions")
    .select(
      "id, title, created_at, is_pinned, is_archived, is_favorite, summary, ai_summary, message_count, last_message_at, voice_count, color, description"
    )
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

export async function getChatHistory(sessionId: string, limit: number = 50, before?: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { data: session, error: fetchError } = await supabase
    .from("chat_sessions")
    .select("user_id")
    .eq("id", sessionId)
    .single();

  if (!session || session.user_id !== userId) {
    console.warn(`[getChatHistory] Unauthorized or missing session: ${sessionId}`);
    return [];
  }

  let query = supabase
    .from("messages")
    .select("id, role, content, created_at, token_count, metadata")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (before) {
    query = query.lt("created_at", before);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch chat history:", error);
    return [];
  }

  // Reverse so the returned array is strictly chronological (oldest to newest)
  return data ? data.reverse() : [];
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

export async function favoriteChatSession(sessionId: string, isFavorite: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("chat_sessions")
    .update({ is_favorite: isFavorite })
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to favorite chat session:", error);
    return false;
  }

  return true;
}

export async function duplicateChatSession(sessionId: string, mentorId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Fetch the original session
  const { data: original, error: fetchError } = await supabase
    .from("chat_sessions")
    .select("title, ai_summary, summary, message_count")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !original) {
    console.error("Failed to fetch original session for duplication:", fetchError);
    return null;
  }

  // Fetch all messages from original session
  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("role, content, token_count, metadata, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (messagesError) {
    console.error("Failed to fetch messages for duplication:", messagesError);
    return null;
  }

  // Create the new session
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      mentor_id: mentorId,
      user_id: userId,
      title: `Copy of ${original.title || "Conversation"}`,
      ai_summary: original.ai_summary || null,
      summary: original.summary || null,
      is_pinned: false,
      is_archived: false,
      is_favorite: false,
      message_count: original.message_count || 0,
      last_message_at: messages && messages.length > 0 ? messages[messages.length - 1].created_at : null
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Failed to duplicate chat session:", error);
    return null;
  }

  // Insert copied messages mapped to new session
  if (messages && messages.length > 0) {
    const newMessages = messages.map((m) => ({
      session_id: data.id,
      role: m.role,
      content: m.content,
      token_count: m.token_count,
      metadata: m.metadata,
      created_at: m.created_at, // Preserve original timestamps to maintain order
    }));

    const { error: insertMessagesError } = await supabase
      .from("messages")
      .insert(newMessages);

    if (insertMessagesError) {
      console.error("Failed to insert duplicated messages:", insertMessagesError);
      // We still return the new session ID even if messages fail, though in production we might want to rollback.
    }
  }

  revalidatePath(`/dashboard/mentors/${mentorId}`);
  return data.id;
}

export async function updateSessionSummary(sessionId: string, summary: string) {
  const { error } = await supabase
    .from("chat_sessions")
    .update({ ai_summary: summary })
    .eq("id", sessionId);

  if (error) {
    console.error("Failed to update session summary:", error);
    return false;
  }
  return true;
}

export async function updateSessionLastOpened(sessionId: string) {
  await supabase
    .from("chat_sessions")
    .update({ last_opened: new Date().toISOString() })
    .eq("id", sessionId);
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
