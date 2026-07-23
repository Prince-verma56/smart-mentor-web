"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { MentorRoadmap, RoadmapTopic, TopicStatus } from "@/types/roadmap";

/**
 * useRealtimeRoadmap
 *
 * Subscribes to Supabase Realtime on `roadmap_topics` and `roadmaps` tables.
 * When the AI (or user) changes a topic status or progress percent in the DB,
 * this hook instantly reflects those changes in the UI — no refresh needed.
 *
 * Usage:
 *   const { roadmap, isLoading } = useRealtimeRoadmap(mentorId, initialRoadmap);
 */
export function useRealtimeRoadmap(
  mentorId: string,
  initialRoadmap: MentorRoadmap | null | undefined
) {
  const [roadmap, setRoadmap] = useState<MentorRoadmap | null>(
    initialRoadmap ?? null
  );
  const roadmapIdRef = useRef<string | null>(initialRoadmap?.id ?? null);

  // Sync initial roadmap when it resolves (from Suspense / async)
  useEffect(() => {
    if (initialRoadmap) {
      setRoadmap(initialRoadmap);
      roadmapIdRef.current = initialRoadmap.id ?? null;
    }
  }, [initialRoadmap]);

  useEffect(() => {
    if (!mentorId) return;

    // ── Subscribe to roadmap_topics changes ────────────────────────────────
    const topicsChannelName = `roadmap-topics-${mentorId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const topicsChannel = supabase
      .channel(topicsChannelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "roadmap_topics",
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const updated = payload.new as any;
            setRoadmap((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                phases: prev.phases.map((phase) => ({
                  ...phase,
                  topics: phase.topics.map((t) =>
                    t.id === updated.id
                      ? {
                          ...t,
                          status: updated.status as TopicStatus,
                          completed_at: updated.completed_at,
                          progress_percent: updated.progress_percent,
                          notes: updated.notes,
                          quiz_score: updated.quiz_score,
                          confidence_score: updated.confidence_score,
                          revision_required: updated.revision_required,
                          is_skipped: updated.is_skipped,
                        }
                      : t
                  ),
                  completedCount: phase.topics.filter((t) =>
                    t.id === updated.id
                      ? updated.status === "completed"
                      : t.status === "completed"
                  ).length,
                })),
              };
            });
          }

          if (payload.eventType === "INSERT") {
            const inserted = payload.new as any;
            setRoadmap((prev) => {
              if (!prev) return prev;
              // Find the phase that owns this topic (by roadmap_id match)
              // Since all topics are in the same roadmap, append to the last phase for now
              const alreadyExists = prev.phases.some((p) =>
                p.topics.some((t) => t.id === inserted.id)
              );
              if (alreadyExists) return prev;

              const newTopic: RoadmapTopic = {
                id: inserted.id,
                roadmap_id: inserted.roadmap_id,
                title: inserted.title,
                description: inserted.description ?? "",
                difficulty: inserted.difficulty ?? "beginner",
                estimated_minutes: inserted.estimated_minutes ?? 30,
                order_index: inserted.order_index,
                status: inserted.status as TopicStatus,
                prerequisites: inserted.prerequisites ?? [],
              };

              return {
                ...prev,
                phases: prev.phases.map((phase, idx) => {
                  if (idx === prev.phases.length - 1) {
                    return {
                      ...phase,
                      topics: [...phase.topics, newTopic],
                      totalCount: phase.totalCount + 1,
                    };
                  }
                  return phase;
                }),
              };
            });
          }
        }
      )
      .subscribe();

    // ── Subscribe to roadmaps changes (progress_percent) ───────────────────
    const roadmapChannelName = `roadmap-meta-${mentorId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const roadmapChannel = supabase
      .channel(roadmapChannelName)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "roadmaps",
        },
        (payload) => {
          const updated = payload.new as any;
          setRoadmap((prev) => {
            if (!prev) return prev;
            // Only update if it's our roadmap
            if (prev.id && prev.id !== updated.id) return prev;
            return {
              ...prev,
              progress_percent: updated.progress_percent,
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(topicsChannel);
      supabase.removeChannel(roadmapChannel);
    };
  }, [mentorId]);

  return { roadmap, setRoadmap };
}
