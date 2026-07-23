import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }
    const token = await getToken();

    const body = await req.json();
    const { mentorId, basePrompt, sessionId } = body;

    if (!mentorId || !basePrompt) {
      return new Response("Missing mentorId or basePrompt", { status: 400 });
    }

    let systemPrompt = basePrompt;

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

      // 2. Current session AI summary
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

      // 3. Recent session summaries (cross-session memory)
      const { data: recentSessions } = await supabase
        .from('chat_sessions')
        .select('title, ai_summary')
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
        
        if (roadmap.current_node_id && roadmap.nodes) {
          const nodes = typeof roadmap.nodes === 'string' ? JSON.parse(roadmap.nodes) : roadmap.nodes;
          const currentNode = nodes.find((n: any) => n.id === roadmap.current_node_id);
          if (currentNode) {
            systemPrompt += `\nCurrent Learning Topic: "${currentNode.data?.label || currentNode.id}"`;
          }
        }
      }
    } catch (e) {
      console.warn("Phase X Context Assembly failed for VAPI:", e);
    }

    const url = `http://127.0.0.1:8000/api/v1/chat/prompt/${mentorId}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        base_prompt: systemPrompt,
        session_id: sessionId || null
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Python Backend Error:", errorText);
      return new Response("Backend Error", { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Prompt API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
