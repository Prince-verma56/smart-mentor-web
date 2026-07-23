"use client";

import { useMemo } from "react";
import type { MentorRoadmap } from "@/types/roadmap";
import type { MentorStats } from "@/types/mentor";

/**
 * useRealtimeStats
 *
 * Derives live MentorStats from a live MentorRoadmap.
 * Every time the roadmap updates (via useRealtimeRoadmap), stats recompute instantly.
 *
 * Usage:
 *   const stats = useRealtimeStats(mentorId, roadmap, baseStats);
 */
export function useRealtimeStats(
  mentorId: string,
  roadmap: MentorRoadmap | null | undefined,
  baseStats: MentorStats
): MentorStats {
  return useMemo(() => {
    if (!roadmap) return baseStats;

    const allTopics = roadmap.phases.flatMap((p) => p.topics);
    const totalTopics = allTopics.length;
    const completedTopics = allTopics.filter(
      (t) => t.status === "completed"
    ).length;
    const progressPercent =
      totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    const currentTopic =
      allTopics.find((t) => t.status === "in-progress")?.title ||
      allTopics.find((t) => t.status === "available")?.title ||
      baseStats.currentTopic;

    const nextTopicSuggestion = (() => {
      const current = allTopics.find((t) => t.status === "in-progress");
      if (!current) return baseStats.nextTopicSuggestion;
      const currentIdx = allTopics.findIndex((t) => t.id === current.id);
      return allTopics[currentIdx + 1]?.title ?? undefined;
    })();

    return {
      ...baseStats,
      mentorId,
      totalTopics,
      completedTopics,
      progressPercent,
      currentTopic: currentTopic || "Introduction",
      nextTopicSuggestion,
    };
  }, [mentorId, roadmap, baseStats]);
}
