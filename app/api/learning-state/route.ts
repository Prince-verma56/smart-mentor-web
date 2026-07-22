import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }
    const token = await getToken();

    const { searchParams } = new URL(req.url);
    const mentorId = searchParams.get("mentorId");
    const sessionId = searchParams.get("sessionId") || "";

    if (!mentorId) {
      return new Response("Missing mentorId", { status: 400 });
    }

    let url = `http://127.0.0.1:8000/api/v1/chat/learning-state/${mentorId}`;
    if (sessionId) {
      url += `?session_id=${sessionId}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Python Backend Error:", errorText);
      return new Response("Backend Error", { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Learning State API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
