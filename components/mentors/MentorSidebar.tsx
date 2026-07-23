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
  const { createNewSession, sessions, activeSessionId, setActiveSession } = useConversation();

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
      {/* ── Top Header & Mentor Card ─────────────────────── */}
      <div className="flex flex-col shrink-0">
        <div className={cn("flex items-center h-12", collapsed && !mobile ? "justify-center" : "px-4")}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className={cn("text-muted-foreground hover:text-foreground shrink-0", collapsed && !mobile ? "" : "-ml-2")}
            title="Toggle Sidebar"
          >
            <Menu className="h-4 w-4" />
          </Button>
          {(!collapsed || mobile) && (
            <div className="flex items-center flex-1 min-w-0 ml-2 overflow-hidden">
               <Avatar className="h-6 w-6 shrink-0 ring-1 ring-border shadow-sm">
                {mentor.avatarUrl ? (
                  <img src={mentor.avatarUrl} alt={mentor.name} className="object-cover" />
                ) : null}
                <AvatarFallback
                  style={{ backgroundColor: mentor.avatarColor }}
                  className="text-white font-semibold text-[10px]"
                >
                  {getInitials(mentor.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col ml-2 min-w-0">
                 <div className="flex items-center gap-1.5">
                   <span className="font-semibold text-[13px] leading-none truncate text-foreground">{mentor.name}</span>
                   <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-primary shadow-sm shadow-primary/50 animate-pulse" />
                 </div>
              </div>
            </div>
          )}
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
                            ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20"
                            : item.implemented
                            ? "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                            : "text-muted-foreground/30 cursor-not-allowed pointer-events-none"
                        )}
                      >
                        <item.icon className={cn(collapsed && !mobile ? "h-5 w-5" : "h-4 w-4 shrink-0", isActive && "text-primary-foreground")} strokeWidth={isActive ? 2.5 : 2} />
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

          {/* Recent Chats Accordion */}
          <SidebarAccordion title="Recent Chats" collapsed={collapsed && !mobile} storageKey="Chats">
            <div className={cn("flex flex-col", collapsed && !mobile ? "items-center w-full gap-2 mt-2" : "w-full px-1")}>
              {/* Tooling when expanded */}
              {(!collapsed || mobile) && (
                <div className="flex flex-col gap-2 mb-2 px-2 mt-1">
                  <div className="flex items-center gap-1">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                      <Input 
                        placeholder="Search chats..." 
                        className="h-7 pl-7 text-[12px] bg-muted/30 border-transparent hover:bg-muted/50 transition-colors focus-visible:ring-1 rounded-md"
                      />
                    </div>
                    <Button
                      onClick={createNewSession}
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-md shrink-0 border border-transparent hover:bg-muted"
                      title="New Chat"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Chat list mapped */}
              {sessions.map((session) => {
                function SessionItem() {
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
                      onClick={() => setActiveSession(session.id)}
                      className={cn(
                        "relative flex items-center transition-all duration-200 group text-left",
                        collapsed && !mobile
                          ? "h-11 w-11 justify-center rounded-xl mx-auto"
                          : "h-[34px] px-3 gap-2.5 rounded-md mx-1",
                        activeSessionId === session.id
                          ? "bg-muted/80 text-foreground font-medium"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                      key={session.id}
                    >
                      <MessageCircle className={cn(collapsed && !mobile ? "h-5 w-5" : "h-3.5 w-3.5 shrink-0")} strokeWidth={activeSessionId === session.id ? 2.5 : 2} />
                      {(!collapsed || mobile) && (
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-[12px] truncate">{session.title || "New Conversation"}</span>
                        </div>
                      )}
                    </button>
                  );

                  if (!collapsed || mobile) return content;

                  return (
                    <div ref={wrapperRef} key={session.id}>
                      <Tooltip>
                        <TooltipTrigger render={content} />
                        <TooltipContent side={tooltipSide} align="center">
                          {session.title || "Conversation"}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  );
                }

                return <SessionItem />;
              })}
            </div>
          </SidebarAccordion>

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
                  : "h-[34px] px-3 gap-2.5 rounded-md",
                pathname === `/dashboard/mentors/${mentor.id}/settings`
                  ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
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
