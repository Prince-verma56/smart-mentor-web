import { getMentorById } from "@/actions/mentorActions";
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

    // ── Step 1: Fetch Mentor Profile for base prompt ──────────────────────────
    const mentor = await getMentorById(mentorId);
    if (!mentor) {
      return new Response("Mentor not found", { status: 404 });
    }

    let systemPrompt = `You are ${mentor.name}, a ${mentor.role} specializing in ${mentor.subject}.
TEACHING STYLE: ${mentor.conversation_style || "encouraging"}, ${mentor.teaching_speed || "moderate"}, ${mentor.response_length || "detailed"}.
STUDENT GOAL: ${mentor.learning_goal || "Master " + mentor.subject}.`;

    if (action) {
      if (action === "explain") {
        systemPrompt += "\n\nACTION OVERRIDE: The user requested a detailed explanation of the current topic. Provide a comprehensive, deep-dive explanation with examples.";
      } else if (action === "practice") {
        systemPrompt += "\n\nACTION OVERRIDE: The user requested a practice exercise. Generate a practical, hands-on exercise or coding challenge related to the current topic. Do not provide the solution immediately.";
      } else if (action === "quiz") {
        systemPrompt += "\n\nACTION OVERRIDE: The user requested a quiz. Generate a short 3-question quiz about the current topic to test their understanding.";
      } else if (action === "summarize") {
        systemPrompt += "\n\nACTION OVERRIDE: The user requested a summary. Summarize the key takeaways from the conversation so far, focusing on what they've learned.";
      }
    }

    // ── Step 2: Proxy to Python Backend ───────────────────────────────────────
    const payload = {
      messages,
      mentorId,
      model,
      sessionId,
      system_prompt: systemPrompt,
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

    // ── Step 3: Stream response back to client ────────────────────────────────
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
