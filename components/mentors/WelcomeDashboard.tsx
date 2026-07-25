"use client";

import { useUser } from "@clerk/nextjs";
import type { Mentor, MentorStats } from "@/types/mentor";
import { 
  Code2, 
  Map, 
  FileText, 
  HelpCircle,
  GraduationCap
} from "lucide-react";
import MaskRevealUp from "@/components/ui/smoothui/mask-reveal-up";

interface WelcomeDashboardProps {
  mentor: Mentor;
  stats: MentorStats;
  onFillInput: (msg: string) => void;
}

export function WelcomeDashboard({ mentor, stats, onFillInput }: WelcomeDashboardProps) {
  const { user } = useUser();
  const firstName = user?.firstName || "there";

  const hour = new Date().getHours();
  let timeGreeting = "Good Morning";
  if (hour >= 12 && hour < 17) timeGreeting = "Welcome back";
  else if (hour >= 17 && hour < 22) timeGreeting = "Ready to continue learning?";
  else if (hour >= 22 || hour < 4) timeGreeting = "Burning the midnight oil?";

  const suggestedPrompts = [
    { label: "Continue Roadmap", icon: Map, query: "Let's continue with my roadmap. What's the next topic?" },
    { label: "Practice Current Topic", icon: Code2, query: "I'd like to practice the current topic with an exercise." },
    { label: "Review Last Lesson", icon: FileText, query: "Can we review what we covered in the last lesson?" },
    { label: "Ask a Question", icon: HelpCircle, query: "I have a question about something I'm learning..." },
    { label: "Generate Quiz", icon: GraduationCap, query: "Give me a short quiz to test my understanding." },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto px-4 w-full">
      
      {/* ── Greeting & Profile ── */}
      <div className="flex flex-col items-center text-center space-y-4 mb-10 animate-in slide-in-from-bottom-4 fade-in duration-700">
        <div className="relative">
          <div className="h-20 w-20 rounded-3xl overflow-hidden ring-4 ring-background shadow-lg">
             {mentor.avatarUrl ? (
                <img src={mentor.avatarUrl} alt={mentor.name} className="object-cover h-full w-full" />
             ) : (
                <div 
                  className="h-full w-full flex items-center justify-center text-white text-xl font-bold"
                  style={{ background: `linear-gradient(135deg, ${mentor.avatarColor} 0%, rgba(0,0,0,0.8) 100%)` }}
                >
                  {mentor.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                </div>
             )}
          </div>
          <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-[3px] border-background"></span>
        </div>
        
        <div className="space-y-1">
          <MaskRevealUp className="text-3xl font-semibold tracking-tight text-foreground">
            {`${timeGreeting}, ${firstName}.`}
          </MaskRevealUp>
          <p className="text-muted-foreground text-[15px]">
            {mentor.name} — {mentor.role}
          </p>
        </div>
      </div>

      {/* ── Stats Dashboard ── */}
      <div className="w-full flex gap-4 justify-center mb-10 animate-in slide-in-from-bottom-6 fade-in duration-700 delay-100 fill-mode-both">
        <div className="bg-card/40 border border-border/50 rounded-2xl p-4 flex gap-8 shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Subject</span>
            <span className="text-sm font-medium text-foreground mt-1">{mentor.subject}</span>
          </div>
          <div className="w-px bg-border/50" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Completion</span>
            <span className="text-sm font-medium text-foreground mt-1">{stats.roadmap_progress || 0}%</span>
          </div>
          <div className="w-px bg-border/50" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Current Streak</span>
            <span className="text-sm font-medium text-foreground mt-1">{stats.current_streak || 0} Days</span>
          </div>
        </div>
      </div>

      {/* ── Suggested Actions ── */}
      <div className="w-full max-w-2xl animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200 fill-mode-both">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestedPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => onFillInput(prompt.query)}
              className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card/40 hover:bg-card hover:border-primary/30 transition-all duration-300 group text-left shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground shrink-0">
                <prompt.icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[14px] font-medium text-foreground">{prompt.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
