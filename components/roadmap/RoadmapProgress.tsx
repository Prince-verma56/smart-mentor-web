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
      <div className="grid grid-cols-2 gap-3 mb-2">
        <div className="flex flex-col gap-1 rounded-xl bg-muted/40 p-3 border border-border/40">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Remaining</span>
          </div>
          <span className="text-lg font-semibold text-foreground">
            {total - completed} <span className="text-sm font-normal text-muted-foreground/70">lessons</span>
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-muted/40 p-3 border border-border/40">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Est. Time</span>
          </div>
          <span className="text-lg font-semibold text-foreground">
            {remainingHours > 0 && `${remainingHours}h`} {remainingMins}m
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-foreground">Course Progress</span>
          <span className="text-[12px] font-semibold text-primary">{value}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden border border-border/30 shadow-inner">
          <motion.div
            className={cn("h-full rounded-full bg-gradient-to-r", gradientColor)}
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
