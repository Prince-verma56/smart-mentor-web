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
import { AppButton } from "@/components/ui/app-button";
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
              collapsed && !mobile ? "h-10 w-10" : "h-12 w-12"
            )}>
              {mentor.avatarUrl ? (
                <img src={mentor.avatarUrl} alt={mentor.name} className="object-cover" />
              ) : null}
              <AvatarFallback style={{ backgroundColor: mentor.avatarColor }} className="text-white font-semibold text-sm">
                {getInitials(mentor.name)}
              </AvatarFallback>
            </Avatar>
            {/* Online Indicator */}
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-[2px] border-background shadow-sm">
              <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
            </span>
          </div>

          {(!collapsed || mobile) && (
            <div className="flex flex-col flex-1 min-w-0 justify-center">
              <span className="font-bold text-[14px] leading-tight truncate text-foreground/90 tracking-tight">{mentor.name}</span>
              <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/80 truncate mt-0.5">{mentor.role || "AI Mentor"}</span>
            </div>
          )}

          {/* Progress / Action Toggle */}
          <div className={cn("flex items-center", collapsed && !mobile ? "mt-1" : "")}>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); onToggleCollapse?.(); }}
              className={cn(
                "text-muted-foreground/60 hover:text-foreground hover:bg-muted shrink-0 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer h-10 w-10"
              )}
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className={cn("flex flex-col shrink-0", collapsed && !mobile ? "items-center gap-2 px-0 pt-2" : "px-2 pt-1")}>
          
          {/* Navigation Groups */}
          {navGroups.map((group, groupIdx) => (
            <SidebarAccordion key={group.title} title={group.title} collapsed={collapsed && !mobile} storageKey={group.title}>
              <div className={cn("flex flex-col gap-[4px]", collapsed && !mobile ? "items-center w-full" : "w-full")}>
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
                          "relative flex items-center transition-all duration-150 group shrink-0 cursor-pointer",
                          collapsed && !mobile
                            ? "h-11 w-11 justify-center rounded-xl mx-auto"
                            : "h-[36px] px-3 gap-3 rounded-lg mx-2",
                          isActive
                            ? "bg-card/80 text-foreground font-medium shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] border border-border/50 shadow-primary/10 relative overflow-hidden ring-1 ring-primary/5"
                            : item.implemented
                            ? "text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-transparent hover:shadow-sm"
                            : "text-muted-foreground/30 cursor-not-allowed pointer-events-none border border-transparent"
                        )}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-primary rounded-r-full shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                        )}
                        <item.icon className={cn(collapsed && !mobile ? "h-5 w-5" : "h-5 w-5 shrink-0 transition-colors duration-150", isActive ? "text-primary ml-0.5 drop-shadow-[0_0_8px_rgba(var(--primary),0.3)]" : "text-muted-foreground/70 group-hover:text-foreground/80")} strokeWidth={isActive ? 2.5 : 2} />
                        {(!collapsed || mobile) && (
                          <span className={cn("text-[13px] truncate transition-colors duration-150", isActive ? "font-semibold" : "font-medium")}>{item.label}</span>
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
          </div>
          {(!collapsed || mobile) ? (
            <div className="mt-2 flex-1 flex flex-col min-h-0">
              <div className="px-5 mb-2 shrink-0">
                <div className="h-[1px] w-full bg-border/40" />
              </div>
              <div className="px-4 py-1 flex items-center justify-between mb-1 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                  Conversations
                </span>
              </div>
              <ConversationSidebar collapsed={false} />
            </div>
          ) : (
            <div className="mt-3 flex-1 flex flex-col min-h-0 w-full items-center">
              <div className="w-8 h-[1px] bg-border/60 mb-2 shrink-0" />
              <ConversationSidebar collapsed />
            </div>
          )}
      </div>

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
            <AppButton
              variant={pathname === `/dashboard/mentors/${mentor.id}/settings` ? "secondary" : "ghost"}
              size={collapsed && !mobile ? "icon" : "default"}
              isLoading={isNavigatingSettings}
              onClick={() => {
                startNavigatingSettings(() => {
                  router.push(`/dashboard/mentors/${mentor.id}/settings`);
                });
              }}
              className={cn(
                "w-full justify-start",
                collapsed && !mobile ? "h-11 w-11 justify-center rounded-xl mx-auto p-0" : "h-[40px] px-4 gap-3 rounded-xl mx-1",
                pathname === `/dashboard/mentors/${mentor.id}/settings` && "border-primary/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_2px_8px_rgba(16,185,129,0.1)] ring-1 ring-primary/10"
              )}
            >
              {!isNavigatingSettings && (
                <Settings 
                  className={cn(
                    "transition-transform duration-150 group-hover:rotate-45", 
                    collapsed && !mobile ? "h-5 w-5" : "h-5 w-5 shrink-0", 
                    pathname === `/dashboard/mentors/${mentor.id}/settings` ? "text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.3)]" : ""
                  )} 
                  strokeWidth={pathname === `/dashboard/mentors/${mentor.id}/settings` ? 2.5 : 2} 
                />
              )}
              {(!collapsed || mobile) && (
                <span className="text-[13.5px] truncate">Settings</span>
              )}
            </AppButton>
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
