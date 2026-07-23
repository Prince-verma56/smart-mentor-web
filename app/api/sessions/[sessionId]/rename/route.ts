import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/sessions/[sessionId]/rename
 *
 * Auto-generates or manually sets a conversation title.
 *
 * Body: { title?: string, firstMessage?: string }
 * - If title is provided, use it directly
 * - If firstMessage is provided, derive a title from the first 6 words
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
  const { title, firstMessage } = await req.json();

  // Verify session ownership
  const { data: session, error: sessionError } = await supabase
    .from("chat_sessions")
    .select("id, user_id")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session || session.user_id !== userId) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  let finalTitle = title;
  if (!finalTitle && firstMessage) {
    // Derive from first message: take first 6 words, clean punctuation
    finalTitle = firstMessage
      .trim()
      .split(/\s+/)
      .slice(0, 6)
      .join(" ")
      .replace(/[^\w\s]/g, "")
      .trim()
      .slice(0, 60);
  }

  if (!finalTitle) {
    return NextResponse.json({ error: "No title provided" }, { status: 400 });
  }

  const { error } = await supabase
    .from("chat_sessions")
    .update({ title: finalTitle, updated_at: new Date().toISOString() })
    .eq("id", sessionId);

  if (error) {
    return NextResponse.json(
      { error: "Failed to rename session" },
      { status: 500 }
    );
  }

  return NextResponse.json({ title: finalTitle });
}
