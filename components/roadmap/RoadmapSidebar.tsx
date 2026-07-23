"use client";

import { useState, useTransition } from "react";
import { BookOpen, Target, Zap, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MentorRoadmap, TopicStatus } from "@/types/roadmap";
import { toast } from "sonner";
import {
  toggleTopicStatusAction,
  skipTopic,
  markRevisionRequired,
  resumeTopic,
  resetRoadmap,
} from "@/actions/progressActions";
import { Button } from "@/components/ui/button";
import { RoadmapTopicCard } from "./RoadmapTopicCard";
import { RoadmapProgress } from "./RoadmapProgress";
import { motion, AnimatePresence } from "framer-motion";

interface RoadmapSidebarProps {
  roadmap: MentorRoadmap;
}

export function RoadmapSidebar({ roadmap }: RoadmapSidebarProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticRoadmap, setOptimisticRoadmap] = useState(roadmap);
  const [showReset, setShowReset] = useState(false);

  const updateTopicOptimistically = (topicId: string, newStatus: TopicStatus) => {
    setOptimisticRoadmap((prev) => ({
      ...prev,
      phases: prev.phases.map((phase) => ({
        ...phase,
        topics: phase.topics.map((t) => {
          if (t.id === topicId) return { ...t, status: newStatus };
          if (newStatus === "completed") {
            const prevIndex = phase.topics.findIndex((x) => x.id === topicId);
            const thisIndex = phase.topics.findIndex((x) => x.id === t.id);
            if (thisIndex === prevIndex + 1 && t.status === "locked") {
              return { ...t, status: "in-progress" as TopicStatus };
            }
          }
          return t;
        }),
        completedCount: phase.topics.filter((t) =>
          t.id === topicId ? newStatus === "completed" : t.status === "completed"
        ).length,
      })),
    }));
  };

  const handleToggle = (topicId: string, currentStatus: string) => {
    if (topicId.startsWith("temp-")) {
      toast.error("Demo topic – create a real mentor to track progress!");
      return;
    }
    const newStatus: TopicStatus =
      currentStatus === "completed" ? "in-progress" : "completed";
    updateTopicOptimistically(topicId, newStatus);
    startTransition(async () => {
      const res = await toggleTopicStatusAction(topicId, currentStatus);
      if ("error" in res && res.error) {
        toast.error(res.error as string);
        setOptimisticRoadmap(roadmap);
      } else if ("success" in res) {
        toast.success(
          newStatus === "completed" ? "🎉 Lesson completed!" : "Lesson marked incomplete."
        );
      }
    });
  };

  const handleSkip = (topicId: string) => {
    updateTopicOptimistically(topicId, "skipped");
    startTransition(async () => {
      const res = await skipTopic(topicId);
      if ("error" in res) {
        toast.error(res.error as string);
        setOptimisticRoadmap(roadmap);
      } else toast.success("Topic skipped.");
    });
  };

  const handleRevision = (topicId: string) => {
    updateTopicOptimistically(topicId, "revision-required");
    startTransition(async () => {
      const res = await markRevisionRequired(topicId);
      if ("error" in res) {
        toast.error(res.error as string);
        setOptimisticRoadmap(roadmap);
      } else toast.info("Topic marked for revision.");
    });
  };

  const handleResume = (topicId: string) => {
    updateTopicOptimistically(topicId, "in-progress");
    startTransition(async () => {
      const res = await resumeTopic(topicId);
      if ("error" in res) {
        toast.error(res.error as string);
        setOptimisticRoadmap(roadmap);
      } else toast.success("Topic resumed.");
    });
  };

  const handleReset = () => {
    startTransition(async () => {
      const res = await resetRoadmap(optimisticRoadmap.mentorId);
      if ("error" in res) {
        toast.error(res.error as string);
      } else {
        toast.success("Roadmap reset to beginning.");
        setShowReset(false);
      }
    });
  };

  const allTopics = optimisticRoadmap.phases.flatMap((p) => p.topics);
  const completedCount = allTopics.filter((t) => t.status === "completed").length;
  const totalCount = allTopics.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const currentTopic = allTopics.find((t) => t.status === "in-progress");

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card overflow-hidden flex flex-col h-full",
        isPending && "opacity-70 pointer-events-none"
      )}
    >
      {/* ── Fixed Header ──────────────────────────── */}
      <div className="px-4 pt-4 pb-3 border-b border-border/50 shrink-0 bg-card z-10">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold leading-snug text-foreground truncate">
              {optimisticRoadmap.title}
            </h3>
            {currentTopic && (
              <p className="text-[11px] text-blue-500 mt-0.5 flex items-center gap-1">
                <Zap className="h-3 w-3 shrink-0" />
                <span className="truncate">Now: {currentTopic.title}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Target className="h-3 w-3 text-muted-foreground/50" />
            <span className="text-[11px] font-semibold text-muted-foreground">
              {completedCount}/{totalCount}
            </span>
          </div>
        </div>

        <RoadmapProgress
          value={progressPercent}
          completed={completedCount}
          total={totalCount}
          allTopics={allTopics}
          currentTopic={currentTopic}
        />
      </div>

      {/* ── Scrollable Topic List ─────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 no-scrollbar" data-lenis-prevent="true">
        {optimisticRoadmap.phases.map((phase) => (
          <div key={phase.id} className="space-y-1.5 w-full">
            {optimisticRoadmap.phases.length > 1 && (
              <div className="flex items-center gap-2 px-1 pt-1">
                <BookOpen className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 truncate">
                  {phase.title}
                </p>
              </div>
            )}
            {phase.topics.map((topic, idx) => (
              <div key={topic.id} className="relative group/topic">
                {/* Timeline connector */}
                {idx !== phase.topics.length - 1 && (
                  <div className="absolute left-6 top-[34px] bottom-[-16px] w-[2px] bg-border/40 group-hover/topic:bg-border/60 transition-colors z-0" />
                )}
                
                <div className="relative z-10">
                  <RoadmapTopicCard
                    topic={topic}
                    onToggle={handleToggle}
                    onSkip={handleSkip}
                    onRevision={handleRevision}
                    onResume={handleResume}
                    isPending={isPending}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* ── Reset Footer ──────────────────────────── */}
        <div className="pt-2 border-t border-border/40 mt-1">
          {!showReset ? (
            <button
              onClick={() => setShowReset(true)}
              className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
            >
              <RotateCcw className="h-3 w-3 shrink-0" /> Reset roadmap
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-destructive shrink-0">Confirm reset?</span>
              <Button
                size="sm"
                variant="destructive"
                className="h-5 text-[10px] px-2 shrink-0"
                onClick={handleReset}
                disabled={isPending}
              >
                Reset
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-5 text-[10px] px-2 shrink-0"
                onClick={() => setShowReset(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
