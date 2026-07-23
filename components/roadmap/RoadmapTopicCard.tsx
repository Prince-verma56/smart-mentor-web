"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Lock, ChevronDown, SkipForward, RotateCcw, AlertTriangle, BookOpen, Clock, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { RoadmapTopic, TopicStatus } from "@/types/roadmap";
import React from "react";
import { Button } from "@/components/ui/button";

const statusConfig: Record<TopicStatus, { label: string; color: string }> = {
  completed: { label: "Completed", color: "text-emerald-600 dark:text-emerald-400" },
  "in-progress": { label: "In Progress", color: "text-blue-600 dark:text-blue-400" },
  available: { label: "Available", color: "text-muted-foreground" },
  locked: { label: "Locked", color: "text-muted-foreground/40" },
  skipped: { label: "Skipped", color: "text-orange-500 dark:text-orange-400" },
  "revision-required": { label: "Revision Needed", color: "text-yellow-600 dark:text-yellow-400" },
};

const difficultyConfig: Record<string, { label: string; className: string }> = {
  beginner: {
    label: "Beginner",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-200/70 dark:border-emerald-800/70",
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
      <div className="h-5 w-5 shrink-0 flex items-center justify-center" aria-label="Locked">
        <Lock className="h-3.5 w-3.5 text-muted-foreground/30" />
      </div>
    );
  }

  return (
    <TooltipProvider delay={400}>
      <Tooltip>
        <TooltipTrigger 
          render={
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!isPending) onToggle();
              }}
              disabled={isPending}
              aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
              className={cn(
                "h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                "hover:scale-110 active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                isCompleted
                  ? "bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-500/20"
                  : isCurrent
                  ? "border-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  : "border-muted-foreground/30 bg-transparent hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
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
            </button>
          } 
        />
        <TooltipContent side="left" className="text-[11px]">
          {isCompleted ? "Mark as incomplete" : "Mark as complete"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface RoadmapTopicCardProps {
  topic: RoadmapTopic;
  onToggle: (id: string, status: string) => void;
  onSkip: (id: string) => void;
  onRevision: (id: string) => void;
  onResume: (id: string) => void;
  isPending: boolean;
}

export const RoadmapTopicCard = React.memo(function RoadmapTopicCard({
  topic,
  onToggle,
  onSkip,
  onRevision,
  onResume,
  isPending,
}: RoadmapTopicCardProps) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[topic.status] || statusConfig.locked;
  const isLocked = topic.status === "locked";
  const isCompleted = topic.status === "completed";
  const isCurrent = topic.status === "in-progress";
  const diffConfig = difficultyConfig[topic.difficulty ?? "beginner"];

  const content = (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-xl border overflow-hidden transition-all duration-200 w-full",
        isCurrent && "border-blue-300/70 dark:border-blue-700/60 bg-blue-50/60 dark:bg-blue-950/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]",
        isCompleted && "border-emerald-200/50 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/10",
        isLocked && "border-border/30 opacity-50 bg-muted/10",
        topic.status === "revision-required" && "border-yellow-200/70 dark:border-yellow-800/50 bg-yellow-50/20 dark:bg-yellow-950/10",
        topic.status === "skipped" && "border-orange-200/60 dark:border-orange-800/40 bg-orange-50/10",
        !isLocked && !isCurrent && !isCompleted && "border-border/60 hover:border-primary/20 hover:shadow-sm hover:-translate-y-px"
      )}
    >
      {isCurrent && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-400 rounded-l-xl animate-pulse" />
      )}

      <div className="flex flex-col gap-1.5 px-3 py-2.5 relative w-full">
        {/* Row 1: Circle + Title + Expand */}
        <div className="flex items-start gap-2 w-full">
          <div className="pt-0.5 shrink-0">
            <CompletionCircle
              status={topic.status}
              onToggle={() => onToggle(topic.id, topic.status)}
              isPending={isPending}
              isLocked={isLocked}
            />
          </div>

          <TooltipProvider delay={400}>
            <Tooltip>
              <TooltipTrigger 
                render={
                  <div className="flex-1 min-w-0 cursor-default">
                    <p
                      className={cn(
                        "text-[13px] font-medium leading-snug line-clamp-2 w-full",
                        isLocked && "text-muted-foreground/50",
                        isCompleted && "text-muted-foreground/70 line-through decoration-muted-foreground/30",
                        isCurrent && "text-blue-700 dark:text-blue-300 font-semibold",
                        !isLocked && !isCompleted && !isCurrent && "text-foreground"
                      )}
                    >
                      {topic.title}
                    </p>
                  </div>
                } 
              />
              <TooltipContent side="top" className="max-w-[280px]">
                <p className="text-xs">{topic.title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {!isLocked && topic.description && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((p) => !p);
              }}
              aria-label={expanded ? "Collapse" : "Expand lesson details"}
              className="shrink-0 h-5 w-5 flex items-center justify-center rounded text-muted-foreground/50 hover:text-foreground hover:bg-muted/60 transition-all duration-150"
            >
              <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="h-3.5 w-3.5" />
              </motion.div>
            </button>
          )}
        </div>

        {/* Row 2: Meta */}
        {!isLocked && (
          <div className="flex flex-wrap items-center gap-3 pl-7">
            {topic.difficulty && diffConfig && (
              <span className={cn("text-[11px] font-medium capitalize", diffConfig.className.replace("bg-", "text-").replace("border-", "text-").split(' ')[0])}>
                {diffConfig.label}
              </span>
            )}
            {topic.estimated_minutes && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                <Clock className="h-3 w-3 opacity-70" />
                {topic.estimated_minutes}m
              </span>
            )}
            <span className={cn("text-[11px] font-medium", config.color)}>
              {config.label}
            </span>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && !isLocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden bg-muted/20 border-t border-border/50"
          >
            <div className="p-3 pl-10 space-y-3">
              {topic.description && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <BookOpen className="h-3.5 w-3.5" />
                    Overview
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed break-words whitespace-pre-wrap">
                    {topic.description}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/30">
                {!isCompleted && !isCurrent && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] gap-1.5 px-2 bg-background hover:bg-muted"
                    onClick={() => onResume(topic.id)}
                    disabled={isPending}
                  >
                    <Zap className="h-3 w-3 text-blue-500" />
                    Start Topic
                  </Button>
                )}
                {isCurrent && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] gap-1.5 px-2 bg-background hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
                      onClick={() => onSkip(topic.id)}
                      disabled={isPending}
                    >
                      <SkipForward className="h-3 w-3" />
                      Skip
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] gap-1.5 px-2 bg-background hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200"
                      onClick={() => onRevision(topic.id)}
                      disabled={isPending}
                    >
                      <AlertTriangle className="h-3 w-3" />
                      Needs Review
                    </Button>
                  </>
                )}
                {(topic.status === "skipped" || topic.status === "revision-required") && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] gap-1.5 px-2 bg-background hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                    onClick={() => onResume(topic.id)}
                    disabled={isPending}
                  >
                    <RotateCcw className="h-3 w-3" />
                    Resume
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className={cn("relative w-full", isLocked && "opacity-80")}>
      {!isLocked && (
        <div
          className={cn(
            "absolute -left-[5px] top-4 bottom-[-1rem] w-px",
            isCompleted ? "bg-emerald-200 dark:bg-emerald-900" : "bg-border/50"
          )}
        />
      )}
      {content}
    </div>
  );
}, (prev, next) => {
  return (
    prev.topic.id === next.topic.id &&
    prev.topic.status === next.topic.status &&
    prev.isPending === next.isPending
  );
});
