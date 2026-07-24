"use server";

import { auth } from "@clerk/nextjs/server";

// ─── AI Title Generation ──────────────────────────────────────────────────────
// Called after the FIRST complete AI response. Generates a 3-6 word title and
// saves it to Supabase. Realtime subscription in ConversationContext picks up the
// UPDATE automatically — no client refresh needed.

export async function generateAIConversationTitle(
  sessionId: string,
  messages: { role: string; content: string }[]
): Promise<string | null> {
  try {
    const { getToken } = await auth();
    const token = await getToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/intelligence/title`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session_id: sessionId,
        messages: messages
      })
    });

    if (!response.ok) {
      console.error("[AI Title] FastAPI Error:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.title || null;
  } catch (err) {
    console.error("[AI Title] Failed:", err);
    return null;
  }
}

// ─── AI Conversation Summary ──────────────────────────────────────────────────
// Generated after 10+ messages or when a session is closed.
// Stored in chat_sessions.ai_summary and used as long-term mentor memory.

export async function generateConversationSummary(
  sessionId: string,
  mentorId: string,
  messages: { role: string; content: string }[]
): Promise<string | null> {
  try {
    const { getToken } = await auth();
    const token = await getToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/intelligence/summary`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session_id: sessionId,
        mentor_id: mentorId,
        messages: messages
      })
    });

    if (!response.ok) {
      console.error("[AI Summary] FastAPI Error:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.summary || null;
  } catch (err) {
    console.error("[AI Summary] Failed:", err);
    return null;
  }
}

// ─── Voice Session Memory Extraction ─────────────────────────────────────────
// Called when a Vapi voice session ends. Extracts structured learning insights
// from the transcript and saves them as mentor_memories + updates the session.

export async function extractVoiceSessionMemory(
  transcript: string,
  mentorId: string,
  sessionId: string | null
): Promise<{ success: boolean; summary?: string }> {
  try {
    const { getToken } = await auth();
    const token = await getToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/intelligence/voice-memory`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mentor_id: mentorId,
        transcript: transcript,
        session_id: sessionId
      })
    });

    if (!response.ok) {
      console.error("[Voice Memory] FastAPI Error:", await response.text());
      return { success: false };
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("[Voice Memory] Failed:", err);
    return { success: false };
  }
}
