"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

/**
 * Toggle a topic's status between "completed" and "in-progress".
 * After completing a topic, unlocks the next locked topic in sequence.
 */
export async function toggleTopicStatusAction(topicId: string, currentStatus: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const isCompleting = currentStatus !== "completed";
    const newStatus = isCompleting ? "completed" : "in-progress";

    const { data: topic, error: fetchError } = await supabase
      .from("topics")
      .select("id, roadmap_id, order_index, mentor_id")
      .eq("id", topicId)
      .single();

    if (fetchError || !topic) {
      return { error: "Topic not found" };
    }

    // Update the toggled topic
    const { error: updateError } = await supabase
      .from("topics")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", topicId);

    if (updateError) {
      console.error("Failed to update topic status:", updateError);
      return { error: "Failed to update progress" };
    }

    // If completing: find and unlock the next topic in the same roadmap
    if (isCompleting) {
      const { data: nextTopic } = await supabase
        .from("topics")
        .select("id, status")
        .eq("roadmap_id", topic.roadmap_id)
        .eq("order_index", topic.order_index + 1)
        .single();

      if (nextTopic && nextTopic.status === "locked") {
        await supabase
          .from("topics")
          .update({ status: "in-progress", updated_at: new Date().toISOString() })
          .eq("id", nextTopic.id);
      }
    }

    revalidatePath("/dashboard/mentors", "layout");
    return { success: true, newStatus };
  } catch (error) {
    console.error("Error toggling topic status:", error);
    return { error: "Something went wrong" };
  }
}
