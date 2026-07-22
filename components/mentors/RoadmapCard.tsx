"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2, Circle, Lock, PlayCircle, RotateCcw,
  SkipForward, AlertTriangle, ChevronDown, ChevronUp, Clock, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MentorRoadmap, RoadmapTopic, TopicStatus } from "@/types/roadmap";
import { toast } from "sonner";
import { toggleTopicStatusAction, skipTopic, markRevisionRequired, resumeTopic, resetRoadmap } from "@/actions/progressActions";
import { Button } from "@/components/ui/button";

interface RoadmapCardProps {
  roadmap: MentorRoadmap;
  compact?: boolean; // sidebar compact mode
}

const statusConfig: Record<TopicStatus, { icon: React.ReactNode; label: string; color: string }> = {
  completed: {
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />,
    label: "Completed",
    color: "text-emerald-600 dark:text-emerald-400",
  },
  "in-progress": {
    icon: <PlayCircle className="h-4 w-4 text-blue-500 shrink-0 animate-pulse" />,
    label: "In Progress",
    color: "text-blue-600 dark:text-blue-400",
  },
  available: {
    icon: <Circle className="h-4 w-4 text-muted-foreground shrink-0" />,
    label: "Available",
    color: "text-muted-foreground",
  },
  locked: {
    icon: <Lock className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />,
    label: "Locked",
    color: "text-muted-foreground/50",
  },
  skipped: {
    icon: <SkipForward className="h-4 w-4 text-orange-400 shrink-0" />,
    label: "Skipped",
    color: "text-orange-500 dark:text-orange-400",
  },
  "revision-required": {
    icon: <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />,
    label: "Revision Needed",
    color: "text-yellow-600 dark:text-yellow-400",
  },
};

const difficultyColors: Record<string, string> = {
  beginner: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800",
  intermediate: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800",
  advanced: "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800",
};

function TopicRow({
  topic,
  onToggle,
  onSkip,
  onRevision,
  onResume,
  isPending,
}: {
  topic: RoadmapTopic;
  onToggle: (id: string, status: string) => void;
  onSkip: (id: string) => void;
  onRevision: (id: string) => void;
  onResume: (id: string) => void;
  isPending: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[topic.status] || statusConfig.locked;
  const isLocked = topic.status === "locked";
  const isCompleted = topic.status === "completed";
  const isCurrent = topic.status === "in-progress";

  return (
    <div
      className={cn(
        "rounded-lg border transition-all duration-200",
        isCurrent && "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm",
        isCompleted && "border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/10 opacity-80",
        isLocked && "border-border/50 opacity-50",
        topic.status === "revision-required" && "border-yellow-200 dark:border-yellow-800 bg-yellow-50/30",
        topic.status === "skipped" && "border-orange-200 dark:border-orange-800 bg-orange-50/20",
        !isLocked && !isCurrent && !isCompleted && "border-border hover:border-primary/20"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2.5",
          !isLocked && "cursor-pointer"
        )}
        onClick={() => !isLocked && !isPending && onToggle(topic.id, topic.status)}
      >
        <div className="shrink-0">{config.icon}</div>

        <div className="flex-1 min-w-0">
          <span
            className={cn(
              "text-sm font-medium block truncate",
              config.color,
              isCompleted && "line-through opacity-70",
              isLocked && "text-muted-foreground/50"
            )}
          >
            {topic.title}
          </span>
          {isCurrent && (
            <span className="text-xs text-blue-500 font-normal">Currently studying</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {topic.estimated_minutes && !isLocked && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" />
              {topic.estimated_minutes}m
            </span>
          )}
          {topic.difficulty && !isLocked && (
            <Badge
              variant="outline"
              className={cn("text-[10px] py-0 px-1.5 capitalize border", difficultyColors[topic.difficulty])}
            >
              {topic.difficulty}
            </Badge>
          )}
          {!isLocked && topic.description && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded description + actions */}
      {expanded && !isLocked && (
        <div className="px-3 pb-2.5 pt-0 border-t border-inherit/50">
          {topic.description && (
            <p className="text-xs text-muted-foreground mt-2 mb-3 leading-relaxed">
              {topic.description}
            </p>
          )}
          <div className="flex items-center gap-1.5 flex-wrap">
            {!isCompleted && isCurrent && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggle(topic.id, topic.status); }}
                className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                disabled={isPending}
              >
                ✓ Mark Complete
              </button>
            )}
            {isCompleted && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggle(topic.id, topic.status); }}
                className="text-[11px] px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground hover:bg-muted transition-colors"
                disabled={isPending}
              >
                ↩ Undo Complete
              </button>
            )}
            {!isCompleted && !isLocked && topic.status !== "skipped" && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onSkip(topic.id); }}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 transition-colors"
                  disabled={isPending}
                >
                  Skip
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onRevision(topic.id); }}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 transition-colors"
                  disabled={isPending}
                >
                  ⚠ Needs Revision
                </button>
              </>
            )}
            {(topic.status === "skipped" || topic.status === "revision-required") && (
              <button
                onClick={(e) => { e.stopPropagation(); onResume(topic.id); }}
                className="text-[11px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors"
                disabled={isPending}
              >
                ▶ Resume
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function RoadmapCard({ roadmap, compact = false }: RoadmapCardProps) {
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
          // If completing this topic, unlock next one
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
    const newStatus: TopicStatus = currentStatus === "completed" ? "in-progress" : "completed";
    updateTopicOptimistically(topicId, newStatus);

    startTransition(async () => {
      const res = await toggleTopicStatusAction(topicId, currentStatus);
      if ("error" in res && res.error) {
        toast.error(res.error as string);
        setOptimisticRoadmap(roadmap); // revert
      } else if ("success" in res) {
        toast.success(newStatus === "completed" ? "🎉 Lesson completed!" : "Lesson marked incomplete.");
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
      } else {
        toast.success("Topic skipped.");
      }
    });
  };

  const handleRevision = (topicId: string) => {
    updateTopicOptimistically(topicId, "revision-required");
    startTransition(async () => {
      const res = await markRevisionRequired(topicId);
      if ("error" in res) {
        toast.error(res.error as string);
        setOptimisticRoadmap(roadmap);
      } else {
        toast.info("Topic marked for revision.");
      }
    });
  };

  const handleResume = (topicId: string) => {
    updateTopicOptimistically(topicId, "in-progress");
    startTransition(async () => {
      const res = await resumeTopic(topicId);
      if ("error" in res) {
        toast.error(res.error as string);
        setOptimisticRoadmap(roadmap);
      } else {
        toast.success("Topic resumed.");
      }
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
        setOptimisticRoadmap(roadmap);
      }
    });
  };

  const allTopics = optimisticRoadmap.phases.flatMap((p) => p.topics);
  const completedCount = allTopics.filter((t) => t.status === "completed").length;
  const totalCount = allTopics.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const currentTopic = allTopics.find((t) => t.status === "in-progress");

  return (
    <Card className={cn("overflow-hidden", isPending && "opacity-70 pointer-events-none")}>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-sm font-semibold leading-tight">
              {optimisticRoadmap.title}
            </CardTitle>
            {currentTopic && (
              <p className="text-[11px] text-blue-500 mt-0.5 flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Now: {currentTopic.title}
              </p>
            )}
          </div>
          <Badge variant="outline" className="text-xs shrink-0 font-mono">
            {completedCount}/{totalCount}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 space-y-1">
          <Progress value={progressPercent} className="h-1.5" />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{progressPercent}% complete</span>
            {optimisticRoadmap.total_estimated_hours && (
              <span>~{optimisticRoadmap.total_estimated_hours}h total</span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-3 space-y-1.5">
        {optimisticRoadmap.phases.map((phase) => (
          <div key={phase.id} className="space-y-1.5">
            {optimisticRoadmap.phases.length > 1 && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-1 pt-1">
                {phase.title}
              </p>
            )}
            {phase.topics.map((topic) => (
              <TopicRow
                key={topic.id}
                topic={topic}
                onToggle={handleToggle}
                onSkip={handleSkip}
                onRevision={handleRevision}
                onResume={handleResume}
                isPending={isPending}
              />
            ))}
          </div>
        ))}

        {/* Reset option */}
        <div className="pt-2 border-t border-border/50">
          {!showReset ? (
            <button
              onClick={() => setShowReset(true)}
              className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" /> Reset roadmap
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-destructive">Confirm reset?</span>
              <Button size="sm" variant="destructive" className="h-5 text-[10px] px-2" onClick={handleReset} disabled={isPending}>
                Reset
              </Button>
              <Button size="sm" variant="ghost" className="h-5 text-[10px] px-2" onClick={() => setShowReset(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
