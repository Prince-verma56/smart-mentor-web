import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/sessions/[sessionId]/summary
 *
 * Generates a rolling AI summary of the conversation and stores it
 * in chat_sessions.summary for use in future prompt building.
 *
 * Body: { messages: { role: string, content: string }[] }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;
  const { messages } = await req.json();

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  // Verify session ownership
  const { data: session, error: sessionError } = await supabase
    .from("chat_sessions")
    .select("id, user_id")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session || session.user_id !== userId) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Build a short summary from the messages
  const recentMessages = messages.slice(-20); // Last 20 messages
  const summaryPrompt = `Summarize this learning conversation in 3-5 bullet points. Focus on:
- What topic the student is currently studying
- What has been completed
- Key struggles or questions raised
- Important decisions made
- Next steps planned

Conversation:
${recentMessages.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n")}

Provide a concise summary (max 200 words):`;

  try {
    // Call the backend Python service for summarization
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    const response = await fetch(`${backendUrl}/api/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: summaryPrompt }],
        model: "llama-3.1-8b-instant",
        action: "summarize",
      }),
    });

    let summary = "";
    if (response.ok && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        summary += decoder.decode(value, { stream: true });
      }
      summary += decoder.decode();
    }

    if (!summary) {
      summary = "Conversation in progress.";
    }

    // Store in Supabase
    await supabase
      .from("chat_sessions")
      .update({ summary: summary.trim(), updated_at: new Date().toISOString() })
      .eq("id", sessionId);

    return NextResponse.json({ summary: summary.trim() });
  } catch (error) {
    console.error("Summary generation failed:", error);
    return NextResponse.json(
      { error: "Summary generation failed" },
      { status: 500 }
    );
  }
}
