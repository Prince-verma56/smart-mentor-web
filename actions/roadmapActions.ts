"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function toggleTopicStatusAction(topicId: string, currentStatus: string) {
  try {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    
    const { error } = await supabase
      .from("topics")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", topicId);

    if (error) {
      console.error("Failed to update topic status:", error);
      return { error: "Failed to update progress" };
    }

    // Revalidate the dashboard page to reflect the new progress
    revalidatePath("/dashboard/mentors", "layout");
    
    return { success: true, newStatus };
  } catch (error) {
    console.error("Error toggling topic status:", error);
    return { error: "Something went wrong" };
  }
}
