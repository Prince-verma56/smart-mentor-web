import { auth } from "@clerk/nextjs/server";
import { extractVoiceSessionMemory } from "@/actions/conversationIntelligence";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { transcript, mentorId, sessionId } = body;

    if (!transcript || !mentorId) {
      return new Response("Missing transcript or mentorId", { status: 400 });
    }

    // Extract voice memory — saves to mentor_memories + updates session summary
    const result = await extractVoiceSessionMemory(
      transcript,
      mentorId,
      sessionId || null
    );

    return Response.json(result);
  } catch (error) {
    console.error("[/api/summarize] Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
