"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Settings, Zap, Home, Clock, BookOpen, Brain, Mic, MessageSquare, Edit2, Check, X } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import type { Mentor, MentorStats } from "@/types/mentor";
import Breadcrumb from "@/components/ui/smoothui/breadcrumb";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface MentorHeaderProps {
  mentor: Mentor;
  stats?: MentorStats;
}

const DIFFICULTY_COLORS = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  intermediate: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  advanced: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  expert: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
} as const;

export function MentorHeader({ mentor, stats }: MentorHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(mentor.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateMentor = useMutation(api.mentors.updateMentor as any);

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
        await updateMentor({ id: mentor.id, name: nameInput.trim() });
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
    <header className="border-b bg-background shrink-0 flex flex-col">
      {/* Row 1: Breadcrumb & Top Actions */}
      <div className="flex items-center justify-between px-4 pt-2.5 pb-1">
        <Breadcrumb
          items={[
            { label: <Home className="h-3.5 w-3.5" />, href: "/dashboard" },
            { label: "Mentors", href: "/dashboard/mentors" },
            { label: mentor.name },
          ]}
        />
        <div className="flex items-center gap-1.5 shrink-0">
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs hidden sm:flex" disabled>
            <Zap className="h-3 w-3" />
            Live Mode
          </Button>
          <Link href={`/dashboard/mentors/${mentor.id}/settings`}>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Settings className="h-3.5 w-3.5" />
              <span className="sr-only">Settings</span>
            </Button>
          </Link>
          <UserButton
            appearance={{ elements: { avatarBox: "h-7 w-7 ring-1 ring-border" } }}
          />
        </div>
      </div>

      {/* Row 2: Mentor Info & Meta Tags */}
      <div className="flex flex-col gap-3 px-4 pb-3">
        {/* Name & Basic Info */}
        <div className="flex items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
            {isEditingName ? (
              <div className="flex items-center gap-1">
                <Input
                  ref={inputRef}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSaveName}
                  className="h-7 text-sm font-semibold w-48 px-2 py-0"
                />
                <Button variant="ghost" size="icon" className="h-6 w-6 text-green-600 hover:text-green-700" onClick={handleSaveName}>
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => { setNameInput(mentor.name); setIsEditingName(false); }}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="text-sm font-semibold leading-tight truncate">{mentor.name}</h1>
                <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" onClick={() => setIsEditingName(true)}>
                  <Edit2 className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            <Separator orientation="vertical" className="h-4 hidden sm:block" />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
               <span className="flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                 Online
               </span>
               <span>·</span>
               <span>Using llama-3.1-8b</span>
            </div>
          </div>
        </div>

        {/* Detailed Meta Tags */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className={`font-medium px-1.5 py-0.5 rounded border ${DIFFICULTY_COLORS[mentor.difficultyLevel]}`}>
            {mentor.difficultyLevel.charAt(0).toUpperCase() + mentor.difficultyLevel.slice(1)}
          </span>
          <Badge variant="secondary" className="font-normal text-[10px] h-5 px-1.5 bg-muted/50 border-muted">
            {mentor.learningStyle} Learner
          </Badge>
          <Badge variant="secondary" className="font-normal text-[10px] h-5 px-1.5 bg-muted/50 border-muted">
             {mentor.teachingSpeed} Speed
          </Badge>
          
          <Separator orientation="vertical" className="h-3 mx-1 hidden sm:block" />
          
          <div className="hidden sm:flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1" title="Memory Enabled">
              <Brain className="h-3 w-3 text-primary/70" />
              Memory
            </span>
             <span className="flex items-center gap-1 opacity-50" title="Voice Coming Soon">
              <Mic className="h-3 w-3" />
              Voice
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3 text-blue-500/70" />
              {knowledgeCount} Sources
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {stats?.messagesCount || 0} Messages
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {mentor.sessionDuration}m Session
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
