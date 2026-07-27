import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }
    const token = await getToken();

    const body = await req.json();

    const mentorId = body.mentorId || (body.data && body.data.mentorId);
    const sessionId = body.sessionId || (body.data && body.data.sessionId) || null;
    const model = body.model || (body.data && body.data.model) || "llama-3.1-8b-instant";
    const messages = body.messages || [];
    const action = body.action || (body.data && body.data.action) || null;

    if (!mentorId) {
      return new Response("Missing mentorId", { status: 400 });
    }

    // ── Phase 4: Context Assembly moved to Python LangGraph ─────────────────
    // Next.js now acts only as a secure proxy.
    
    const payload = {
      messages,
      mentor_id: mentorId,
      model,
      session_id: sessionId,
      system_prompt: "", // Assembled dynamically in LangGraph
      action,
      attachments: body.attachments || (body.data && body.data.attachments) || [],
    };

    const response = await fetch("http://127.0.0.1:8000/api/v1/chat", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Python Backend Error:", errorText);
      return new Response("Backend Error", { status: response.status });
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Accel-Buffering": "no",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
