"use client";

import { useUser } from "@clerk/nextjs";
import { useConversation } from "@/contexts/ConversationContext";
import type { Mentor, MentorStats } from "@/types/mentor";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  BrainCircuit, 
  Code2, 
  Mic,
  TrendingUp,
  Target,
  Clock,
  CheckCircle2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import MaskRevealUp from "@/components/ui/smoothui/mask-reveal-up";
import { cn } from "@/lib/utils";

interface WelcomeDashboardProps {
  mentor: Mentor;
  stats: MentorStats;
  onSendMessage: (msg: string) => void;
}

export function WelcomeDashboard({ mentor, stats, onSendMessage }: WelcomeDashboardProps) {
  const { user } = useUser();
  const firstName = user?.firstName || "there";
  const { sessions, setActiveSession } = useConversation();

  const quickActions = [
    { label: "Continue Lesson", icon: Play, query: "I want to continue with the current lesson on " + stats.currentTopic },
    { label: "Quiz Me", icon: BrainCircuit, query: "Give me a quiz on the current topic" },
    { label: "Coding Exercise", icon: Code2, query: "Give me a coding exercise for " + stats.currentTopic },
    { label: "Start Voice Session", icon: Mic, query: "Let's do a voice session" },
  ];

  return (
    <div className="flex flex-col max-w-4xl mx-auto space-y-6 px-4 pb-12 w-full mt-4">
      
      {/* ── Header ────────────────────────────────────── */}
      <div className="flex flex-col space-y-2 mb-6 animate-in slide-in-from-bottom-2 fade-in duration-500">
        <MaskRevealUp className="text-3xl font-bold tracking-tight text-foreground">
          {`👋 Welcome Back, ${firstName}`}
        </MaskRevealUp>
        {stats.currentTopic && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-muted-foreground text-sm font-medium">Continue Learning:</span>
            <span className="text-primary font-semibold text-sm bg-primary/10 px-2 py-0.5 rounded-md">
              {stats.currentTopic}
            </span>
          </div>
        )}
      </div>

      {/* ── Main Stats Grid ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 fade-in duration-700">
        
        {/* Progress Card */}
        <Card className="p-5 flex flex-col justify-between border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Progress</h3>
            </div>
            <span className="text-2xl font-bold tracking-tight">{Math.round(stats.progressPercent)}%</span>
          </div>
          
          <div className="space-y-2">
            <Progress value={stats.progressPercent} className="h-2 w-full" />
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>{stats.completedTopics} Completed</span>
              <span>12 Total Topics</span>
            </div>
          </div>
        </Card>

        {/* Today's Goal Card */}
        <Card className="p-5 flex flex-col justify-between border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              <Target className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Today's Goal</h3>
            </div>
          </div>
          
          <div className="flex flex-col gap-1 mt-2">
            <span className="text-lg font-bold truncate">Complete {stats.currentTopic}</span>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <Clock className="h-3.5 w-3.5" />
              <span>Estimated 45 min</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Quick Actions ─────────────────────────────── */}
      <div className="flex flex-col space-y-3 animate-in slide-in-from-bottom-6 fade-in duration-700 delay-100 fill-mode-both">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground/80 px-1">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(action.query)}
              className={cn(
                "flex flex-col items-center justify-center p-4 gap-3 rounded-xl border bg-card hover:bg-muted/50 hover:border-primary/40 transition-all duration-200 group text-center shadow-sm hover:shadow-md hover:-translate-y-0.5",
                i === 0 ? "border-primary/30 bg-primary/5" : ""
              )}
            >
              <div className={cn(
                "p-2.5 rounded-full transition-colors",
                i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-foreground group-hover:bg-primary group-hover:text-primary-foreground"
              )}>
                <action.icon className="h-4 w-4" />
              </div>
              <span className="text-[13px] font-semibold leading-tight px-1">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Recent Activity ───────────────────────────── */}
      <div className="flex flex-col space-y-3 pt-4 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200 fill-mode-both">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground/80 px-1">
          Recent Activity
        </h3>
        <Card className="p-0 overflow-hidden border-border/60">
           <div className="flex items-center justify-between p-4 bg-muted/20 border-b">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Yesterday</span>
           </div>
           <div className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
             <div className="flex h-8 w-8 rounded-full bg-primary/10 items-center justify-center shrink-0">
               <CheckCircle2 className="h-4 w-4 text-primary" />
             </div>
             <div className="flex flex-col min-w-0">
               <span className="text-[13px] font-medium text-foreground">Completed Database Fundamentals</span>
               <span className="text-xs text-muted-foreground truncate">You mastered SQL joins and basic indexing.</span>
             </div>
           </div>
        </Card>
      </div>

    </div>
  );
}
