"use client";

import { useUser } from "@clerk/nextjs";
import type { Mentor, MentorStats } from "@/types/mentor";
import { 
  Code2, 
  Map, 
  FileText, 
  ImageIcon,
  Sparkles
} from "lucide-react";
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

  const timeOfDay = new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening";

  const suggestedPrompts = [
    { label: "Explain a concept", icon: Sparkles, query: "Can you explain how React hooks work under the hood?" },
    { label: "Review this code", icon: Code2, query: "I have some code that I'd like you to review for best practices." },
    { label: "Analyze image", icon: ImageIcon, query: "I'm going to upload an image of a UI. Can you break it down for me?" },
    { label: "Continue roadmap", icon: Map, query: "Let's continue with my roadmap. What's the next topic?" },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto px-4 w-full pt-12 pb-20">
      
      <div className="flex flex-col items-center text-center space-y-4 mb-16 animate-in slide-in-from-bottom-4 fade-in duration-700">
        <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-2 shadow-sm ring-1 ring-primary/20">
          <span className="text-3xl">👋</span>
        </div>
        
        <MaskRevealUp className="text-3xl font-semibold tracking-tight text-foreground">
          {`Good ${timeOfDay}, ${firstName}`}
        </MaskRevealUp>
        
        <p className="text-muted-foreground text-[15px]">
          What would you like to learn with {mentor.name} today?
        </p>
      </div>

      <div className="w-full flex flex-col space-y-4 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100 fill-mode-both">
        <div className="flex items-center gap-4">
          <div className="h-px bg-border/60 flex-1"></div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
            Suggested Prompts
          </span>
          <div className="h-px bg-border/60 flex-1"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {suggestedPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(prompt.query)}
              className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card/40 hover:bg-card hover:border-primary/30 transition-all duration-300 group text-left shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground shrink-0">
                <prompt.icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[14px] font-medium text-foreground">{prompt.label}</span>
                <span className="text-[12px] text-muted-foreground truncate">{prompt.query}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
