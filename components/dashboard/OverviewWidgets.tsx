"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { BrainCircuit, Target, Trophy, Clock, FileUp, Mic } from "lucide-react";
import React from "react";

interface DashboardStats {
  activeMentors: number;
  completedTopics: number;
  totalStudyHours: number;
  voiceSessions: number;
  knowledgeSources: number;
  currentStreak: number;
}

interface OverviewWidgetsProps {
  stats: DashboardStats | null;
}

const gradientMapping: Record<string, string> = {
  emerald: 'linear-gradient(to bottom right, #10b981, #047857)',
  blue: 'linear-gradient(to bottom right, #3b82f6, #1d4ed8)',
  violet: 'linear-gradient(to bottom right, #8b5cf6, #6d28d9)',
  orange: 'linear-gradient(to bottom right, #f97316, #c2410c)',
  yellow: 'linear-gradient(to bottom right, #eab308, #a16207)',
  cyan: 'linear-gradient(to bottom right, #06b6d4, #0369a1)',
};

export function OverviewWidgets({ stats }: OverviewWidgetsProps) {
  // Use dummy stats if null
  const data = stats || {
    activeMentors: 0,
    completedTopics: 0,
    totalStudyHours: 0,
    voiceSessions: 0,
    knowledgeSources: 0,
    currentStreak: 0,
  };

  const widgets = [
    {
      title: "Active Mentors",
      value: data.activeMentors.toString(),
      icon: BrainCircuit,
      color: "emerald",
      description: "Mentors in your workspace",
    },
    {
      title: "Completed Topics",
      value: data.completedTopics.toString(),
      icon: Target,
      color: "cyan",
      description: "Across all roadmaps",
    },
    {
      title: "Study Time",
      value: `${data.totalStudyHours}h`,
      icon: Clock,
      color: "blue",
      description: "Total time spent learning",
    },
    {
      title: "Voice Sessions",
      value: data.voiceSessions.toString(),
      icon: Mic,
      color: "violet",
      description: "Spoken conversations",
    },
    {
      title: "Knowledge Sources",
      value: data.knowledgeSources.toString(),
      icon: FileUp,
      color: "orange",
      description: "Uploaded resources",
    },
    {
      title: "Current Streak",
      value: `${data.currentStreak} Days`,
      icon: Trophy,
      color: "yellow",
      description: "Keep it up!",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4"
    >
      {widgets.map((widget, i) => {
        const bgGradient = gradientMapping[widget.color] || gradientMapping.emerald;
        
        return (
          <motion.div key={i} variants={item}>
            {/* Make the entire card a group to trigger the icon animation on card hover */}
            <Card className="group border-muted/40 bg-[#030712]/50 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:shadow-lg hover:border-white/20 transition-all duration-300 h-full overflow-visible">
              <CardContent className="p-6 flex flex-col items-center text-center justify-center h-full overflow-visible pt-10">
                
                {/* 3D Glass Icon Implementation (React-Bits Style) */}
                <div className="relative bg-transparent outline-none border-none w-[4em] h-[4em] [perspective:24em] [transform-style:preserve-3d] mb-6">
                  {/* Back tilted shadow/colored layer */}
                  <span
                    className="absolute top-0 left-0 w-full h-full rounded-[1.25em] block transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[100%_100%] rotate-[15deg] [will-change:transform] group-hover:[transform:rotate(25deg)_translate3d(-0.5em,-0.5em,0.5em)]"
                    style={{
                      background: bgGradient,
                      boxShadow: '0.5em -0.5em 0.75em rgba(0,0,0,0.5)'
                    }}
                  ></span>

                  {/* Front Glass Layer */}
                  <span
                    className="absolute top-0 left-0 w-full h-full rounded-[1.25em] bg-[hsla(0,0%,100%,0.05)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[80%_50%] flex backdrop-blur-[0.75em] [-webkit-backdrop-filter:blur(0.75em)] [-moz-backdrop-filter:blur(0.75em)] [will-change:transform] transform group-hover:[transform:translate3d(0,0,2em)] ring-1 ring-white/10"
                    style={{
                      boxShadow: '0 0 0 0.1em hsla(0, 0%, 100%, 0.1) inset'
                    }}
                  >
                    <span className="m-auto w-[2em] h-[2em] flex items-center justify-center text-white" aria-hidden="true">
                      <widget.icon className="w-full h-full" />
                    </span>
                  </span>
                </div>

                <h3 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent mb-1">
                  {widget.value}
                </h3>
                <p className="text-sm font-semibold text-white/80 tracking-wide">
                  {widget.title}
                </p>
                <p className="text-xs text-white/40 mt-1">
                  {widget.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
