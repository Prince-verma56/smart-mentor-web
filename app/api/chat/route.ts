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

    const voicePersonalityMap: Record<string, string> = {
      "21m00Tcm4TlvDq8ikWAM": "You have a female, friendly, and clear personality.",
      "29vD33N1CtxCmqQRPOHJ": "You have a male, professional, and formal personality.",
      "EXAVITQu4vr4xnSDxMaL": "You have a female, soft, and deeply encouraging personality.",
      "pNInz6obpgDQGcFmaJgB": "You have a male, deep, strict, and highly disciplined personality.",
      "MF3mGyEYCl7XYWbV9V6O": "You have a female, young, and highly energetic personality.",
      "TxGEqnHWrfWFTfGW9XjX": "You have a male, casual, and relaxed personality."
    };

    let systemPrompt = `You are ${mentor.name}, a ${mentor.role} specializing in ${mentor.subject}.
TEACHING STYLE: ${mentor.conversation_style || "encouraging"}, ${mentor.teaching_speed || "moderate"}, ${mentor.response_length || "detailed"}.
STUDENT GOAL: ${mentor.learning_goal || "Master " + mentor.subject}.`;

    if (mentor.voice_id && voicePersonalityMap[mentor.voice_id]) {
      systemPrompt += `\nPERSONALITY: ${voicePersonalityMap[mentor.voice_id]}`;
    }

    // ── Phase X: Unified Context Assembly ──────────────────────────────────────────
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      
      // 1. Long-term mentor memories
      const { data: memories } = await supabase
        .from('mentor_memories')
        .select('memory_text, category')
        .eq('mentor_id', mentorId)
        .order('importance', { ascending: false })
        .limit(10);
        
      if (memories && memories.length > 0) {
        systemPrompt += "\n\nLONG-TERM MEMORY ABOUT THE STUDENT:";
        memories.forEach((m: any) => {
          systemPrompt += `\n- [${m.category}] ${m.memory_text}`;
        });
      }

      // 2. Current session AI summary (if returning to an existing conversation)
      if (sessionId) {
        const { data: currentSession } = await supabase
          .from('chat_sessions')
          .select('ai_summary, title')
          .eq('id', sessionId)
          .single();
        
        if (currentSession?.ai_summary) {
          systemPrompt += `\n\nCURRENT CONVERSATION CONTEXT ("${currentSession.title || 'this session'}"):`;
          systemPrompt += `\n${currentSession.ai_summary}`;
        }
      }

      // 3. Recent session summaries (cross-session memory — last 3 other sessions)
      const { data: recentSessions } = await supabase
        .from('chat_sessions')
        .select('title, ai_summary, summary')
        .eq('mentor_id', mentorId)
        .not('id', 'eq', sessionId || '')
        .not('ai_summary', 'is', null)
        .order('last_message_at', { ascending: false })
        .limit(3);
      
      if (recentSessions && recentSessions.length > 0) {
        const withSummaries = recentSessions.filter((s: any) => s.ai_summary);
        if (withSummaries.length > 0) {
          systemPrompt += "\n\nPREVIOUS SESSION CONTEXT (recent learning history):";
          withSummaries.forEach((s: any, idx: number) => {
            systemPrompt += `\n--- Session ${idx + 1}: "${s.title || 'Previous'}" ---`;
            systemPrompt += `\n${s.ai_summary}`;
          });
        }
      }

      // 4. Roadmap Context
      const { data: roadmap } = await supabase
        .from('roadmaps')
        .select('title, current_node_id, nodes, progress')
        .eq('user_id', userId)
        .eq('mentor_id', mentorId)
        .single();
        
      if (roadmap) {
        systemPrompt += `\n\nROADMAP CONTEXT:`;
        systemPrompt += `\nLearning Path: "${roadmap.title}"`;
        systemPrompt += `\nOverall Progress: ${roadmap.progress || 0}%`;
        
        // Find current topic
        if (roadmap.current_node_id && roadmap.nodes) {
          const nodes = typeof roadmap.nodes === 'string' ? JSON.parse(roadmap.nodes) : roadmap.nodes;
          const currentNode = nodes.find((n: any) => n.id === roadmap.current_node_id);
          if (currentNode) {
            systemPrompt += `\nCurrent Learning Topic: "${currentNode.data?.label || currentNode.id}"`;
          }
        }
      }
    } catch (e) {
      console.warn("Phase X Context Assembly failed:", e);
    }

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
