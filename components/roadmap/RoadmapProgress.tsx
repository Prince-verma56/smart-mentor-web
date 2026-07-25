"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import type { RoadmapTopic } from "@/types/roadmap";
import { Clock, BookOpen, Target, Flag } from "lucide-react";

export function RoadmapProgress({
  value,
  completed,
  total,
  allTopics = [],
  currentTopic,
}: {
  value: number;
  completed: number;
  total: number;
  allTopics?: RoadmapTopic[];
  currentTopic?: RoadmapTopic | null;
}) {
  // Calculate remaining time
  const remainingTopics = allTopics.filter(t => t.status !== "completed" && t.status !== "skipped");
  const remainingTimeMinutes = remainingTopics.reduce((acc, t) => acc + (t.estimated_minutes || 0), 0);
  const remainingHours = Math.floor(remainingTimeMinutes / 60);
  const remainingMins = remainingTimeMinutes % 60;
  
  // Find next milestone (next phase or advanced topic)
  const nextMilestone = remainingTopics.find(t => t.difficulty === "advanced" || t.status === "locked");
  const gradientColor =
    value < 34
      ? "from-primary to-primary/80"
      : value < 67
      ? "from-yellow-500 to-amber-400"
      : "from-blue-600 to-indigo-500";

  return (
    <div className="space-y-4 mt-4">
      {/* Overview Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="relative group flex flex-col gap-1.5 rounded-xl bg-muted/20 backdrop-blur-sm p-3 transition-all overflow-hidden border border-border/60 hover:border-border hover:bg-muted/30 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center gap-1.5 text-muted-foreground relative z-10">
            <BookOpen className="h-[14px] w-[14px]" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Remaining</span>
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight relative z-10">
            {total - completed} <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">left</span>
          </span>
        </div>
        <div className="relative group flex flex-col gap-1.5 rounded-xl bg-muted/20 backdrop-blur-sm p-3 transition-all overflow-hidden border border-border/60 hover:border-border hover:bg-muted/30 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center gap-1.5 text-muted-foreground relative z-10">
            <Clock className="h-[14px] w-[14px]" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Est. Time</span>
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight relative z-10">
            {remainingHours > 0 && `${remainingHours}h `}{remainingMins}m
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Progress</span>
          <motion.span 
            className="text-[12px] font-bold text-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={value}
          >
            {value}%
          </motion.span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden relative">
          <motion.div
            className={cn("absolute inset-y-0 left-0 rounded-full bg-gradient-to-r", gradientColor)}
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} // Smooth spring-like ease
          />
        </div>
        {nextMilestone && (
          <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
            <Flag className="h-[10px] w-[10px] text-primary/60" />
            <span className="text-[10px] truncate uppercase tracking-wide font-medium">
              Next: <span className="text-foreground/80">{nextMilestone.title}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
