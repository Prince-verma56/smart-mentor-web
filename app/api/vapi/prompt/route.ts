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

    const url = `http://127.0.0.1:8000/api/v1/chat/prompt/${mentorId}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        base_prompt: basePrompt,
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
