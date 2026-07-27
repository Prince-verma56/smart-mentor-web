"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Flame, BookOpen, Clock, Target, PlayCircle, Trophy, 
  TrendingUp, Sparkles, AlertCircle, Brain, Rocket, HelpCircle,
  CheckCircle2, Mic, Code2, MessagesSquare
} from "lucide-react";
import type { MentorStats } from "@/types/mentor";
import { motion } from "framer-motion";
import { SingleGlassIcon } from "@/components/GlassIcons";

interface VisualAnalyticsProps {
  stats: MentorStats;
}

export function VisualAnalytics({ stats }: VisualAnalyticsProps) {
  const hoursTotal = Math.round((stats.totalMinutes || 0) / 60);
  const todayProgress = stats.progressPercent || 0;
  const currentTopic = stats.currentTopic || "Introduction to Frontend";
  
  // Simulated AI Insight data
  const confidenceScore = Math.min(100, (stats.completedTopics || 0) * 15 + 20);
  const difficultyBars = [1, 1, 1, 1, 0, 0]; // 4/6 difficulty
  
  return (
    <div className="space-y-4 pb-4">
      {/* 🧠 AI Mentor Insight */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="rounded-[24px] border-emerald-500/20 bg-emerald-500/5 backdrop-blur-2xl overflow-hidden relative shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_0_20px_rgba(16,185,129,0.1)]">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-primary/10 blur-[50px] rounded-full pointer-events-none" />
          <CardContent className="p-5 space-y-4 relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="h-4 w-4 text-[#10b981] animate-pulse" />
              <span className="text-[11px] font-bold text-[#10b981] tracking-wider uppercase">AI Mentor Insight</span>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground/80 mb-1">You are currently mastering</p>
              <h3 className="text-lg font-bold text-foreground leading-tight">{currentTopic}</h3>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">Difficulty</p>
                <div className="flex gap-1">
                  {difficultyBars.map((filled, i) => (
                    <div key={i} className={`h-1.5 w-5 rounded-sm ${filled ? 'bg-primary shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-primary/10'}`} />
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">Confidence</p>
                <p className="text-xl font-bold text-[#10b981] leading-none">{confidenceScore}%</p>
              </div>
            </div>
            
            <div className="bg-black/40 rounded-lg p-3 border border-[#10b981]/10 text-sm font-medium text-foreground/90 leading-relaxed shadow-inner">
              <span className="text-[#10b981] mr-2">💡</span>
              Continue this lesson before moving to Backend. Average students spend 2.3 sessions here.
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Performance Grid */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="grid grid-cols-2 gap-3">
        <div className="group flex flex-col rounded-[20px] bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] p-3 hover:bg-white/[0.04] hover:border-white/[0.1] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all cursor-default">
          <div className="flex items-center justify-between mb-2">
             <div className="text-[6px] group-hover:scale-110 transition-transform">
               <SingleGlassIcon item={{ icon: <Target className="h-full w-full" />, color: "blue", label: "" }} />
             </div>
             <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">Top 5%</span>
          </div>
          <p className="text-xs text-muted-foreground font-medium">Response Accuracy</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold tracking-tight">{Math.max(85, confidenceScore + 5)}%</p>
            <span className="text-[10px] text-primary font-bold">+2% this week</span>
          </div>
        </div>
        
        <div className="group flex flex-col rounded-[20px] bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] p-3 hover:bg-white/[0.04] hover:border-white/[0.1] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all cursor-default">
          <div className="flex items-center justify-between mb-2">
             <div className="text-[6px] group-hover:scale-110 transition-transform">
               <SingleGlassIcon item={{ icon: <HelpCircle className="h-full w-full" />, color: "purple", label: "" }} />
             </div>
          </div>
          <p className="text-xs text-muted-foreground font-medium">Questions Asked</p>
          <p className="text-2xl font-bold tracking-tight">{stats.questionsAsked || 0}</p>
        </div>
        
        <div className="group flex flex-col rounded-[20px] bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] p-3 hover:bg-white/[0.04] hover:border-white/[0.1] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all cursor-default">
          <div className="flex items-center justify-between mb-2">
             <div className="text-[6px] group-hover:scale-110 transition-transform">
               <SingleGlassIcon item={{ icon: <Mic className="h-full w-full" />, color: "green", label: "" }} />
             </div>
          </div>
          <p className="text-xs text-muted-foreground font-medium">Voice Sessions</p>
          <p className="text-2xl font-bold tracking-tight">{Math.floor((stats.totalSessions || 0) * 0.4)}</p>
        </div>
        
        <div className="group flex flex-col rounded-[20px] bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] p-3 hover:bg-white/[0.04] hover:border-white/[0.1] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all cursor-default">
          <div className="flex items-center justify-between mb-2">
             <div className="text-[6px] group-hover:scale-110 transition-transform">
               <SingleGlassIcon item={{ icon: <Flame className="h-full w-full" />, color: "orange", label: "" }} />
             </div>
             {(stats.learningStreak || 0) > 2 && (
               <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">Hot</span>
             )}
          </div>
          <p className="text-xs text-muted-foreground font-medium">Current Streak</p>
          <p className="text-2xl font-bold tracking-tight">{stats.learningStreak || 0} <span className="text-sm font-medium text-muted-foreground">Days</span></p>
        </div>
      </motion.div>

      {/* Learning Timeline */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <Card className="rounded-[24px] border border-white/[0.05] bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2 uppercase tracking-wide">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Learning Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="relative border-l-2 border-border ml-3 pl-5 space-y-5 mt-3 mb-1">
              {/* Node 1: Today */}
              <div className="relative group">
                 <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-background transition-transform group-hover:scale-125" />
                 <p className="text-[10px] text-primary font-bold mb-1.5 uppercase tracking-wider">Today</p>
                 <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5 text-sm">
                      <div className="p-1 rounded bg-primary/10 text-primary shrink-0">
                        <Mic className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-medium text-foreground">Voice Session (12 min)</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-sm">
                      <div className="p-1 rounded bg-blue-500/10 text-blue-500 shrink-0">
                        <PlayCircle className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-foreground/90">Started {currentTopic}</span>
                    </div>
                 </div>
              </div>
              
              {/* Node 2: Yesterday */}
              <div className="relative group">
                 <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-muted-foreground/30 ring-4 ring-background transition-transform group-hover:scale-125" />
                 <p className="text-[10px] text-muted-foreground font-semibold mb-1.5 uppercase tracking-wider">Yesterday</p>
                 <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <div className="p-1 rounded bg-muted text-muted-foreground shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <span>Completed Database Fundamentals</span>
                    </div>
                 </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Advanced Achievements */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2 uppercase tracking-wide">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Achievements
            </CardTitle>
            <span className="text-xs font-bold text-primary">Level 4</span>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-4 gap-2">
              {[
                { name: "Fast Learner", icon: Rocket, color: "purple", shadow: "shadow-purple-500/20", bg: "bg-purple-500/10", border: "border-purple-500/20", unlocked: true },
                { name: "3-Day Streak", icon: Flame, color: "orange", shadow: "shadow-orange-500/20", bg: "bg-orange-500/10", border: "border-orange-500/20", unlocked: true },
                { name: "Voice Fluent", icon: Mic, color: "green", shadow: "shadow-green-500/20", bg: "bg-green-500/10", border: "border-green-500/20", unlocked: true },
                { name: "Code Master", icon: Code2, color: "blue", shadow: "shadow-blue-500/20", bg: "bg-blue-500/10", border: "border-blue-500/20", unlocked: false },
              ].map((badge, i) => (
                <div 
                  key={i} 
                  className={`group relative aspect-square rounded-xl flex items-center justify-center border transition-all duration-300 hover:scale-105 ${
                    badge.unlocked ? `${badge.bg} ${badge.border} shadow-sm ${badge.shadow} cursor-help` : 'bg-muted/20 border-dashed border-border/40 opacity-40 grayscale cursor-not-allowed'
                  }`}
                  title={badge.name}
                >
                  <div className={`text-[9px] transition-transform duration-300 group-hover:scale-110 ${!badge.unlocked && 'opacity-50'}`}>
                    <SingleGlassIcon item={{ icon: <badge.icon className="w-full h-full" />, color: badge.color, label: "" }} />
                  </div>
                  {badge.unlocked && (
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4">
               <div className="flex justify-between text-xs mb-1 font-medium">
                 <span className="text-muted-foreground">XP Progress</span>
                 <span>850 / 1000 XP</span>
               </div>
               <Progress value={85} className="h-1.5 bg-primary/10" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
