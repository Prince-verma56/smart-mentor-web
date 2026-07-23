"use server";

import { createClient } from "@supabase/supabase-js";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

// Phase X: Background Summarizer Utility
export async function summarizeSessionAndExtractMemories(
  mentorId: string,
  sessionId: string,
  transcript: string
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Prompt the LLM to extract memories and summarize
    const { text } = await generateText({
      model: openai("gpt-3.5-turbo"),
      prompt: `Analyze the following chat/voice session transcript between a student and an AI mentor.
      
TRANSCRIPT:
${transcript}

TASK 1: Extract 1-3 bullet points summarizing the topics covered.
TASK 2: Extract any long-term memories about the student's learning style, weaknesses, strengths, or preferences.
Format your response exactly like this:
SUMMARY: [A 2 sentence summary of the session]
TOPICS: [comma separated topics]
MEMORIES:
- [category: weakness/strength/preference/general] [Memory description]`,
    });

    // Note: In production, parse the text robustly using regex or structured outputs
    const summaryText = text.split("SUMMARY:")[1]?.split("TOPICS:")[0]?.trim() || "Session completed.";
    const topics = text.split("TOPICS:")[1]?.split("MEMORIES:")[0]?.split(",").map((t) => t.trim()) || [];
    const memoriesSection = text.split("MEMORIES:")[1] || "";
    
    // Save the summary
    await supabase.from("session_summaries").insert({
      mentor_id: mentorId,
      source_session_id: sessionId,
      summary_text: summaryText,
      topics_covered: topics,
    });

    // Save the memories
    const memoryLines = memoriesSection.split("\n").filter((l) => l.includes("- ["));
    for (const line of memoryLines) {
      const match = line.match(/- \[(.*?)\] (.*)/);
      if (match) {
        await supabase.from("mentor_memories").insert({
          mentor_id: mentorId,
          category: match[1].toLowerCase(),
          memory_text: match[2],
          importance: 2, // Default importance
        });
      }
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to summarize session:", err);
    return { success: false };
  }
}
