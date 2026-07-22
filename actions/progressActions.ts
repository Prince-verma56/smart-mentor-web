"use server";

/**
 * Progress Actions — All lesson state management.
 * Called by: RoadmapCard, ConversationPanel (auto-detect), mentor pages.
 */

import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { updateTopicStatus } from "./learningStateEngine";

// ─── Mark a topic complete ────────────────────────────────────────────────────

export async function markTopicComplete(topicId: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const result = await updateTopicStatus(topicId, "completed", new Date().toISOString());
  if (result.error) return result;

  revalidatePath("/dashboard/mentors", "layout");
  return { success: true, action: "completed" };
}

// ─── Mark a topic incomplete (undo) ──────────────────────────────────────────

export async function markTopicIncomplete(topicId: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  // Find the topic's roadmap to re-lock subsequent topics
  const { data: topic } = await supabase
    .from("roadmap_topics")
    .select("id, roadmap_id, order_index")
    .eq("id", topicId)
    .single();

  if (!topic) return { error: "Topic not found" };

  // Set this topic back to in-progress
  await supabase
    .from("roadmap_topics")
    .update({ status: "in-progress", completed_at: null, updated_at: new Date().toISOString() })
    .eq("id", topicId);

  // Lock all topics that were unlocked after this one
  const { data: subsequentTopics } = await supabase
    .from("roadmap_topics")
    .select("id, status, order_index")
    .eq("roadmap_id", topic.roadmap_id)
    .gt("order_index", topic.order_index)
    .neq("status", "completed");

  if (subsequentTopics && subsequentTopics.length > 0) {
    await supabase
      .from("roadmap_topics")
      .update({ status: "locked", updated_at: new Date().toISOString() })
      .in("id", subsequentTopics.map((t: any) => t.id));
  }

  revalidatePath("/dashboard/mentors", "layout");
  return { success: true, action: "incomplete" };
}

// ─── Skip a topic ─────────────────────────────────────────────────────────────

export async function skipTopic(topicId: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const result = await updateTopicStatus(topicId, "skipped");
  if (result.error) return result;

  // After skipping, unlock the next one
  const { data: topic } = await supabase
    .from("roadmap_topics")
    .select("roadmap_id, order_index")
    .eq("id", topicId)
    .single();

  if (topic) {
    const { data: nextTopic } = await supabase
      .from("roadmap_topics")
      .select("id, status")
      .eq("roadmap_id", topic.roadmap_id)
      .eq("order_index", topic.order_index + 1)
      .single();

    if (nextTopic && nextTopic.status === "locked") {
      await supabase
        .from("roadmap_topics")
        .update({ status: "in-progress", updated_at: new Date().toISOString() })
        .eq("id", nextTopic.id);
    }
  }

  revalidatePath("/dashboard/mentors", "layout");
  return { success: true, action: "skipped" };
}

// ─── Mark topic needs revision ────────────────────────────────────────────────

export async function markRevisionRequired(topicId: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const result = await updateTopicStatus(topicId, "revision-required");
  if (result.error) return result;

  revalidatePath("/dashboard/mentors", "layout");
  return { success: true, action: "revision-required" };
}

// ─── Resume a skipped or revision topic ──────────────────────────────────────

export async function resumeTopic(topicId: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const result = await updateTopicStatus(topicId, "in-progress");
  if (result.error) return result;

  revalidatePath("/dashboard/mentors", "layout");
  return { success: true, action: "resumed" };
}

// ─── Toggle (complete ↔ in-progress) — used by RoadmapCard ──────────────────

export async function toggleTopicStatusAction(topicId: string, currentStatus: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  if (currentStatus === "completed") {
    return await markTopicIncomplete(topicId);
  } else if (currentStatus === "locked") {
    // Can't toggle locked topics
    return { error: "Topic is locked. Complete the previous topic first." };
  } else {
    return await markTopicComplete(topicId);
  }
}

// ─── Reset entire roadmap ─────────────────────────────────────────────────────

export async function resetRoadmap(mentorId: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const { data: roadmap } = await supabase
    .from("roadmaps")
    .select("id")
    .eq("mentor_id", mentorId)
    .single();

  if (!roadmap) return { error: "No roadmap found" };

  // Reset all topics: first one in-progress, rest locked
  const { data: topics } = await supabase
    .from("roadmap_topics")
    .select("id, order_index")
    .eq("roadmap_id", roadmap.id)
    .order("order_index", { ascending: true });

  if (!topics || topics.length === 0) return { error: "No topics found" };

  // Set first to in-progress
  await supabase
    .from("roadmap_topics")
    .update({
      status: "in-progress",
      completed_at: null,
      is_skipped: false,
      revision_required: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", topics[0].id);

  // Set the rest to locked
  if (topics.length > 1) {
    await supabase
      .from("roadmap_topics")
      .update({
        status: "locked",
        completed_at: null,
        is_skipped: false,
        revision_required: false,
        updated_at: new Date().toISOString(),
      })
      .in("id", topics.slice(1).map((t: any) => t.id));
  }

  revalidatePath("/dashboard/mentors", "layout");
  return { success: true };
}
