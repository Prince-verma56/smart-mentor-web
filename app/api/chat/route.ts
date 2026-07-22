import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { getMentorById } from "@/actions/mentorActions";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    console.log("Proxying to Python Backend:", body);
    
    // Vercel AI SDK might send extra properties in `body.data` or at the root `body`
    const mentorId = body.mentorId || (body.data && body.data.mentorId);
    const model = body.model || (body.data && body.data.model) || "llama-3.1-8b-instant";
    const messages = body.messages;

    if (!mentorId) {
      return new Response("Missing mentorId", { status: 400 });
    }
    const mentor = await getMentorById(mentorId);
    
    if (!mentor) {
      return new Response("Mentor not found", { status: 404 });
    }

    const systemPrompt = `You are ${mentor.name}, a ${mentor.role} specializing in ${mentor.subject}.
Your teaching style is: ${mentor.conversationStyle}.
The student's learning goal is: ${mentor.learningGoal}.

CURRENT TOPIC CONTEXT:
The student is currently learning: "${mentor.stats.currentTopic}".
Please tailor your responses to help them understand this specific topic, unless they explicitly ask about something else.

CRITICAL INSTRUCTIONS:
- You must deeply embody this persona.
- Keep responses relatively concise and focused on the learning goal.
- Be encouraging and structured in your explanations.
- Never break character or refer to yourself as an AI assistant.`;

    const payload = {
      messages: body.messages,
      mentorId: mentorId,
      model: model,
      sessionId: body.sessionId || (body.data && body.data.sessionId),
      system_prompt: systemPrompt
    };

    const response = await fetch("http://127.0.0.1:8000/api/v1/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Python Backend Error:", errorText);
      return new Response("Backend Error", { status: response.status });
    }

    return new Response(response.body, {
      headers: { "Content-Type": "text/plain" }
    });
  } catch (error) {
    console.error("Chat API Proxy Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
