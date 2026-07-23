"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Settings, Zap, Home, Clock, BookOpen, Brain, Mic, MessageSquare, Edit2, Check, X, Loader2 } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import type { Mentor, MentorStats } from "@/types/mentor";
import Breadcrumb from "@/components/ui/smoothui/breadcrumb";
import { useState, useRef, useEffect, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { updateMentorAction } from "@/actions/mentorActions";
import { usePathname, useRouter } from "next/navigation";
import { useConversation } from "@/contexts/ConversationContext";
import { Plus } from "lucide-react";

interface MentorHeaderProps {
  mentor: Mentor;
  stats?: MentorStats;
}

const DIFFICULTY_COLORS = {
  beginner: "bg-primary/20 text-primary dark:bg-primary/20 dark:text-primary",
  intermediate: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  advanced: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  expert: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
} as const;

export function MentorHeader({ mentor, stats }: MentorHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isSettingsView = pathname?.endsWith("/settings");
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(mentor.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isNavigating, startNavigating] = useTransition();
  const { createNewSession } = useConversation();

  // Mock knowledge sources count based on subject or random for now
  const knowledgeCount = mentor.knowledgeFocus ? mentor.knowledgeFocus.split(',').length : 3;

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditingName]);

  const handleSaveName = async () => {
    if (nameInput.trim() && nameInput !== mentor.name) {
      try {
        await updateMentorAction(mentor.id, { name: nameInput.trim() });
      } catch (error) {
        console.error("Failed to update mentor name", error);
        setNameInput(mentor.name);
      }
    } else {
      setNameInput(mentor.name);
    }
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveName();
    if (e.key === "Escape") {
      setNameInput(mentor.name);
      setIsEditingName(false);
    }
  };

  return (
    <header className="border-b bg-background shrink-0 flex items-center justify-between px-5 py-1.5 min-h-[52px]">
      {/* ── Left: Breadcrumbs & Status ──────────────────── */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: mentor.name },
          ]}
        />
        <Separator orientation="vertical" className="h-4 bg-border/60 hidden md:block" />
        <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold tracking-wide uppercase border border-primary/20">
           <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
           Online
        </div>
      </div>

      {/* ── Center: Learning Status ──────────────────────── */}
      <div className="hidden lg:flex items-center justify-center flex-1 min-w-0">
        {stats?.currentTopic && (
          <div className="flex items-center gap-3 px-3 py-1 rounded-full bg-muted/30 border shadow-sm max-w-[400px]">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Topic</span>
              <span className="text-xs font-medium text-foreground truncate max-w-[200px]">{stats.currentTopic}</span>
            </div>
            {stats.progressPercent > 0 && (
              <>
                <Separator orientation="vertical" className="h-3" />
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500" 
                      style={{ width: `${stats.progressPercent}%` }} 
                    />
                  </div>
                  <span className="text-[11px] font-bold">{Math.round(stats.progressPercent)}%</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Right: Memory, Sources, New Chat, Settings ─────────────── */}
      <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
        <div className="hidden md:flex items-center gap-1.5 mr-2 text-muted-foreground">
           <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs px-2.5 hover:text-foreground">
             <Brain className="h-3.5 w-3.5" />
             <span className="hidden xl:inline">Memory</span>
           </Button>
           <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs px-2.5 hover:text-foreground">
             <BookOpen className="h-3.5 w-3.5" />
             <span className="hidden xl:inline">Sources</span>
             <Badge variant="secondary" className="h-4 min-w-4 px-1 ml-1 text-[9px] bg-primary/10 text-primary">{knowledgeCount}</Badge>
           </Button>

           <div className="w-px h-4 bg-border/60 mx-1" />

           {!isSettingsView && (
             <Button 
               size="sm"
               onClick={createNewSession}
               className="h-8 gap-1.5 text-xs px-3 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all rounded-md"
             >
               <Plus className="h-3.5 w-3.5" />
               <span className="hidden xl:inline">New Chat</span>
             </Button>
           )}
           {isSettingsView ? (
             <button 
               className="h-8 gap-1.5 text-xs px-3 shadow-sm inline-flex items-center justify-center rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium transition-colors" 
               title="Back to Chat"
               onClick={() => {
                 startNavigating(() => {
                   router.push(`/dashboard/mentors/${mentor.id}`);
                 });
               }}
             >
               {isNavigating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageSquare className="h-3.5 w-3.5" />}
               <span className="hidden xl:inline">Back to Chat</span>
             </button>
           ) : (
             <button 
               className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors inline-flex items-center justify-center rounded-md" 
               title="Settings"
               onClick={() => {
                 startNavigating(() => {
                   router.push(`/dashboard/mentors/${mentor.id}/settings`);
                 });
               }}
             >
               {isNavigating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
             </button>
           )}
        </div>
        <Separator orientation="vertical" className="h-4 mx-1 bg-border/60 hidden md:block" />
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "h-7 w-7 ring-2 ring-background shadow-sm"
            }
          }}
        />
      </div>
    </header>
  );
}
