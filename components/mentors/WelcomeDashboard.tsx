"use client";

import { useUser } from "@clerk/nextjs";
import type { Mentor, MentorStats } from "@/types/mentor";
import { 
  Code2, 
  Map, 
  FileText, 
  HelpCircle,
  GraduationCap,
  Loader2,
  BookOpen,
  ArrowRight,
  BrainCircuit,
  Zap,
  BookMarked
} from "lucide-react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const SoftAurora = dynamic(() => import("@/components/SoftAurora"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center opacity-30">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
});

interface WelcomeDashboardProps {
  mentor: Mentor;
  stats: MentorStats;
  onFillInput: (msg: string) => void;
}

export function WelcomeDashboard({ mentor, stats, onFillInput }: WelcomeDashboardProps) {
  const { user } = useUser();
  const firstName = user?.firstName || "there";

  const hour = new Date().getHours();
  let timeGreeting = "GOOD MORNING";
  if (hour >= 12 && hour < 17) timeGreeting = "GOOD AFTERNOON";
  else if (hour >= 17 && hour < 22) timeGreeting = "GOOD EVENING";
  else if (hour >= 22 || hour < 4) timeGreeting = "LATE NIGHT SECRETS";

  const suggestedPrompts = [
    { label: "Continue Roadmap", desc: "Pick up right where you left off", icon: Map, query: "Let's continue with my roadmap. What's the next topic?" },
    { label: "Practice Topic", desc: "Solidify your understanding", icon: Code2, query: "I'd like to practice the current topic with an exercise." },
    { label: "Ask a Question", desc: "Clear up any confusion", icon: HelpCircle, query: "I have a question about something I'm learning..." },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  } as any;

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
  } as any;

  const avatarVariants = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 20 }
    },
  } as any;

  return (
    <div className="absolute inset-0 w-full h-full overflow-y-auto flex flex-col items-center justify-center pt-6 pb-36">
      {/* ── Background Aurora (Untouched) ── */}
      <div className="absolute inset-0 z-0 opacity-100 pointer-events-none">
        <SoftAurora 
          color1="#020617" 
          color2="#10b981"
          speed={0.8}
          scale={2.5}
          brightness={1.8}
        />
      </div>

      {/* ── Drifting Ambient Lights Layer ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[8000ms]" />
        <div className="absolute bottom-[20%] right-[20%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] mix-blend-screen animate-pulse duration-[12000ms]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full max-w-5xl mx-auto px-4 w-full">
        
        {/* ── Main Workspace Content ── */}
        <motion.div 
          className="w-full max-w-3xl flex flex-col items-center relative z-10 shrink-0 select-none pt-4 pb-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* ── Avatar Upgrade ── */}
          <motion.div variants={avatarVariants} className="relative mb-6 group">
            {/* Slow Rotating Gradient Ring */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500/30 via-cyan-500/30 to-emerald-500/30 blur-md animate-[spin_8s_linear_infinite] opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative h-20 w-20 rounded-full overflow-hidden ring-1 ring-white/20 shadow-[0_0_40px_rgba(16,185,129,0.3)] bg-background">
               {mentor.avatarUrl ? (
                  <img src={mentor.avatarUrl} alt={mentor.name} className="object-cover h-full w-full" />
               ) : (
                  <div 
                    className="h-full w-full flex items-center justify-center text-white text-3xl font-extrabold"
                    style={{ background: `linear-gradient(135deg, ${mentor.avatarColor} 0%, rgba(0,0,0,0.9) 100%)` }}
                  >
                    {mentor.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                  </div>
               )}
               {/* Breathing inner shadow */}
               <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] animate-pulse" />
            </div>
            
            {/* Online Pulse */}
            <span className="absolute bottom-0.5 right-0.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-background shadow-[0_0_15px_rgba(16,185,129,0.8)]">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
            </span>
          </motion.div>
          
          {/* ── Greeting ── */}
          <motion.div variants={itemVariants} className="flex flex-col items-center text-center space-y-1 w-full max-w-2xl mb-8">
            <h1 className="text-4xl md:text-5xl leading-[1.1] font-extrabold tracking-tight text-foreground pb-1" style={{ textShadow: "0 4px 32px rgba(0,0,0,0.4)" }}>
              {firstName}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground font-medium max-w-lg mt-1" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}>
              {timeGreeting} — Resume your Full Stack roadmap
            </p>
          </motion.div>

          {/* ── Mentor Live Status Badges ── */}
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3 mb-10">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/5 hover:bg-black/50 hover:border-white/10 transition-all duration-300 shadow-sm cursor-default">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[12px] font-medium text-white/80">Online</span>
            </div>
            {(stats.memoryCount ?? 0) > 0 && (
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/5 hover:bg-black/50 hover:border-white/10 transition-all duration-300 shadow-sm cursor-default">
                <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[12px] font-medium text-white/80">Memory Synced</span>
              </div>
            )}
            {(stats.filesUploaded ?? 0) > 0 && (
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/5 hover:bg-black/50 hover:border-white/10 transition-all duration-300 shadow-sm cursor-default">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[12px] font-medium text-white/80">Knowledge Base Ready</span>
              </div>
            )}
          </motion.div>

          {/* ── Independent Glass Metrics Panel ── */}
          <motion.div variants={itemVariants} className="w-full flex justify-center mb-10">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] rounded-[24px] px-8 py-5 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_24px_-4px_rgba(0,0,0,0.2)]">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-2">Completion</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-emerald-400">{stats.progressPercent || 0}</span>
                  <span className="text-sm font-medium text-emerald-400/50">%</span>
                </div>
              </div>
              
              <div className="flex flex-col items-center bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] rounded-[24px] px-8 py-5 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_24px_-4px_rgba(0,0,0,0.2)]">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-2">Current Streak</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-white/90">{stats.learningStreak || 0}</span>
                  <span className="text-sm font-medium text-white/40">Days</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Independent Action Cards Grid ── */}
          <motion.div variants={itemVariants} className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => onFillInput(prompt.query)}
                  className={cn(
                    "relative flex items-center p-4 rounded-[24px] border border-white/[0.05] bg-white/[0.02] backdrop-blur-2xl hover:bg-white/[0.04] hover:border-emerald-500/30 transition-all duration-300 group text-left overflow-hidden",
                    "hover:-translate-y-[2px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_24px_-4px_rgba(0,0,0,0.2)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_32px_rgba(16,185,129,0.15)]",
                    i === 0 && suggestedPrompts.length % 2 !== 0 ? "sm:col-span-2" : ""
                  )}
                >
                  {/* Subtle Background Hover Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  <div className="h-12 w-12 rounded-[16px] bg-white/5 border border-white/5 flex items-center justify-center shrink-0 mr-4 group-hover:border-emerald-500/30 group-hover:text-emerald-400 text-white/50 transition-colors shadow-inner">
                    <prompt.icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  
                  <div className="flex flex-col min-w-0 flex-1 z-10">
                    <span className="text-[14px] font-semibold text-white/90 group-hover:text-white transition-colors">{prompt.label}</span>
                    <span className="text-[12px] text-white/40 group-hover:text-white/60 transition-colors truncate mt-0.5">{prompt.desc}</span>
                  </div>

                  <div className="pl-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 z-10">
                    <ArrowRight className="h-5 w-5 text-emerald-400" />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
