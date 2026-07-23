"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, Circle, Lock, PlayCircle, RotateCcw,
  SkipForward, AlertTriangle, ChevronDown, ChevronUp,
  Clock, Zap, BookOpen, Target, TrendingUp, Loader2
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { MentorRoadmap, RoadmapTopic, TopicStatus } from "@/types/roadmap";
import { toast } from "sonner";
import {
  toggleTopicStatusAction,
  skipTopic,
  markRevisionRequired,
  resumeTopic,
  resetRoadmap,
} from "@/actions/progressActions";
import { Button } from "@/components/ui/button";
import SmoothProgressBar from "@/components/ui/smoothui/animated-progress-bar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RoadmapCardProps {
  roadmap: MentorRoadmap;
  compact?: boolean;
}

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig: Record<TopicStatus, { label: string; color: string }> = {
  completed: { label: "Completed", color: "text-primary" },
  "in-progress": { label: "In Progress", color: "text-blue-600 dark:text-blue-400" },
  available: { label: "Available", color: "text-muted-foreground" },
  locked: { label: "Locked", color: "text-muted-foreground/40" },
  skipped: { label: "Skipped", color: "text-orange-500 dark:text-orange-400" },
  "revision-required": { label: "Revision Needed", color: "text-yellow-600 dark:text-yellow-400" },
};

const difficultyConfig: Record<string, { label: string; className: string }> = {
  beginner: {
    label: "Beginner",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  intermediate: {
    label: "Intermediate",
    className: "bg-blue-500/10 text-blue-600 border-blue-200/70 dark:border-blue-800/70",
  },
  advanced: {
    label: "Advanced",
    className: "bg-purple-500/10 text-purple-600 border-purple-200/70 dark:border-purple-800/70",
  },
};

// ─── Completion Circle ────────────────────────────────────────────────────────

function CompletionCircle({
  status,
  onToggle,
  isPending,
  isLocked,
}: {
  status: TopicStatus;
  onToggle: () => void;
  isPending: boolean;
  isLocked: boolean;
}) {
  const isCompleted = status === "completed";
  const isCurrent = status === "in-progress";

  if (isLocked) {
    return (
      <div
        className="h-5 w-5 shrink-0 flex items-center justify-center"
        aria-label="Locked"
      >
        <Lock className="h-3.5 w-3.5 text-muted-foreground/30" />
      </div>
    );
  }

  return (
    <TooltipProvider delay={400}>
      <Tooltip>
        <TooltipTrigger
          render={<button type="button" />}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            if (!isPending) onToggle();
          }}
          disabled={isPending}
          aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
          className={cn(
            "h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-200",
            "hover:scale-110 active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
            isCurrent
              ? "bg-primary border-primary shadow-sm shadow-primary/20"
              : isCompleted
              ? "border-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:border-primary hover:bg-primary/10"
              : "border-muted-foreground/30 bg-transparent hover:border-primary hover:bg-primary/10"
          )}
        >
            <AnimatePresence mode="wait">
              {isCompleted && (
                <motion.div
                  key="check"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </motion.div>
              )}
              {isCurrent && !isCompleted && (
                <motion.div
                  key="current"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="h-2 w-2 rounded-full bg-blue-400"
                />
              )}
            </AnimatePresence>
        </TooltipTrigger>
        <TooltipContent side="left" className="text-[11px]">
          {isCompleted ? "Mark as incomplete" : "Mark as complete"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ─── Animated Progress Bar ────────────────────────────────────────────────────

function AnimatedProgressBar({
  value,
  completed,
  total,
}: {
  value: number;
  completed: number;
  total: number;
}) {
  // Color: 0-33%=emerald, 34-66%=yellow, 67-100%=blue
  const color =
    value < 34
      ? "#10b981"
      : value < 67
      ? "#eab308"
      : "#3b82f6";

  return (
    <div className="space-y-1.5 mt-3">
      {/* Track */}
      <SmoothProgressBar 
        value={value}
        color={color}
        className="h-2 w-full"
      />
      {/* Labels */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-foreground/70">
          {value}% complete
        </span>
        <span className="text-[11px] text-muted-foreground">
          {completed} / {total} topics
        </span>
      </div>
    </div>
  );
}

// ─── Topic Row ────────────────────────────────────────────────────────────────

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
  const diffConfig = difficultyConfig[topic.difficulty ?? "beginner"];

  const rowContent = (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-xl border overflow-hidden transition-all duration-200",
        // Current lesson: blue ring + soft glow + left accent
        isCurrent &&
          "border-blue-300/70 dark:border-blue-700/60 bg-blue-50/60 dark:bg-blue-950/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]",
        // Completed: primary tint
        isCompleted &&
          "border-primary/40 bg-primary/10",
        // Locked: greyed out
        isLocked && "border-border/30 opacity-50 bg-muted/10",
        // Revision needed
        topic.status === "revision-required" &&
          "border-yellow-200/70 dark:border-yellow-800/50 bg-yellow-50/20 dark:bg-yellow-950/10",
        // Skipped
        topic.status === "skipped" &&
          "border-orange-200/60 dark:border-orange-800/40 bg-orange-50/10",
        // Default available
        !isLocked &&
          !isCurrent &&
          !isCompleted &&
          "border-border/60 hover:border-primary/20 hover:shadow-sm hover:-translate-y-px"
      )}
    >
      {/* ── Main row ──────────────────────────────── */}
      <div className="flex flex-col gap-1.5 px-3 py-2.5 relative">
        {/* Row 1: Circle + Title + Expand */}
        <div className="flex items-start gap-2 w-full">
          {/* Completion circle */}
          <div className="pt-0.5 shrink-0">
            <CompletionCircle
              status={topic.status}
              onToggle={() => onToggle(topic.id, topic.status)}
              isPending={isPending}
              isLocked={isLocked}
            />
          </div>

          {/* Title */}
          <p
            className={cn(
              "text-[13px] font-medium leading-snug flex-1 min-w-0",
              isLocked && "text-muted-foreground/50",
              isCompleted && "text-muted-foreground/70 line-through decoration-muted-foreground/30",
              isCurrent && "text-blue-700 dark:text-blue-300 font-semibold",
              !isLocked && !isCompleted && !isCurrent && "text-foreground"
            )}
          >
            {topic.title}
          </p>

          {/* Expand chevron */}
          {!isLocked && topic.description && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((p) => !p);
              }}
              aria-label={expanded ? "Collapse" : "Expand lesson details"}
              className={cn(
                "shrink-0 h-5 w-5 flex items-center justify-center rounded text-muted-foreground/50 hover:text-foreground hover:bg-muted/60 transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
              )}
            >
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </motion.div>
            </button>
          )}
        </div>

        {/* Row 2: Meta (Difficulty, Duration) */}
        {!isLocked && (
          <div className="flex flex-wrap items-center gap-3 pl-7">
            {topic.difficulty && diffConfig && (
              <span className={cn("text-[11px] font-medium capitalize", diffConfig.className.replace("bg-", "text-").replace("border-", "text-").split(' ')[0])}>
                {diffConfig.label}
              </span>
            )}
            {topic.estimated_minutes && (
              <span className="text-[11px] text-muted-foreground">
                {topic.estimated_minutes} min
              </span>
            )}
          </div>
        )}

        {/* Row 3: Status Labels */}
        {!isLocked && (
          <div className="flex flex-wrap items-center gap-2 pl-7 mt-0.5">
            {isCurrent && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[11px] text-blue-500 font-medium flex items-center gap-1.5"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
                Currently Learning
              </motion.span>
            )}
            {topic.status === "revision-required" && (
              <span className="text-[11px] text-yellow-600 font-medium flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Needs revision
              </span>
            )}
            {topic.status === "skipped" && (
              <span className="text-[11px] text-orange-500 font-medium flex items-center gap-1">
                <SkipForward className="h-3 w-3" /> Skipped
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Expanded details ───────────────────────── */}
      <AnimatePresence>
        {expanded && !isLocked && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 border-t border-inherit/30">
              {topic.description && (
                <p className="text-xs text-muted-foreground leading-relaxed mb-2.5 mt-2">
                  {topic.description}
                </p>
              )}

              <div className="flex flex-wrap gap-1.5">
                {!isCompleted && isCurrent && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(topic.id, topic.status);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border border-primary/40 transition-colors font-medium"
                    disabled={isPending}
                  >
                    <CheckCircle2 className="h-3 w-3" /> Mark Complete
                  </button>
                )}
                {isCompleted && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(topic.id, topic.status);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted border border-border/50 transition-colors"
                    disabled={isPending}
                  >
                    <RotateCcw className="h-3 w-3" /> Undo Complete
                  </button>
                )}
                {!isCompleted && !isLocked && topic.status !== "skipped" && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSkip(topic.id);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border border-orange-200/60 dark:border-orange-800/40 transition-colors"
                      disabled={isPending}
                    >
                      <SkipForward className="h-3 w-3" /> Skip
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRevision(topic.id);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border border-yellow-200/60 dark:border-yellow-800/40 transition-colors"
                      disabled={isPending}
                    >
                      <AlertTriangle className="h-3 w-3" /> Needs Revision
                    </button>
                  </>
                )}
                {(topic.status === "skipped" || topic.status === "revision-required") && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onResume(topic.id);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border border-blue-200/60 dark:border-blue-800/40 transition-colors"
                    disabled={isPending}
                  >
                    <PlayCircle className="h-3 w-3" /> Resume
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // Wrap locked topics in a tooltip
  if (isLocked) {
    return (
      <TooltipProvider delay={200}>
        <Tooltip>
          <TooltipTrigger render={<div className="cursor-not-allowed" />}>
            <div>{rowContent}</div>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-[11px] max-w-[180px] text-center">
            Complete previous lessons first
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return rowContent;
}

// ─── RoadmapCard ─────────────────────────────────────────────────────────────

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
    // Optimistic reset: all topics to locked except first one
    const resetOptimistic = { 
      ...optimisticRoadmap, 
      phases: optimisticRoadmap.phases.map((p, pIdx) => ({ 
        ...p, 
        topics: p.topics.map((t, tIdx) => ({ 
          ...t, 
          status: (pIdx === 0 && tIdx === 0) ? "in-progress" : "locked" 
        })) 
      })) 
    };
    setOptimisticRoadmap(resetOptimistic as any);
    
    startTransition(async () => {
      const res = await resetRoadmap(optimisticRoadmap.mentorId);
      if ("error" in res) {
        toast.error(res.error as string);
        setOptimisticRoadmap(roadmap);
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
        "rounded-2xl border bg-card overflow-hidden relative",
        isPending && "pointer-events-none"
      )}
    >
      {isPending && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-[2px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* ── Header ─────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 border-b border-border/50">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold leading-snug text-foreground">
              {optimisticRoadmap.title}
            </h3>
            {currentTopic && (
              <p className="text-[11px] text-blue-500 mt-0.5 flex items-center gap-1">
                <Zap className="h-3 w-3" />
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

        {/* Animated gradient progress bar */}
        <AnimatedProgressBar
          value={progressPercent}
          completed={completedCount}
          total={totalCount}
        />
      </div>

      {/* ── Topic list ─────────────────────────────── */}
      <div className="px-3 py-3 space-y-2">
        {optimisticRoadmap.phases.map((phase) => (
          <div key={phase.id} className="space-y-1.5">
            {optimisticRoadmap.phases.length > 1 && (
              <div className="flex items-center gap-2 px-1 pt-1">
                <BookOpen className="h-3 w-3 text-muted-foreground/40" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                  {phase.title}
                </p>
              </div>
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

        {/* Reset */}
        <div className="pt-2 border-t border-border/40 mt-1">
          {!showReset ? (
            <button
              onClick={() => setShowReset(true)}
              className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
            >
              <RotateCcw className="h-3 w-3" /> Reset roadmap
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-destructive">Confirm reset?</span>
              <Button
                size="sm"
                variant="destructive"
                className="h-5 text-[10px] px-2"
                onClick={handleReset}
                disabled={isPending}
              >
                Reset
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-5 text-[10px] px-2"
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
