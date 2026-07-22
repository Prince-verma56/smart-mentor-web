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
  Settings,
  ArrowLeft,
  MessageSquare,
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

const navItems = [
  { label: "Conversation", icon: MessageSquare, href: "", implemented: true },
  { label: "Roadmap", icon: Map, href: "#", implemented: false },
  { label: "Resources", icon: FolderOpen, href: "#", implemented: false },
  { label: "Assignments", icon: ClipboardList, href: "#", implemented: false },
  { label: "Bookmarks", icon: Bookmark, href: "#", implemented: false },
  { label: "History", icon: History, href: "#", implemented: false },
  { label: "Settings", icon: Settings, href: "/settings", implemented: true },
];

export function MentorSidebar({ mentor }: MentorSidebarProps) {
  const pathname = usePathname();
  const baseHref = `/dashboard/mentors/${mentor.id}`;

  return (
    <aside className="flex h-full flex-col border-r bg-background">
      {/* Back */}
      <div className="px-4 pt-4 pb-2">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2">
            <ArrowLeft className="h-4 w-4" />
            All Mentors
          </Button>
        </Link>
      </div>

      <Separator />

      {/* Mentor Identity */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 shrink-0">
            {mentor.avatarUrl ? (
              <img src={mentor.avatarUrl} alt={mentor.name} className="object-cover" />
            ) : null}
            <AvatarFallback
              style={{ backgroundColor: mentor.avatarColor }}
              className="text-white font-semibold"
            >
              {getInitials(mentor.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-tight truncate">{mentor.name}</p>
            <p className="text-xs text-muted-foreground truncate">{mentor.role}</p>
            <Badge variant="secondary" className="mt-1 text-xs">
              {mentor.subject}
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-3">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const href = item.implemented ? `${baseHref}${item.href}` : "#";
            const isActive = item.implemented && pathname === href;
            
            return (
              <Link
                key={item.label}
                href={href}
                onClick={(e) => {
                  if (!item.implemented) e.preventDefault();
                }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors relative group",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : item.implemented
                    ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                    : "text-muted-foreground/50 cursor-not-allowed",
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", !item.implemented && "opacity-50")} />
                <span className={cn(!item.implemented && "opacity-50")}>{item.label}</span>
                
                {!item.implemented && (
                  <Badge variant="outline" className="ml-auto text-[10px] px-1.5 py-0 h-4 font-normal uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                    Soon
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
