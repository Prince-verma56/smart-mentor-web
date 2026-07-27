"use client";

import { useState, use, Suspense, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import SmoothTab from "@/components/kokonutui/smooth-tab";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  PanelLeft, 
  PanelRight, 
  MessageSquare, 
  Menu,
  Target,
  BookOpen,
  Folder
} from "lucide-react";
import { MentorSidebar } from "./MentorSidebar";
import { MentorHeader } from "./MentorHeader";
import { ConversationPanel } from "./ConversationPanel";
import { ResourcePanel } from "./ResourcePanel";
import { RoadmapSidebar } from "@/components/roadmap/RoadmapSidebar";
import { VisualAnalytics } from "./VisualAnalytics";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import type { Mentor, MentorStats } from "@/types/mentor";
import type { MentorRoadmap } from "@/types/roadmap";
import { ConversationProvider } from "@/contexts/ConversationContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useRealtimeRoadmap } from "@/hooks/useRealtimeRoadmap";
import { useRealtimeStats } from "@/hooks/useRealtimeStats";

interface MentorWorkspaceProps {
  mentor: Mentor;
  stats: MentorStats;
  roadmap?: MentorRoadmap;
  roadmapPromise?: Promise<MentorRoadmap | null>;
  view?: "conversation" | "settings";
  children?: React.ReactNode;
}

// ─── Roadmap Loading Skeletons ─────────────────────────────────────────────────

function RoadmapPlaceholder() {
  return (
    <div className="rounded-xl border border-dashed border-muted-foreground/20 p-5 space-y-3 text-center mt-2">
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
        <span className="text-primary text-xs">✦</span>
      </div>
      <div className="space-y-1.5">
        <div className="h-2 w-2/3 bg-muted rounded-full mx-auto animate-pulse" />
        <div className="h-2 w-1/2 bg-muted rounded-full mx-auto animate-pulse" />
        <div className="h-2 w-3/5 bg-muted rounded-full mx-auto animate-pulse" />
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        AI is generating your personalised roadmap…
      </p>
    </div>
  );
}

function RoadmapErrorPlaceholder() {
  const router = useRouter();
  return (
    <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 space-y-3 text-center mt-2">
      <div className="space-y-1.5">
        <p className="text-[11px] text-destructive font-medium leading-relaxed">
          Failed to generate roadmap.
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs w-full"
        onClick={() => router.refresh()}
      >
        Try Again
      </Button>
    </div>
  );
}

function RoadmapWrapper({ promise }: { promise: Promise<MentorRoadmap | null> }) {
  const roadmap = use(promise);
  return roadmap ? <RoadmapSidebar roadmap={roadmap} /> : <RoadmapErrorPlaceholder />;
}

// ─── Right Panel — consumes live roadmap & stats ───────────────────────────────

function RightPanelContent({
  stats,
  roadmap,
  roadmapPromise,
  mentorId,
  onCollapse,
}: {
  stats: MentorStats;
  roadmap?: MentorRoadmap;
  roadmapPromise?: Promise<MentorRoadmap | null>;
  mentorId: string;
  onCollapse?: () => void;
}) {
  // Live roadmap subscription — patches state from Supabase Realtime
  const { roadmap: liveRoadmap } = useRealtimeRoadmap(mentorId, roadmap);

  // Derive live stats from live roadmap
  const liveStats = useRealtimeStats(mentorId, liveRoadmap, stats);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <SmoothTab
        defaultTabId="roadmap"
        wrapperClassName="h-full gap-0 overflow-hidden"
        className="mx-3 mt-3 mb-2 shrink-0 flex bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] rounded-[20px] p-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
        activeColor="bg-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] ring-1 ring-white/10 rounded-2xl"
        selectedTextColor="text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
        beforeTabs={
          onCollapse ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCollapse}
              className="h-8 w-8 shrink-0 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              title="Collapse Sidebar"
            >
              <PanelRight className="h-4 w-4" />
            </Button>
          ) : undefined
        }
        items={[
          {
            id: "progress",
            title: "Stats",
            color: "bg-primary/10",
            cardContent: (
              <ScrollArea className="h-full min-h-0" data-lenis-prevent="true">
                <div className="p-3">
                  <VisualAnalytics stats={liveStats} />
                </div>
              </ScrollArea>
            )
          },
          {
            id: "roadmap",
            title: "Roadmap",
            color: "bg-primary/10",
            cardContent: (
              <ScrollArea className="h-full min-h-0" data-lenis-prevent="true">
                <div className="p-3">
                  {roadmapPromise ? (
                    <Suspense fallback={<RoadmapPlaceholder />}>
                      <RoadmapWrapper promise={roadmapPromise} />
                    </Suspense>
                  ) : liveRoadmap ? (
                    <RoadmapSidebar roadmap={liveRoadmap} />
                  ) : (
                    <RoadmapPlaceholder />
                  )}
                </div>
              </ScrollArea>
            )
          },
          {
            id: "resources",
            title: "Files",
            color: "bg-primary/10",
            cardContent: (
              <ScrollArea className="h-full min-h-0" data-lenis-prevent="true">
                <div className="p-3">
                  <ResourcePanel mentorId={mentorId} />
                </div>
              </ScrollArea>
            )
          }
        ]}
      />
    </div>
  );
}

// ─── Async Roadmap Resolver (for Suspense wrapper) ────────────────────────────

function AsyncRoadmapRightPanel({
  stats,
  roadmapPromise,
  mentorId,
  onCollapse,
}: {
  stats: MentorStats;
  roadmapPromise: Promise<MentorRoadmap | null>;
  mentorId: string;
  onCollapse?: () => void;
}) {
  const resolvedRoadmap = use(roadmapPromise);
  return (
    <RightPanelContent
      stats={stats}
      roadmap={resolvedRoadmap ?? undefined}
      mentorId={mentorId}
      onCollapse={onCollapse}
    />
  );
}

// ─── Main Workspace ───────────────────────────────────────────────────────────

export function MentorWorkspace({
  mentor,
  stats,
  roadmap,
  roadmapPromise,
  view = "conversation",
  children,
}: MentorWorkspaceProps) {
  const [mobileLeftOpen, setMobileLeftOpen] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  // ConversationProvider wraps everything — single source of truth for conversations
  return (
    <ConversationProvider mentorId={mentor.id}>
      <div className="w-full h-full overflow-hidden bg-background">

        {/* ════════════════════════════════════════════════
            DESKTOP 3-COLUMN LAYOUT (lg and above)
        ════════════════════════════════════════════════ */}
        <div className="hidden lg:flex h-full w-full">
          {/* ── LEFT SIDEBAR ─────────────────────────── */}
          <motion.div 
            animate={{ width: leftCollapsed ? 72 : 280 }}
            className="h-full overflow-hidden flex flex-col border-r bg-background shrink-0 relative"
          >
            <MentorSidebar 
              mentor={mentor} 
              collapsed={leftCollapsed} 
              onToggleCollapse={() => setLeftCollapsed(p => !p)} 
            />
          </motion.div>

          {/* ── CENTER + RIGHT (Flexible Workspace) ────────────────── */}
          <div className="flex-1 min-w-0 h-full flex overflow-hidden">
            
            {/* Center Panel */}
            <motion.div layout className="flex-1 min-w-0 flex flex-col bg-background relative overflow-hidden h-full">
              <MentorHeader mentor={mentor} stats={stats} />
              <div className="flex-1 min-h-0 overflow-hidden relative">
                <div className={cn("absolute inset-0 flex flex-col transition-opacity duration-200", view === "conversation" ? "z-10 opacity-100 pointer-events-auto delay-100" : "z-0 opacity-0 pointer-events-none")}>
                  <ConversationPanel mentor={mentor} stats={stats} />
                </div>
                <div className={cn("absolute inset-0 flex flex-col transition-opacity duration-200", view !== "conversation" ? "z-10 opacity-100 pointer-events-auto delay-100" : "z-0 opacity-0 pointer-events-none")}>
                  <ScrollArea className="flex-1 h-full min-h-0 bg-background" data-lenis-prevent="true">
                    <div className="p-6 md:p-10 min-h-full">
                      {children}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </motion.div>

            {/* Right Sidebar */}
            <motion.div 
              layout 
              initial={false}
              animate={{ width: rightCollapsed ? 56 : 360 }}
              className="shrink-0 flex flex-col border-l bg-background relative overflow-hidden h-full"
            >
              {/* When Collapsed: show the rail icons */}
              <div 
                className={cn(
                  "absolute inset-0 flex flex-col items-center py-3 gap-4 transition-opacity duration-300",
                  rightCollapsed ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRightCollapsed(false)}
                  className="h-8 w-8 rounded-sm shadow-sm bg-background text-muted-foreground hover:text-foreground border mb-2"
                  title="Expand Sidebar"
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
                
                <TooltipProvider delay={0}>
                  <Tooltip>
                    <TooltipTrigger 
                      render={
                        <button className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors" onClick={() => setRightCollapsed(false)}>
                          <Target className="h-5 w-5" />
                        </button>
                      } 
                    />
                    <TooltipContent side="left">Stats</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger 
                      render={
                        <button className="p-2 rounded-md hover:bg-muted text-primary bg-primary/10 transition-colors" onClick={() => setRightCollapsed(false)}>
                          <BookOpen className="h-5 w-5" />
                        </button>
                      }
                    />
                    <TooltipContent side="left">Roadmap</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger 
                      render={
                        <button className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors" onClick={() => setRightCollapsed(false)}>
                          <Folder className="h-5 w-5" />
                        </button>
                      } 
                    />
                    <TooltipContent side="left">Files</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* When Expanded: show the full roadmap */}
              <div 
                className={cn(
                  "absolute inset-0 flex flex-col transition-opacity duration-300 min-w-[360px]",
                  !rightCollapsed ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
              >

                <div className="h-full overflow-hidden flex flex-col">
                  {roadmapPromise ? (
                    <Suspense fallback={<RoadmapPlaceholder />}>
                      <AsyncRoadmapRightPanel
                        stats={stats}
                        roadmapPromise={roadmapPromise}
                        mentorId={mentor.id}
                        onCollapse={() => setRightCollapsed(true)}
                      />
                    </Suspense>
                  ) : (
                    <RightPanelContent 
                      stats={stats} 
                      roadmap={roadmap} 
                      mentorId={mentor.id} 
                      onCollapse={() => setRightCollapsed(true)}
                    />
                  )}
                </div>
              </div>
            </motion.div>

          </div>
        </div>



        {/* ════════════════════════════════════════════════
            MOBILE LAYOUT  (<lg)
            Full-width chat + Sheet overlays for sidebars
        ════════════════════════════════════════════════ */}
        <div className="flex lg:hidden flex-col h-full overflow-hidden">
          {/* Mobile header bar */}
          <div className="flex items-center h-12 px-2 gap-1 border-b bg-background shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setMobileLeftOpen(true)}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0 px-2">
              <p className="text-sm font-semibold truncate">{mentor.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {mentor.subject}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setMobileRightOpen(true)}
            >
              <PanelRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile main content */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col relative">
            <div className={cn("absolute inset-0 flex flex-col transition-opacity duration-200", view === "conversation" ? "z-10 opacity-100 pointer-events-auto delay-100" : "z-0 opacity-0 pointer-events-none")}>
              <ConversationPanel mentor={mentor} stats={stats} />
            </div>
            <div className={cn("absolute inset-0 flex flex-col transition-opacity duration-200", view !== "conversation" ? "z-10 opacity-100 pointer-events-auto delay-100" : "z-0 opacity-0 pointer-events-none")}>
              <ScrollArea className="flex-1 h-full min-h-0 bg-background" data-lenis-prevent="true">
                <div className="p-6 min-h-full">
                  {children}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* ── Mobile Sheets ────────────────────────────── */}
        <Sheet open={mobileLeftOpen} onOpenChange={setMobileLeftOpen}>
          <SheetContent side="left" className="w-[85vw] max-w-[400px] p-0 border-r-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <MentorSidebar mentor={mentor} mobile />
          </SheetContent>
        </Sheet>

        <Sheet open={mobileRightOpen} onOpenChange={setMobileRightOpen}>
          <SheetContent side="bottom" className="h-[90vh] p-0 rounded-t-2xl">
            <SheetHeader className="sr-only">
              <SheetTitle>Resources</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col h-full pt-4">
              <div className="w-12 h-1.5 bg-muted mx-auto rounded-full mb-2 shrink-0" />
              <RightPanelContent
                stats={stats}
                roadmap={roadmap}
                mentorId={mentor.id}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </ConversationProvider>
  );
}
