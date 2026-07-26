"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Flame, Clock, BookOpen, ArrowRight, MoreHorizontal, Settings, Copy, Trash2, Mic } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import type { MentorWithStats } from "@/types/mentor";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import SmoothButton from "@/components/ui/smoothui/smooth-button";

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface MentorCardProps {
  mentor: MentorWithStats;
}

const SUBJECT_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  fullstack: "Full Stack",
  devops: "DevOps",
  "machine-learning": "Machine Learning",
  "data-science": "Data Science",
  dsa: "DSA",
  "system-design": "System Design",
  career: "Career",
  interview: "Interview Prep",
  communication: "Communication",
  english: "English",
  resume: "Resume",
  startup: "Startup",
  fitness: "Fitness",
  custom: "Custom",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function MentorCard({ mentor }: MentorCardProps) {
  const { stats } = mentor;
  const shouldReduceMotion = useReducedMotion();
  const [isHoverDevice, setIsHoverDevice] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    setIsHoverDevice(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsHoverDevice(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const lastSession = stats.lastSessionDate
    ? relativeTime(stats.lastSessionDate)
    : "Never";

  const SPRING = {
    type: "spring" as const,
    duration: 0.25,
    bounce: 0.1,
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger render={
        <motion.div
          className={cn(
            "group relative flex w-full h-full flex-col overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-xl shadow-[inset_0_1px_0px_rgba(255,255,255,0.05)] p-6",
            "transition-all duration-500 ease-out hover:border-emerald-500/30 hover:shadow-[0_8px_32px_-10px_rgba(16,185,129,0.2)]"
          )}
          initial={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 0, transform: "translateY(20px) scale(0.97)" }
          }
          transition={shouldReduceMotion ? { duration: 0 } : SPRING}
          viewport={{ once: true, margin: "-50px" }}
          whileInView={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 1, transform: "translateY(0px) scale(1)" }
          }
        />
      }>
        <div className="flex flex-col h-full relative z-10">
            {/* Subtle hover glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-start w-full gap-4 pb-6">
              <div className="flex gap-3 flex-1 min-w-0">
                <Avatar className="h-12 w-12 shrink-0 border border-white/10 shadow-sm">
                  {mentor.avatarUrl ? (
                    <img src={mentor.avatarUrl} alt={mentor.name} className="object-cover" />
                  ) : null}
                  <AvatarFallback
                    style={{ backgroundColor: mentor.avatarColor }}
                    className="text-white font-semibold text-sm"
                  >
                    {getInitials(mentor.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 className="font-semibold text-base leading-tight truncate text-white transition-colors">
                    {mentor.name}
                  </h3>
                  <p className="text-xs text-zinc-400 truncate mt-1">{mentor.role}</p>
                  <div className="flex items-center gap-2 mt-2 text-[10px]">
                    <Badge variant="secondary" className="px-1.5 py-0 rounded-sm font-medium bg-white/5 text-zinc-300 hover:bg-white/10">
                      {SUBJECT_LABELS[mentor.subject] ?? mentor.subject}
                    </Badge>
                  {(mentor as any).voiceEnabled && (
                    <Badge variant="outline" className="px-1.5 py-0 border-emerald-500/30 text-emerald-400 rounded-sm gap-1">
                        <Mic className="h-2.5 w-2.5" /> Voice
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 -mt-1 -mr-2 text-zinc-500 hover:text-zinc-300 opacity-50 group-hover:opacity-100 transition-opacity" />}>
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 z-50 bg-black/90 backdrop-blur-xl border border-white/[0.08] text-zinc-300">
                  <DropdownMenuItem render={<Link href={`/dashboard/mentors/${mentor.id}/settings`} className="cursor-pointer hover:bg-white/5 hover:text-white" />}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem disabled className="hover:bg-white/5">
                    <Copy className="mr-2 h-4 w-4" />
                    <span>Duplicate</span>
                    <Badge variant="outline" className="ml-auto text-[10px] px-1 py-0 h-4 uppercase border-white/10">Soon</Badge>
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled className="text-red-400 hover:bg-red-500/10">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                    <Badge variant="outline" className="ml-auto text-[10px] px-1 py-0 h-4 uppercase border-red-500/20 text-red-400">Soon</Badge>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

        <div className="flex-1 space-y-6 pb-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-zinc-400 font-medium">
              <span>Progress</span>
              <span className="text-white">{stats.progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${stats.progressPercent}%` }} 
              />
            </div>
            <p className="text-[10px] text-zinc-500">
              {stats.completedTopics} / {stats.totalTopics} topics completed
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/[0.03]">
              <div className="flex items-center gap-1.5 text-orange-500 mb-1">
                <Flame className="h-4 w-4" />
                <span className="text-sm font-bold text-zinc-200">{stats.learningStreak}</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Streak</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/[0.03]">
              <div className="flex items-center gap-1.5 text-blue-400 mb-1">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm font-bold text-zinc-200">{stats.totalSessions}</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Sessions</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/[0.03]">
              <div className="flex items-center gap-1.5 text-emerald-500 mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-bold text-zinc-200">{Math.round(stats.totalMinutes / 60)}h</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Total</span>
            </div>
          </div>

          {/* Current topic */}
          <div className="border-l-2 border-emerald-500/30 pl-3 py-1">
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mb-1">Current Focus</p>
            <p className="text-sm font-medium truncate text-zinc-200">{stats.currentTopic || "Getting Started"}</p>
          </div>
        </div>

        {/* Footer & Action Area */}
        <div className="pt-5 border-t border-white/[0.05] mt-auto">
          <div className="flex items-center justify-between w-full">
            <p className="text-xs text-zinc-500">Active: {lastSession}</p>
            <Link href={`/dashboard/mentors/${mentor.id}`}>
              <SmoothButton 
                size="sm" 
                variant="ghost" 
                className="gap-2 transition-all duration-300 group/btn rounded-full px-5 border border-emerald-500/50 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500 hover:text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
              >
                Continue
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
              </SmoothButton>
            </Link>
          </div>
        </div>
      </div>
    </ContextMenuTrigger>

      {/* Right-Click Context Menu Layer */}
      <ContextMenuContent className="w-48 bg-black/90 backdrop-blur-xl border border-white/[0.08] text-zinc-300 z-50">
        <ContextMenuItem render={<Link href={`/dashboard/mentors/${mentor.id}/settings`} className="cursor-pointer hover:bg-white/5 hover:text-white" />}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-white/10" />
        <ContextMenuItem disabled className="hover:bg-white/5">
          <Copy className="mr-2 h-4 w-4" />
          <span>Duplicate</span>
          <Badge variant="outline" className="ml-auto text-[10px] px-1 py-0 h-4 uppercase border-white/10">Soon</Badge>
        </ContextMenuItem>
        <ContextMenuItem disabled className="text-red-400 hover:bg-red-500/10">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
          <Badge variant="outline" className="ml-auto text-[10px] px-1 py-0 h-4 uppercase border-red-500/20 text-red-400">Soon</Badge>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
