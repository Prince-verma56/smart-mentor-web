import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }
    const token = await getToken();

    const formData = await req.formData();
    
    // We need to forward the formData to the FastAPI backend
    const response = await fetch("http://127.0.0.1:8000/api/v1/resources/upload", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
        // Do NOT set Content-Type here, let fetch handle the boundary for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("FastAPI Upload Error:", errorText);
      return new Response(errorText, { status: response.status });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Upload proxy error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
