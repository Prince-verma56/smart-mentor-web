"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Sparkles, BookOpen, Clock, Target } from "lucide-react";
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
        {/* Inline Glass Icon */}
        <div className="relative bg-transparent outline-none border-none w-[1.5em] h-[1.5em] [perspective:24em] [transform-style:preserve-3d]">
          <span
            className="absolute top-0 left-0 w-full h-full rounded-[0.3em] block transition-[opacity,transform] duration-300 origin-[100%_100%] rotate-[15deg] group-hover:[transform:rotate(25deg)_translate3d(-0.1em,-0.1em,0.1em)]"
            style={{
              background: 'linear-gradient(to bottom right, #10b981, #047857)',
              boxShadow: '0.1em -0.1em 0.2em rgba(0,0,0,0.5)'
            }}
          ></span>
          <span
            className="absolute top-0 left-0 w-full h-full rounded-[0.3em] bg-[hsla(0,0%,100%,0.05)] transition-[opacity,transform] duration-300 origin-[80%_50%] flex backdrop-blur-[0.2em] transform group-hover:[transform:translate3d(0,0,0.5em)] ring-1 ring-white/20"
          >
            <span className="m-auto w-[0.8em] h-[0.8em] flex items-center justify-center text-white" aria-hidden="true">
              <Sparkles className="w-full h-full" />
            </span>
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white/90">Continue Learning</h2>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="w-full border-primary/20 bg-primary/5 backdrop-blur-md overflow-hidden relative group shadow-sm hover:shadow-lg transition-all duration-300">
          {/* Background Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px] group-hover:bg-primary/30 transition-all duration-700 pointer-events-none" />
          
          <CardContent className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between relative z-10">
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
              <Button size="lg" className="w-full md:w-auto h-14 px-8 gap-3 shadow-lg hover:shadow-primary/25 transition-all text-base rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                <Play className="h-5 w-5 fill-current" />
                Resume Session
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
