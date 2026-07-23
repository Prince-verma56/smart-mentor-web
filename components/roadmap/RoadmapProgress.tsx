"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function RoadmapProgress({
  value,
  completed,
  total,
}: {
  value: number;
  completed: number;
  total: number;
}) {
  const gradientColor =
    value < 34
      ? "from-primary to-primary/80"
      : value < 67
      ? "from-yellow-500 to-amber-400"
      : "from-blue-600 to-indigo-500";

  return (
    <div className="space-y-1.5 mt-3">
      {/* Track */}
      <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full bg-gradient-to-r", gradientColor)}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
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
