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
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { updateMentorAction } from "@/actions/mentorActions";
import { usePathname, useRouter } from "next/navigation";
import { useConversation } from "@/contexts/ConversationContext";
import { Plus } from "lucide-react";
import SlideTextButton from "@/components/kokonutui/slide-text-button";
import { NewChatDialog } from "./NewChatDialog";
import { MemoryDrawer } from "./MemoryDrawer";

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
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const { createNewSession } = useConversation();

  // Knowledge sources count from real stats
  const knowledgeCount = stats?.filesUploaded || 0;

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
    <header className="border-b border-white/[0.05] bg-background/80 backdrop-blur-2xl shrink-0 flex items-center justify-between px-5 py-2 min-h-[52px]">
      {/* ── Left: Breadcrumbs & Status ──────────────────── */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: mentor.name },
          ]}
        />
        <Separator orientation="vertical" className="h-3.5 bg-white/[0.05] hidden md:block" />
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_0_10px_rgba(16,185,129,0.2)] text-emerald-400 text-[10px] font-semibold tracking-widest uppercase">
           <span className="relative flex h-1.5 w-1.5">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75" style={{ animationDuration: '3s' }}></span>
             <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary/70"></span>
           </span>
           Online
        </div>
      </div>

      {/* ── Center: Learning Status ──────────────────────── */}
      <div className="hidden lg:flex items-center justify-center flex-1 min-w-0 px-4">
        {stats?.currentTopic && (
          <div className="flex items-center gap-3.5 px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-md max-w-full hover:bg-white/[0.04] transition-colors cursor-default shrink min-w-0">
            <div className="flex items-center gap-1.5 min-w-0 shrink">
              <span className="text-[13px] font-bold uppercase tracking-[0.05em] text-muted-foreground/70 shrink-0">Topic:</span>
              <span className="text-[13px] font-semibold text-foreground truncate block">{stats.currentTopic}</span>
            </div>
            {stats.progressPercent > 0 && (
              <>
                <Separator orientation="vertical" className="h-3.5 bg-white/[0.05] shrink-0" />
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="w-16 h-[5px] bg-white/[0.05] shadow-[inset_0_1px_1px_rgba(0,0,0,0.2)] rounded-full overflow-hidden relative">
                    <motion.div 
                      className="absolute left-0 top-0 bottom-0 bg-primary rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.progressPercent}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-foreground/80">{Math.round(stats.progressPercent)}%</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Right: Memory, Sources, New Chat, Settings ─────────────── */}
      <div className="flex items-center justify-end gap-3 flex-1 min-w-0">
        <div className="hidden md:flex items-center gap-2 mr-2">
           <motion.button 
             onClick={() => setIsMemoryOpen(true)}
             whileTap={{ scale: 0.96 }}
             className="flex h-7 items-center gap-1.5 px-3 rounded-full bg-white/[0.02] hover:bg-white/[0.05] text-muted-foreground hover:text-emerald-400 text-[11px] font-medium transition-all duration-150 border border-white/[0.02] hover:border-emerald-500/30 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
           >
             <Brain className="h-3.5 w-3.5" />
             <span className="hidden xl:inline">Memory</span>
           </motion.button>
           <motion.button 
             whileTap={{ scale: 0.96 }}
             className="flex h-7 items-center gap-1.5 px-3 rounded-full bg-white/[0.02] hover:bg-white/[0.05] text-muted-foreground hover:text-emerald-400 text-[11px] font-medium transition-all duration-150 border border-white/[0.02] hover:border-emerald-500/30 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
           >
             <BookOpen className="h-3.5 w-3.5" />
             <span className="hidden xl:inline">Sources</span>
             <motion.div 
                key={knowledgeCount}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center justify-center h-4 min-w-4 px-1 ml-0.5 text-[9px] font-bold rounded-full bg-primary/10 text-primary"
             >
                {knowledgeCount}
             </motion.div>
           </motion.button>

           <div className="w-px h-3.5 bg-white/[0.05] mx-1.5" />

           {!isSettingsView && (
             <SlideTextButton 
               as="button"
               onClick={() => setIsNewChatOpen(true)}
               text="New Chat"
               hoverText="Start Chat"
               icon={<Plus className="h-3.5 w-3.5" />}
             />
           )}
           {isSettingsView ? (
             <button 
               className="h-7 gap-1.5 text-[11px] px-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] inline-flex items-center justify-center rounded-full bg-white/[0.05] border border-white/[0.1] text-foreground hover:bg-white/[0.08] font-medium transition-all" 
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
               className="h-8 w-8 text-muted-foreground hover:text-emerald-400 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.1] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all duration-300 flex items-center justify-center rounded-full group hover:rotate-90" 
               title="Settings"
               onClick={() => {
                 startNavigating(() => {
                   router.push(`/dashboard/mentors/${mentor.id}/settings`);
                 });
               }}
             >
               {isNavigating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Settings className="h-5 w-5 transition-transform duration-300" />}
             </button>
           )}
        </div>
        <Separator orientation="vertical" className="h-4 mx-1 bg-white/[0.05] hidden md:block" />
        <div className="relative group rounded-full ml-1">
          <div className="absolute inset-[-3px] rounded-full bg-gradient-to-tr from-primary/0 via-primary/0 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "h-7 w-7 ring-1 ring-border shadow-sm group-hover:ring-primary/30 transition-all duration-300"
              }
            }}
          />
        </div>
      </div>
      
      <NewChatDialog 
        open={isNewChatOpen} 
        onOpenChange={setIsNewChatOpen} 
        stats={stats} 
      />

      <MemoryDrawer
        open={isMemoryOpen}
        onOpenChange={setIsMemoryOpen}
        stats={stats}
      />
    </header>
  );
}
