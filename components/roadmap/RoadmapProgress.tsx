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
        <div className="relative group flex flex-col gap-1 rounded-xl bg-card/60 p-3 border border-border/50 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-md hover:bg-card/80 transition-all duration-300 overflow-hidden">
          <div className="absolute -right-4 -top-4 h-16 w-16 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors" />
          <div className="flex items-center gap-1.5 text-muted-foreground relative z-10">
            <BookOpen className="h-[14px] w-[14px]" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Remaining</span>
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight relative z-10">
            {total - completed} <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">lessons</span>
          </span>
        </div>
        <div className="relative group flex flex-col gap-1 rounded-xl bg-card/60 p-3 border border-border/50 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-md hover:bg-card/80 transition-all duration-300 overflow-hidden">
          <div className="absolute -right-4 -top-4 h-16 w-16 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors" />
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
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-bold text-foreground">Course Progress</span>
          <span className="text-[12px] font-bold text-primary">{value}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-muted/50 overflow-hidden border border-border/40 shadow-inner relative">
          <motion.div
            className={cn("absolute inset-y-0 left-0 rounded-full bg-gradient-to-r", gradientColor)}
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} // Smooth spring-like ease
          />
        </div>
        {nextMilestone && (
          <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
            <Flag className="h-3 w-3 text-primary/70" />
            <span className="text-[11px] truncate">
              Next milestone: <span className="font-medium text-foreground/80">{nextMilestone.title}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
