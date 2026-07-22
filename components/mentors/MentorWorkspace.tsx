"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, PanelRight } from "lucide-react";
import { MentorSidebar } from "./MentorSidebar";
import { MentorHeader } from "./MentorHeader";
import { ConversationPanel } from "./ConversationPanel";
import { ResourcePanel } from "./ResourcePanel";
import { ProgressCard } from "./ProgressCard";
import { RoadmapCard } from "./RoadmapCard";
import type { Mentor, MentorStats } from "@/types/mentor";
import type { MentorRoadmap } from "@/types/roadmap";

interface MentorWorkspaceProps {
  mentor: Mentor;
  stats: MentorStats;
  roadmap?: MentorRoadmap;
  view?: "conversation" | "settings";
  children?: React.ReactNode;
}

export function MentorWorkspace({ mentor, stats, roadmap, view = "conversation", children }: MentorWorkspaceProps) {
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Top header */}
      <div className="flex items-center gap-2">
        {/* Mobile: left sidebar trigger */}
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8 ml-2 mt-1">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Open sidebar</span>
              </Button>
            }
          />
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Mentor Navigation</SheetTitle>
            </SheetHeader>
            <MentorSidebar mentor={mentor} />
          </SheetContent>
        </Sheet>

        <div className="flex-1">
          <MentorHeader mentor={mentor} />
        </div>

        {/* Mobile: right panel trigger */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-8 w-8 mr-2 mt-1"
          onClick={() => setRightPanelOpen(true)}
        >
          <PanelRight className="h-4 w-4" />
          <span className="sr-only">Open resources</span>
        </Button>
      </div>

      <Separator />

      {/* Three-column body */}
      <div className="flex flex-1 overflow-hidden bg-muted/20">
        {/* Left sidebar — desktop only */}
        <div className="hidden lg:flex w-56 xl:w-64 shrink-0 flex-col border-r overflow-hidden bg-background">
          <MentorSidebar mentor={mentor} />
        </div>

        {/* Center: dynamic view */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {view === "conversation" ? (
            <ConversationPanel mentor={mentor} stats={stats} />
          ) : (
            <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-background m-4 rounded-xl border shadow-sm">
              {children}
            </div>
          )}
        </div>

        {/* Right sidebar — desktop only */}
        <div className="hidden lg:flex w-72 xl:w-80 shrink-0 flex-col border-l overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              <ProgressCard stats={stats} />
              {roadmap ? (
                <RoadmapCard roadmap={roadmap} />
              ) : (
                <div className="p-4 border rounded-xl bg-background/50 animate-pulse text-center space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded mx-auto"></div>
                  <p className="text-xs text-muted-foreground">AI is generating your custom roadmap...</p>
                </div>
              )}
              <ResourcePanel mentorId={mentor.id} />
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Mobile right panel as Sheet */}
      <Sheet open={rightPanelOpen} onOpenChange={setRightPanelOpen}>
        <SheetContent side="right" className="w-80 p-0">
          <SheetHeader className="px-4 pt-4 pb-2">
            <SheetTitle className="text-sm">Resources & Progress</SheetTitle>
          </SheetHeader>
          <Separator />
          <div className="p-4 space-y-4 overflow-y-auto h-full pb-20">
            <ProgressCard stats={stats} />
            {roadmap ? (
              <RoadmapCard roadmap={roadmap} />
            ) : (
              <div className="p-4 border rounded-xl bg-background/50 animate-pulse text-center space-y-2">
                <div className="h-4 w-3/4 bg-muted rounded mx-auto"></div>
                <p className="text-xs text-muted-foreground">AI is generating your custom roadmap...</p>
              </div>
            )}
            <ResourcePanel mentorId={mentor.id} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
