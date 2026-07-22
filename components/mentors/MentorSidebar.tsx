"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Map,
  FolderOpen,
  ClipboardList,
  Bookmark,
  History,
  ArrowLeft,
  MessageSquare,
  Sparkles,
  BookOpen,
  Code2,
  FolderKanban,
  FileText,
  Settings,
} from "lucide-react";
import type { Mentor } from "@/types/mentor";

interface MentorSidebarProps {
  mentor: Mentor;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function MentorSidebar({ mentor }: MentorSidebarProps) {
  const pathname = usePathname();
  const baseHref = `/dashboard/mentors/${mentor.id}`;

  const navGroups = [
    {
      title: "AI Mentor",
      items: [
        { label: "Conversation", icon: MessageSquare, href: baseHref, implemented: true },
        { label: "AI Mentor", icon: Sparkles, href: `${baseHref}/settings`, implemented: true },
      ]
    },
    {
      title: "Learning",
      items: [
        { label: "Learning Path", icon: Map, href: `${baseHref}/roadmap`, implemented: true },
        { label: "Knowledge Base", icon: BookOpen, href: "#", implemented: false },
        { label: "Practice", icon: Code2, href: "#", implemented: false },
        { label: "Projects", icon: FolderKanban, href: "#", implemented: false },
      ]
    },
    {
      title: "Work",
      items: [
        { label: "Assignments", icon: ClipboardList, href: "#", implemented: false },
        { label: "Resources", icon: FolderOpen, href: `${baseHref}/resources`, implemented: true },
      ]
    },
    {
      title: "Personal",
      items: [
        { label: "Notes", icon: FileText, href: "#", implemented: false },
        { label: "Bookmarks", icon: Bookmark, href: "#", implemented: false },
        { label: "History", icon: History, href: `${baseHref}/history`, implemented: true },
      ]
    },
    {
      title: "System",
      items: [
        { label: "Settings", icon: Settings, href: "/dashboard/settings", implemented: true },
      ]
    }
  ];

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Back link */}
      <div className="px-3 h-14 flex items-center border-b shrink-0">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground -ml-1 h-8">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">All Mentors</span>
          </Button>
        </Link>
      </div>

      {/* Mentor Identity */}
      <div className="px-4 py-4 shrink-0">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 shrink-0 ring-2 ring-background shadow-sm">
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
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm leading-tight truncate">{mentor.name}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{mentor.role}</p>
            </div>
          </div>
          <div className="flex gap-2">
             <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              {mentor.subject}
            </Badge>
             <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
              12 Sessions
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-2" data-lenis-prevent="true">
        <nav className="space-y-4 py-2">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1.5">
               <h4 className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">
                {group.title}
              </h4>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.implemented && pathname === item.href;

                return (
                  <Link
                    key={item.label}
                    href={item.implemented ? item.href : "#"}
                    onClick={(e) => {
                      if (!item.implemented) e.preventDefault();
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150 relative group",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : item.implemented
                        ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                        : "text-muted-foreground/40 cursor-not-allowed pointer-events-none"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {!item.implemented && (
                      <Badge
                        variant="outline"
                        className="ml-auto text-[9px] px-1 py-0 h-3.5 font-normal uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Soon
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}
