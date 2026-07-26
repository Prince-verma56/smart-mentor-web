/**
 * POST /api/vapi/prompt
 *
 * Called by Vapi as a server-side webhook BEFORE the AI call begins.
 * Vapi does NOT send a Clerk JWT — it sends its own x-vapi-secret header.
 *
 * Authentication strategy:
 *   1. Validate the x-vapi-secret header against VAPI_WEBHOOK_SECRET env var.
 *   2. Extract mentorId, userId, sessionId from the Vapi message body.
 *   3. Build context from Supabase (memories, session summaries, roadmap).
 *   4. Call FastAPI /api/v1/chat/prompt/{mentorId} using the service key
 *      (server-to-server, no user JWT needed for this call).
 *   5. Return { prompt, greeting } to Vapi.
 */

import { createClient } from "@supabase/supabase-js";

// Service-role Supabase client (server-side only, never exposed to browser)
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !serviceKey) throw new Error("Supabase env vars missing");
  return createClient(url, serviceKey);
}

export async function POST(req: Request) {
  try {
    // ── 1. Authenticate Vapi webhook ────────────────────────────────────
    const vapiSecret = req.headers.get("x-vapi-secret");
    const expectedSecret = process.env.VAPI_WEBHOOK_SECRET;

    // If VAPI_WEBHOOK_SECRET is configured, enforce it
    if (expectedSecret && vapiSecret !== expectedSecret) {
      console.warn("[Vapi Prompt] Invalid x-vapi-secret");
      return new Response("Unauthorized", { status: 401 });
    }

    // ── 2. Parse Vapi body ───────────────────────────────────────────────
    const body = await req.json();

    // Vapi sends: { message: { call: { metadata: { mentorId, userId, sessionId } } } }
    // Direct callers (frontend) send: { mentorId, basePrompt, sessionId }
    let mentorId: string;
    let userId: string | null = null;
    let sessionId: string | null = null;
    let basePrompt: string = "";

    if (body?.message?.call?.metadata) {
      // ── Vapi webhook format ──
      const meta = body.message.call.metadata;
      mentorId = meta.mentorId;
      userId = meta.userId ?? null;
      sessionId = meta.sessionId ?? null;
      basePrompt = meta.basePrompt ?? "";
    } else {
      // ── Direct call from frontend ──
      mentorId = body.mentorId;
      userId = body.userId ?? null;
      sessionId = body.sessionId ?? null;
      basePrompt = body.basePrompt ?? "";
    }

    if (!mentorId) {
      return new Response("Missing mentorId", { status: 400 });
    }

    let systemPrompt = basePrompt;

    // ── 3. Enrich prompt with Supabase context ───────────────────────────
    try {
      const supabase = getSupabaseAdmin();

      // a) Long-term mentor memories
      const { data: memories } = await supabase
        .from("mentor_memory")
        .select("content, context")
        .eq("mentor_id", mentorId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (memories && memories.length > 0) {
        systemPrompt += "\n\nLONG-TERM MEMORY ABOUT THE STUDENT:";
        memories.forEach((m: any) => {
          systemPrompt += `\n- ${m.content}`;
        });
      }

      // b) Current session AI summary
      if (sessionId) {
        const { data: currentSession } = await supabase
          .from("chat_sessions")
          .select("ai_summary, title")
          .eq("id", sessionId)
          .single();

        if (currentSession?.ai_summary) {
          systemPrompt += `\n\nCURRENT SESSION CONTEXT ("${currentSession.title || "this session"}"):`;
          systemPrompt += `\n${currentSession.ai_summary}`;
        }
      }

      // c) Recent session summaries (cross-session memory)
      const { data: recentSessions } = await supabase
        .from("chat_sessions")
        .select("title, ai_summary")
        .eq("mentor_id", mentorId)
        .not("id", "eq", sessionId ?? "")
        .not("ai_summary", "is", null)
        .order("last_message_at", { ascending: false })
        .limit(3);

      if (recentSessions && recentSessions.length > 0) {
        const withSummaries = recentSessions.filter((s: any) => s.ai_summary);
        if (withSummaries.length > 0) {
          systemPrompt += "\n\nPREVIOUS SESSION SUMMARIES:";
          withSummaries.forEach((s: any, idx: number) => {
            systemPrompt += `\n--- Session ${idx + 1}: "${s.title || "Previous"}" ---`;
            systemPrompt += `\n${s.ai_summary}`;
          });
        }
      }
    } catch (e) {
      console.warn("[Vapi Prompt] Context assembly failed:", e);
      // Non-fatal — continue with base prompt
    }

    // ── 4. Call FastAPI for learning state + dynamic greeting ────────────
    const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
    const fastApiUrl = `${backendUrl}/api/v1/chat/prompt/${mentorId}`;

    // Use service-key based auth for server-to-server call
    // FastAPI will accept this because we bypass Clerk auth for this specific route
    const response = await fetch(fastApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Pass service key so FastAPI can identify it as a trusted server call
        "X-Service-Key": process.env.SUPABASE_SERVICE_KEY ?? "",
      },
      body: JSON.stringify({
        base_prompt: systemPrompt,
        session_id: sessionId,
        user_id: userId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Vapi Prompt] FastAPI error:", errorText);
      // Gracefully fall back — return the enriched prompt without learning state
      return Response.json({
        prompt: systemPrompt,
        greeting: "Hi! Welcome back. What would you like to focus on today?",
      });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("[Vapi Prompt] Unhandled error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
