"use server";

import { supabase } from "@/lib/supabase";
import Groq from "groq-sdk";

let _groq: Groq | null = null;
function getGroq() {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

// ─── AI Title Generation ──────────────────────────────────────────────────────
// Called after the FIRST complete AI response. Generates a 3-6 word title and
// saves it to Supabase. Realtime subscription in ConversationContext picks up the
// UPDATE automatically — no client refresh needed.

export async function generateAIConversationTitle(
  sessionId: string,
  messages: { role: string; content: string }[]
): Promise<string | null> {
  try {
    const relevantMessages = messages
      .filter((m) => m.role !== "system")
      .slice(0, 6)
      .map(
        (m) =>
          `${m.role === "user" ? "User" : "Mentor"}: ${m.content.slice(0, 300)}`
      )
      .join("\n");

    if (!relevantMessages.trim()) return null;

    const completion = await getGroq().chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: `Based on this learning conversation, generate a concise 3-6 word title that accurately describes the topic. Return ONLY the title — no quotes, no punctuation at the end, no explanation.

Examples of good titles:
- React Authentication Setup
- MongoDB Schema Design
- Fixing JWT Middleware
- SQL Query Optimization
- Python List Comprehensions

Conversation:
${relevantMessages}

Title:`,
        },
      ],
      temperature: 0.3,
      max_tokens: 20,
    });

    const rawTitle =
      completion.choices[0]?.message?.content?.trim() || null;
    if (!rawTitle) return null;

    // Sanitize
    const cleanTitle = rawTitle
      .replace(/^["'`]|["'`]$/g, "")
      .replace(/[.!?]$/, "")
      .trim()
      .slice(0, 60);

    if (cleanTitle.length < 3) return null;

    // Persist — Realtime subscription will broadcast to all clients
    const { error } = await supabase
      .from("chat_sessions")
      .update({ title: cleanTitle })
      .eq("id", sessionId);

    if (error) {
      console.error("[AI Title] Supabase save error:", error.message);
      return null;
    }

    return cleanTitle;
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
    const msgText = messages
      .filter((m) => m.role !== "system")
      .map(
        (m) =>
          `${m.role === "user" ? "User" : "Mentor"}: ${m.content}`
      )
      .join("\n\n");

    if (!msgText.trim()) return null;

    const completion = await getGroq().chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: `Analyze this learning conversation and produce a structured summary for future mentor sessions. Be concise — 1-2 sentences per section.

Conversation:
${msgText.slice(0, 6000)}

Format your response EXACTLY like this:
TOPICS: [comma-separated topics discussed]
KEY_CONCEPTS: [main ideas explained]
EXERCISES: [practice problems or exercises given, or "None"]
HOMEWORK: [tasks assigned to learner, or "None"]
PROGRESS: [topics completed or in progress]
STRUGGLES: [misconceptions, errors, or areas needing help]
NEXT_STEPS: [recommended next topics]`,
        },
      ],
      temperature: 0.3,
      max_tokens: 400,
    });

    const summary =
      completion.choices[0]?.message?.content?.trim() || null;
    if (!summary) return null;

    // Save to chat_sessions.ai_summary
    await supabase
      .from("chat_sessions")
      .update({ ai_summary: summary })
      .eq("id", sessionId);

    return summary;
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
    if (!transcript.trim()) return { success: false };

    const completion = await getGroq().chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: `Analyze this voice learning session transcript and extract structured memory.

TRANSCRIPT:
${transcript.slice(0, 8000)}

Format your response EXACTLY like this (include all headers):
SUMMARY: [2-sentence description of what was discussed]
TOPICS: [comma-separated topics covered]
LEARNED: [what the student successfully understood]
STRUGGLES: [misconceptions, errors, or areas of difficulty]
HOMEWORK: [tasks assigned, or "None"]
ROADMAP_PROGRESS: [any roadmap topics completed or mentioned, or "None"]
MEMORIES:
- [strength/weakness/preference/general] [specific insight about this student's learning]
- [strength/weakness/preference/general] [specific insight about this student's learning]`,
        },
      ],
      temperature: 0.3,
      max_tokens: 600,
    });

    const text =
      completion.choices[0]?.message?.content?.trim() || "";
    if (!text) return { success: false };

    // Parse sections
    const summaryText =
      text.split("SUMMARY:")[1]?.split("TOPICS:")[0]?.trim() ||
      "Voice session completed.";
    const topicsRaw =
      text.split("TOPICS:")[1]?.split("LEARNED:")[0]?.trim() || "";
    const topics = topicsRaw
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean);
    const memoriesSection = text.split("MEMORIES:")[1] || "";

    const voiceSummary = `[Voice Session]\n${summaryText}\nTopics: ${topics.join(", ")}`;

    // Update the chat session with voice summary
    if (sessionId) {
      await supabase
        .from("chat_sessions")
        .update({
          ai_summary: voiceSummary,
          voice_count: supabase.rpc("increment_voice_count", {
            session_id: sessionId,
          }) as any, // fallback: will be incremented by trigger if available
        })
        .eq("id", sessionId);

      // Simpler fallback for voice_count if rpc doesn't exist
      const { error: rpcError } = await supabase.rpc("increment_voice_count" as any, {
        session_id: sessionId,
      });
      if (rpcError) {
        // If RPC doesn't exist, do a raw increment
        const { data: current } = await supabase
          .from("chat_sessions")
          .select("voice_count")
          .eq("id", sessionId)
          .single();
        if (current) {
          await supabase
            .from("chat_sessions")
            .update({ voice_count: (current.voice_count || 0) + 1 })
            .eq("id", sessionId);
        }
      }
    }

    // Save long-term memories into mentor_memories
    const memoryLines = memoriesSection
      .split("\n")
      .filter((l: string) => l.includes("- ["));

    for (const line of memoryLines) {
      const match = line.match(/- \[(.*?)\] (.*)/);
      if (match) {
        await supabase.from("mentor_memories").insert({
          mentor_id: mentorId,
          category: match[1].toLowerCase().trim(),
          memory_text: match[2].trim(),
          importance: 3, // Voice sessions get higher importance
        });
      }
    }

    return { success: true, summary: voiceSummary };
  } catch (err) {
    console.error("[Voice Memory] Failed:", err);
    return { success: false };
  }
}
