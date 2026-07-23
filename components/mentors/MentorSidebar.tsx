"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  MessageSquare, 
  Map, 
  FolderOpen, 
  Code2, 
  BookOpen, 
  FolderKanban, 
  Bookmark,
  Settings,
  Plus,
  Search,
  Brain,
  Library,
  MessageCircle,
  Menu,
  Pin,
  Loader2
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useConversation } from "@/contexts/ConversationContext";
import { SidebarAccordion } from "./SidebarAccordion";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { ConversationSidebar } from "./ConversationSidebar";

// Use a shared util for initials if available, else inline
const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

interface MentorSidebarProps {
  mentor: {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string | null;
    avatarColor?: string;
  };
  collapsed?: boolean;
  mobile?: boolean;
  onToggleCollapse?: () => void;
}

export function MentorSidebar({ mentor, collapsed = false, mobile = false, onToggleCollapse }: MentorSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isNavigatingSettings, startNavigatingSettings] = React.useTransition();
  const baseHref = `/dashboard/mentors/${mentor.id}`;
  const { createNewSession } = useConversation();

  const navGroups = [
    {
      title: "AI Mentor",
      items: [
        { label: "Conversation", icon: MessageSquare, href: baseHref, implemented: true },
        { label: "Learning Path", icon: Map, href: `${baseHref}/roadmap`, implemented: true },
        { label: "Knowledge Base", icon: Library, href: `${baseHref}/resources`, implemented: true },
      ],
    },
    {
      title: "Practice & Work",
      items: [
        { label: "Coding Exercises", icon: Code2, href: "#", implemented: false },
        { label: "Projects", icon: FolderKanban, href: "#", implemented: false },
      ],
    },
    {
      title: "Personal",
      items: [
        { label: "Notes", icon: BookOpen, href: "#", implemented: false },
        { label: "Bookmarks", icon: Bookmark, href: "#", implemented: false },
      ],
    },
  ];

  return (
    <div className="flex h-full flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-hidden relative border-r">
      {/* ── Premium Workspace Header ─────────────────────── */}
      <div className="flex flex-col shrink-0 p-3 pb-2 relative z-10">
        <div 
          onClick={collapsed && !mobile ? onToggleCollapse : undefined}
          className={cn(
          "flex items-center gap-3 p-2.5 rounded-xl border border-border/50 bg-card/40 backdrop-blur-md shadow-sm transition-all duration-300",
          collapsed && !mobile ? "justify-center px-1 flex-col py-3 gap-3 cursor-pointer hover:bg-muted/50" : "hover:shadow-md hover:bg-card/60 cursor-default group/header"
        )}>
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar className={cn(
              "ring-1 ring-border/80 shadow-sm transition-transform duration-300 group-hover/header:scale-[1.02]",
              collapsed && !mobile ? "h-8 w-8" : "h-10 w-10"
            )}>
              {mentor.avatarUrl ? (
                <img src={mentor.avatarUrl} alt={mentor.name} className="object-cover" />
              ) : null}
              <AvatarFallback style={{ backgroundColor: mentor.avatarColor }} className="text-white font-semibold text-xs">
                {getInitials(mentor.name)}
              </AvatarFallback>
            </Avatar>
            {/* Online Indicator */}
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-[2px] border-background shadow-sm" />
          </div>

          {(!collapsed || mobile) && (
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-bold text-[13px] leading-tight truncate text-foreground/90">{mentor.name}</span>
              <span className="text-[11px] text-muted-foreground truncate">{mentor.role || "AI Mentor"}</span>
            </div>
          )}

          {/* Progress / Action Toggle */}
          <div className={cn("flex items-center", collapsed && !mobile ? "mt-1" : "")}>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); onToggleCollapse?.(); }}
              className={cn(
                "text-muted-foreground/60 hover:text-foreground hover:bg-muted shrink-0 rounded-md transition-colors",
                collapsed && !mobile ? "h-8 w-8" : "h-6 w-6"
              )}
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <Menu className={cn(collapsed && !mobile ? "h-4 w-4" : "h-3 w-3")} />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto" data-lenis-prevent="true">
        <div className={cn("flex flex-col pb-4", collapsed && !mobile ? "items-center gap-2 px-0 pt-2" : "px-2 pt-1")}>
          
          {/* Navigation Groups */}
          {navGroups.map((group, groupIdx) => (
            <SidebarAccordion key={group.title} title={group.title} collapsed={collapsed && !mobile} storageKey={group.title}>
              <div className={cn("flex flex-col gap-[2px]", collapsed && !mobile ? "items-center w-full" : "w-full")}>
                {group.items.map((item) => {
                  const isActive = item.implemented && pathname === item.href;

                  function NavItem() {
                    const wrapperRef = React.useRef<HTMLDivElement | null>(null);
                    const [tooltipSide, setTooltipSide] = React.useState<"left" | "right">("right");

                    React.useEffect(() => {
                      const el = wrapperRef.current;
                      if (!el) return;
                      let parent: HTMLElement | null = el;
                      while (parent && parent !== document.documentElement) {
                        const sideAttr = parent.getAttribute("data-side");
                        if (sideAttr === "right" || sideAttr === "left") {
                          setTooltipSide(sideAttr === "right" ? "left" : "right");
                          return;
                        }
                        parent = parent.parentElement;
                      }
                      setTooltipSide("right");
                    }, []);

                    const content = (
                      <Link
                        href={item.implemented ? item.href : "#"}
                        onClick={(e) => !item.implemented && e.preventDefault()}
                        className={cn(
                          "relative flex items-center transition-all duration-200 group shrink-0",
                          collapsed && !mobile
                            ? "h-11 w-11 justify-center rounded-xl mx-auto"
                            : "h-[34px] px-3 gap-2.5 rounded-md mx-1",
                          isActive
                            ? "bg-card/60 text-foreground font-medium shadow-sm border border-border/40 shadow-primary/5 relative overflow-hidden"
                            : item.implemented
                            ? "text-muted-foreground hover:bg-muted/40 hover:text-foreground border border-transparent"
                            : "text-muted-foreground/30 cursor-not-allowed pointer-events-none border border-transparent"
                        )}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1 bottom-1 w-[3px] bg-primary rounded-r-full" />
                        )}
                        <item.icon className={cn(collapsed && !mobile ? "h-5 w-5" : "h-4 w-4 shrink-0", isActive ? "text-primary ml-0.5" : "text-muted-foreground/70")} strokeWidth={isActive ? 2.5 : 2} />
                        {(!collapsed || mobile) && (
                          <span className="text-[13px] truncate">{item.label}</span>
                        )}
                        {(!collapsed || mobile) && !item.implemented && (
                          <span className="ml-auto text-[9px] text-muted-foreground/40 font-mono uppercase hidden group-hover:block border rounded px-1">
                            soon
                          </span>
                        )}
                      </Link>
                    );

                    if (!collapsed || mobile) return content;

                    return (
                      <div ref={wrapperRef}>
                        <Tooltip>
                          <TooltipTrigger render={content} />
                          <TooltipContent side={tooltipSide} align="center">
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    );
                  }

                  return <NavItem key={item.label} />;
                })}
              </div>
            </SidebarAccordion>
          ))}

          {/* Conversations — full production sidebar */}
          {(!collapsed || mobile) ? (
            <div className="mt-1">
              <div className="px-3 py-1 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                  Conversations
                </span>
              </div>
              <ConversationSidebar collapsed={false} />
            </div>
          ) : (
            <div className="mt-3 w-full flex flex-col items-center">
              <div className="w-8 h-[1px] bg-border/60 mb-2" />
              <ConversationSidebar collapsed />
            </div>
          )}

        </div>
      </ScrollArea>

      {/* ── Settings (Bottom) ─────────────────────── */}
      <div className={cn("shrink-0 pb-3 pt-2", collapsed && !mobile ? "px-0 flex flex-col items-center" : "px-3")}>
        {(() => {
          const wrapperRef = React.useRef<HTMLDivElement | null>(null);
          const [tooltipSide, setTooltipSide] = React.useState<"left" | "right">("right");

          React.useEffect(() => {
            const el = wrapperRef.current;
            if (!el) return;
            let parent: HTMLElement | null = el;
            while (parent && parent !== document.documentElement) {
              const sideAttr = parent.getAttribute("data-side");
              if (sideAttr === "right" || sideAttr === "left") {
                setTooltipSide(sideAttr === "right" ? "left" : "right");
                return;
              }
              parent = parent.parentElement;
            }
            setTooltipSide("right");
          }, []);

          const content = (
            <button
              onClick={() => {
                startNavigatingSettings(() => {
                  router.push(`/dashboard/mentors/${mentor.id}/settings`);
                });
              }}
              className={cn(
                "relative flex items-center transition-all duration-200 group shrink-0",
                collapsed && !mobile
                  ? "h-11 w-11 justify-center rounded-xl mx-auto"
                  : "h-[34px] px-3 gap-2.5 rounded-md mx-1",
                pathname === `/dashboard/mentors/${mentor.id}/settings`
                  ? "bg-card/60 text-foreground font-medium shadow-sm border border-border/40 shadow-primary/5 relative overflow-hidden"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground border border-transparent"
              )}
            >
              {pathname === `/dashboard/mentors/${mentor.id}/settings` && (
                <div className="absolute left-0 top-1 bottom-1 w-[3px] bg-primary rounded-r-full" />
              )}
              {isNavigatingSettings ? (
                <Loader2 className={cn("animate-spin", collapsed && !mobile ? "h-5 w-5" : "h-4 w-4 shrink-0")} />
              ) : (
                <Settings className={cn(collapsed && !mobile ? "h-5 w-5" : "h-4 w-4 shrink-0")} strokeWidth={pathname === `/dashboard/mentors/${mentor.id}/settings` ? 2.5 : 2} />
              )}
              {(!collapsed || mobile) && (
                <span className="text-[13px] truncate">Settings</span>
              )}
            </button>
          );

          if (!collapsed || mobile) return content;

          return (
            <div ref={wrapperRef}>
              <Tooltip>
                <TooltipTrigger render={content} />
                <TooltipContent side={tooltipSide} align="center">
                  Settings
                </TooltipContent>
              </Tooltip>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
