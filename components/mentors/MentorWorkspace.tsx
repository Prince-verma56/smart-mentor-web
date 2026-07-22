"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { PanelLeft, PanelRight } from "lucide-react";
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

function RightPanelContent({
  stats,
  roadmap,
  mentorId,
}: {
  stats: MentorStats;
  roadmap?: MentorRoadmap;
  mentorId: string;
}) {
  return (
    <Tabs defaultValue="roadmap" className="flex flex-col h-full overflow-hidden">
      <div className="px-3 pt-3 pb-2 border-b shrink-0">
        <TabsList className="w-full grid grid-cols-3 h-8">
          <TabsTrigger value="progress" className="text-xs">Stats</TabsTrigger>
          <TabsTrigger value="roadmap" className="text-xs">Roadmap</TabsTrigger>
          <TabsTrigger value="resources" className="text-xs">Files</TabsTrigger>
        </TabsList>
      </div>
      <ScrollArea className="flex-1 min-h-0" data-lenis-prevent="true">
        <div className="p-3">
          <TabsContent value="progress" className="mt-0">
            <ProgressCard stats={stats} />
          </TabsContent>
          <TabsContent value="roadmap" className="mt-0">
            {roadmap ? <RoadmapCard roadmap={roadmap} /> : <RoadmapPlaceholder />}
          </TabsContent>
          <TabsContent value="resources" className="mt-0">
            <ResourcePanel mentorId={mentorId} />
          </TabsContent>
        </div>
      </ScrollArea>
    </Tabs>
  );
}

export function MentorWorkspace({
  mentor,
  stats,
  roadmap,
  view = "conversation",
  children,
}: MentorWorkspaceProps) {
  const [mobileLeftOpen, setMobileLeftOpen] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);

  return (
    <div className="w-full h-full overflow-hidden bg-background">

      {/* ════════════════════════════════════════════════
          DESKTOP 3-COLUMN GRID  (lg and above)
          - Left  : 240px fixed sidebar
          - Center: flex-1 (all remaining space)
          - Right : 280px fixed sidebar
          CSS Grid is rock-solid — no JS, no resizing bugs
      ════════════════════════════════════════════════ */}
      <div
        className="hidden lg:grid h-full w-full"
        style={{ gridTemplateColumns: "240px 1fr 280px" }}
      >
        {/* ── LEFT SIDEBAR ─────────────────────────── */}
        <div className="h-full overflow-hidden flex flex-col border-r bg-background">
          <MentorSidebar mentor={mentor} />
        </div>

        {/* ── CENTER ───────────────────────────────── */}
        <div className="h-full overflow-hidden flex flex-col bg-background">
          <MentorHeader mentor={mentor} />
          <div className="flex-1 min-h-0 overflow-hidden">
            {view === "conversation" ? (
              <ConversationPanel mentor={mentor} stats={stats} />
            ) : (
              <div className="h-full overflow-y-auto p-6 md:p-10">{children}</div>
            )}
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ────────────────────────── */}
        <div className="h-full overflow-hidden flex flex-col border-l bg-background">
          <RightPanelContent
            stats={stats}
            roadmap={roadmap}
            mentorId={mentor.id}
          />
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
            <p className="text-[10px] text-muted-foreground">{mentor.subject}</p>
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
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {view === "conversation" ? (
            <ConversationPanel mentor={mentor} stats={stats} />
          ) : (
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          )}
        </div>
      </div>

      {/* ── Mobile Sheets ────────────────────────────── */}
      <Sheet open={mobileLeftOpen} onOpenChange={setMobileLeftOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <MentorSidebar mentor={mentor} />
        </SheetContent>
      </Sheet>

      <Sheet open={mobileRightOpen} onOpenChange={setMobileRightOpen}>
        <SheetContent side="right" className="w-80 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Resources</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full pt-8">
            <RightPanelContent
              stats={stats}
              roadmap={roadmap}
              mentorId={mentor.id}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
