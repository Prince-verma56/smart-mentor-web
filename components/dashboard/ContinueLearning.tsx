"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import CommandButton from "@/components/kokonutui/command-button";
import { Play, Sparkles, BookOpen, Clock, Target, Rocket } from "lucide-react";
import { SingleGlassIcon } from "@/components/GlassIcons";
import type { MentorWithStats } from "@/types/mentor";
import { Progress } from "@/components/ui/progress";

interface ContinueLearningProps {
  recentMentor?: MentorWithStats;
}

export function ContinueLearning({ recentMentor }: ContinueLearningProps) {
  if (!recentMentor) return null;

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 group cursor-default mb-6">
        {/* Premium Glass Icon */}
        <div className="text-[10px] mr-1">
          <SingleGlassIcon item={{ icon: <Rocket className="w-full h-full" />, color: "green", label: "" }} />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white/90">Continue Learning</h2>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative group cursor-default"
      >
        {/* Subtle light-bleed edge highlight & gradient shadow */}
        <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-emerald-500/10 to-transparent blur-2xl opacity-60 pointer-events-none transform translate-y-4 translate-x-4" />

        <div className="relative w-full border-muted/40 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_10px_10px_40px_rgba(0,0,0,0.5),_20px_20px_80px_rgba(16,185,129,0.08)] transition-all duration-500 hover:bg-white/[0.03] rounded-[32px] bg-white/[0.02] backdrop-blur-2xl border border-white/[0.06]">
          
          {/* Fine frosted texture overlay */}
          <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

          {/* Background Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-700 pointer-events-none" />
          
          <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between relative z-10">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-2 text-sm text-primary font-semibold tracking-wide uppercase">
                <BookOpen className="h-4 w-4" />
                {recentMentor.name} • {recentMentor.role}
              </div>
              
              <div>
                <h3 className="text-3xl font-bold tracking-tight text-foreground">
                  {recentMentor.stats.currentTopic || "Introduction"}
                </h3>
                <p className="text-muted-foreground mt-2 text-base md:text-lg">
                  {recentMentor.stats.nextTopicSuggestion || "Continue your roadmap journey right where you left off."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-sm font-medium">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Est. 15 mins remaining
                </div>
                <div className="flex items-center gap-2 text-emerald-500">
                  <Sparkles className="h-4 w-4" />
                  +50 XP reward
                </div>
                <div className="flex items-center gap-2 text-blue-500">
                  <Target className="h-4 w-4" />
                  {recentMentor.stats.progressPercent}% of Roadmap
                </div>
              </div>

              <div className="w-full max-w-md pt-2">
                <Progress value={recentMentor.stats.progressPercent} className="h-2 bg-background/50" />
              </div>
            </div>

            <Link href={`/dashboard/mentors/${recentMentor.id}`} className="w-full md:w-auto shrink-0 mt-4 md:mt-0">
              <CommandButton
                size="lg"
                className="w-full md:w-auto !rounded-full !bg-emerald-500/15 !bg-none text-emerald-200 hover:text-white border-emerald-500/30 hover:border-emerald-500/50 transition-all hover:bg-emerald-500/25 font-medium shadow-[0_0_20px_-5px_rgba(16,185,129,0.3),_inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-md px-8 h-14 text-base cursor-pointer"
                rightIcon={<Play className="h-5 w-5 fill-current" />}
                sweepClassName="bg-gradient-to-r from-emerald-400/0 via-emerald-400/30 to-emerald-400/0"
              >
                Resume Session
              </CommandButton>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
