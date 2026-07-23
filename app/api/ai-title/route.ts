import { auth } from "@clerk/nextjs/server";
import { generateAIConversationTitle } from "@/actions/conversationIntelligence";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { sessionId, messages } = body;

    if (!sessionId || !Array.isArray(messages) || messages.length === 0) {
      return new Response("Missing sessionId or messages", { status: 400 });
    }

    // Fire AI title generation — updates Supabase, Realtime broadcasts to all clients
    const title = await generateAIConversationTitle(sessionId, messages);

    return Response.json({ title, success: !!title });
  } catch (error) {
    console.error("[/api/ai-title] Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
