import { auth } from "@clerk/nextjs/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }
    const token = await getToken();

    const body = await req.json();

    const payload = {
      mentor_id: body.mentor_id,
      goal: body.goal,
      preferred_model: body.preferred_model || "llama-3.1-8b-instant",
    };

    const response = await fetch("http://127.0.0.1:8000/api/v1/learning-universe/generate", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(payload),
      signal: req.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Python Backend Error:", errorText);
      return new Response("Backend Error", { status: response.status });
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "X-Accel-Buffering": "no",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error) {
    console.error("Learning Universe API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
