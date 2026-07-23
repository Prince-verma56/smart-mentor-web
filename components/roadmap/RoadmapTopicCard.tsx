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
        "rounded-xl border overflow-hidden transition-all duration-300 w-full",
        // Active (Hero) State
        isCurrent && "border-primary/50 bg-primary/[0.03] shadow-[0_4px_24px_-4px_rgba(var(--primary),0.15)] ring-1 ring-primary/20 scale-[1.02] z-20 my-2",
        // Completed State
        isCompleted && "border-emerald-200/30 dark:border-emerald-900/30 bg-emerald-50/10 dark:bg-emerald-950/10 opacity-70 hover:opacity-100",
        // Locked State
        isLocked && "border-border/20 opacity-40 bg-muted/5",
        // Other States
        topic.status === "revision-required" && "border-yellow-200/50 bg-yellow-50/10",
        topic.status === "skipped" && "border-orange-200/50 bg-orange-50/10",
        !isLocked && !isCurrent && !isCompleted && "border-border/40 hover:border-border hover:bg-muted/20 hover:shadow-sm"
      )}
    >
      {isCurrent && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/80 to-primary rounded-l-xl" />
      )}

      <div className={cn("flex flex-col gap-1.5 relative w-full", isCurrent ? "px-4 py-3.5" : "px-3 py-2")}>
        {/* Row 1: Circle + Title + Expand */}
        <div className="flex items-start gap-2.5 w-full">
          <div className={cn("shrink-0", isCurrent ? "pt-1" : "pt-0.5")}>
            <CompletionCircle
              status={topic.status}
              onToggle={() => onToggle(topic.id, topic.status)}
              isPending={isPending}
              isLocked={isLocked}
            />
          </div>

          <div className="flex-1 min-w-0 cursor-default">
            <p
              className={cn(
                "font-semibold leading-snug line-clamp-2 w-full",
                isLocked ? "text-[12px] text-muted-foreground/60 font-medium" : "",
                isCompleted ? "text-[12px] text-muted-foreground line-through decoration-muted-foreground/30 font-medium" : "",
                isCurrent ? "text-[15px] text-foreground" : "",
                !isLocked && !isCompleted && !isCurrent ? "text-[13px] text-foreground/90 font-medium" : ""
              )}
            >
              {topic.title}
            </p>
            {isCurrent && topic.description && (
               <p className="text-[12px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                 {topic.description}
               </p>
            )}
          </div>

          {!isLocked && topic.description && !isCurrent && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((p) => !p);
              }}
              aria-label={expanded ? "Collapse" : "Expand lesson details"}
              className="shrink-0 h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-muted/80 transition-all duration-150"
            >
              <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="h-3.5 w-3.5" />
              </motion.div>
            </button>
          )}
        </div>

        {/* Row 2: Meta */}
        {!isLocked && (
          <div className={cn("flex flex-wrap items-center gap-3 pl-8", isCurrent ? "mt-2" : "")}>
            {topic.difficulty && diffConfig && (
              <span className={cn("text-[10px] font-semibold uppercase tracking-wider", diffConfig.className.replace("bg-", "text-").replace("border-", "text-").split(' ')[0])}>
                {diffConfig.label}
              </span>
            )}
            {topic.estimated_minutes && (
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                <Clock className="h-3 w-3 opacity-70" />
                {topic.estimated_minutes}m
              </span>
            )}
            {isCurrent && (
              <span className={cn("text-[10px] font-semibold uppercase tracking-wider", config.color)}>
                {config.label}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {(expanded || isCurrent) && !isLocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className={cn("overflow-hidden", isCurrent ? "bg-transparent" : "bg-muted/20 border-t border-border/30")}
          >
            <div className={cn("p-3 pl-11 space-y-3", isCurrent && "pt-1")}>
              {topic.description && !isCurrent && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <BookOpen className="h-3.5 w-3.5" />
                    Overview
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-relaxed break-words whitespace-pre-wrap">
                    {topic.description}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {!isCompleted && !isCurrent && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] gap-1.5 px-3 rounded-full bg-background hover:bg-muted"
                    onClick={() => onResume(topic.id)}
                    disabled={isPending}
                  >
                    <Zap className="h-3 w-3 text-primary" />
                    Start Topic
                  </Button>
                )}
                {isCurrent && (
                  <>
                    <Button
                      size="sm"
                      className="h-8 text-[11px] font-semibold gap-1.5 px-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20"
                      onClick={() => onToggle(topic.id, topic.status)}
                      disabled={isPending}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Complete Lesson
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-[11px] gap-1.5 px-3 rounded-full bg-background hover:bg-muted"
                      onClick={() => onSkip(topic.id)}
                      disabled={isPending}
                    >
                      <SkipForward className="h-3.5 w-3.5" />
                      Skip
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-[11px] gap-1.5 px-3 rounded-full bg-background hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200"
                      onClick={() => onRevision(topic.id)}
                      disabled={isPending}
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
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
