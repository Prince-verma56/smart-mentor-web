"use server";

import { mentorService } from "@/services/mentorService";
import { roadmapService } from "@/services/roadmapService";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function createMentorAction(formData: FormData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "You must be logged in to create a mentor." };
    }
    
    // Parse form data
    const name = formData.get("name") as string || "AI Mentor";
    const role = formData.get("role") as string || "General Guide";
    const subject = formData.get("subject") as string || "general";
    const specialization = formData.get("specialization") as string || "";
    const difficultyLevel = formData.get("difficultyLevel") as string || "beginner";
    const learningStyle = formData.get("learningStyle") as string || "mixed";
    const conversationStyle = formData.get("conversationStyle") as string || "encouraging";
    const teachingSpeed = formData.get("teachingSpeed") as string || "moderate";
    const responseLength = formData.get("responseLength") as string || "detailed";
    const preferredLanguage = formData.get("preferredLanguage") as string || "English";
    const learningGoal = formData.get("learningGoal") as string || "General learning";
    const knowledgeFocus = formData.get("knowledgeFocus") as string || "";
    const sessionDuration = parseInt(formData.get("sessionDuration") as string || "30", 10);

    const mentorId = await mentorService.createMentor(userId, {
      name,
      role,
      subject,
      specialization,
      difficultyLevel,
      learningStyle,
      conversationStyle,
      teachingSpeed,
      responseLength,
      preferredLanguage,
      learningGoal,
      sessionDuration,
      knowledgeFocus,
    });

    // Generate AI roadmap immediately so it completes during the UI loading animation
    try {
      await roadmapService.generateRoadmapForMentor(mentorId, userId);
    } catch (err) {
      console.error("Roadmap Generation Failed during mentor creation:", err);
    }

    // Revalidate the mentors dashboard page so the new mentor shows up
    revalidatePath("/dashboard/mentors");
    
    return { success: true, mentorId };
  } catch (error) {
    console.error("Failed to create mentor:", error);
    return { error: "Failed to create AI mentor. Please try again." };
  }
}
