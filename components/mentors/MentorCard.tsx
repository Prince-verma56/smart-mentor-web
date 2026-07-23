"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Flame, Clock, BookOpen, ArrowRight, MoreHorizontal, Settings, Copy, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { MentorWithStats } from "@/types/mentor";

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

  const lastSession = stats.lastSessionDate
    ? relativeTime(stats.lastSessionDate)
    : "Never";

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 shrink-0">
            {mentor.avatarUrl ? (
              <img src={mentor.avatarUrl} alt={mentor.name} className="object-cover" />
            ) : null}
            <AvatarFallback
              style={{ backgroundColor: mentor.avatarColor }}
              className="text-white font-semibold text-base"
            >
              {getInitials(mentor.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold leading-tight truncate pr-6">{mentor.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{mentor.role}</p>
            <Badge variant="secondary" className="mt-1 text-xs">
              {SUBJECT_LABELS[mentor.subject] ?? mentor.subject}
            </Badge>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2 text-muted-foreground absolute right-4 top-4" />}>
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem render={<Link href={`/dashboard/mentors/${mentor.id}/settings`} className="cursor-pointer" />}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <Copy className="mr-2 h-4 w-4" />
                <span>Duplicate</span>
                <Badge variant="outline" className="ml-auto text-[10px] px-1 py-0 h-4 uppercase">Soon</Badge>
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
                <Badge variant="outline" className="ml-auto text-[10px] px-1 py-0 h-4 uppercase">Soon</Badge>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pb-3">
        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span className="font-medium text-foreground">{stats.progressPercent}%</span>
          </div>
          <Progress value={stats.progressPercent} className="h-1.5" />
          <p className="text-xs text-muted-foreground">
            {stats.completedTopics} / {stats.totalTopics} topics completed
          </p>
        </div>

        <Separator />

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-orange-500">
              <Flame className="h-3.5 w-3.5" />
              <span className="text-sm font-semibold">{stats.learningStreak}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Streak</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-blue-500">
              <BookOpen className="h-3.5 w-3.5" />
              <span className="text-sm font-semibold">{stats.totalSessions}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Sessions</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-primary">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-sm font-semibold">{Math.round(stats.totalMinutes / 60)}h</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Total</p>
          </div>
        </div>

        {/* Current topic */}
        <div className="rounded-md bg-muted/50 p-2.5">
          <p className="text-xs text-muted-foreground">Current Topic</p>
          <p className="text-sm font-medium mt-0.5 truncate">{stats.currentTopic}</p>
        </div>

        {/* Last session */}
        <p className="text-xs text-muted-foreground">Last session: {lastSession}</p>
      </CardContent>

      <CardFooter className="pt-0">
        <Link href={`/dashboard/mentors/${mentor.id}`} className="w-full">
          <Button className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all" size="sm">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
