"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Brain, Sparkles, Clock, Target } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { MentorStats } from "@/types/mentor";

interface MemoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats?: MentorStats;
}

export function MemoryDrawer({ open, onOpenChange, stats }: MemoryDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0 border-l border-white/5 bg-background/95 backdrop-blur-2xl">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 pb-4 border-b border-white/5 shrink-0 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Brain className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <SheetTitle className="text-lg">Cognitive Memory</SheetTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Learned preferences and contextual knowledge</p>
              </div>
            </div>
          </SheetHeader>
          
          <ScrollArea className="flex-1 min-h-0" data-lenis-prevent="true">
            <div className="p-6 space-y-8">
              {/* Core Preferences */}
              <div className="space-y-4">
                <h4 className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400/70" />
                  Learned Preferences
                </h4>
                <div className="grid gap-3">
                  <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <p className="text-sm text-foreground/90 leading-relaxed">Prefers visual explanations and code examples over theoretical concepts.</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <p className="text-sm text-foreground/90 leading-relaxed">Currently focused on React Performance and Server Components.</p>
                  </div>
                </div>
              </div>

              {/* Recent Context */}
              <div className="space-y-4">
                <h4 className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400/70" />
                  Recent Context
                </h4>
                <div className="relative pl-4 border-l-2 border-white/10 space-y-6">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-blue-400" />
                    <p className="text-sm font-medium text-foreground">Discussed Virtualization</p>
                    <p className="text-xs text-muted-foreground mt-1">Explored @tanstack/react-virtual for large list rendering.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-white/20" />
                    <p className="text-sm font-medium text-foreground">Resolved Dropdown Hydration</p>
                    <p className="text-xs text-muted-foreground mt-1">Fixed nesting button hydration errors with Shadcn and Base UI.</p>
                  </div>
                </div>
              </div>

              {/* Current Goals */}
              <div className="space-y-4">
                <h4 className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Target className="h-4 w-4 text-orange-400/70" />
                  Active Focus
                </h4>
                <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/5">
                  <p className="text-sm font-medium text-orange-200">{stats?.currentTopic || "No active topic"}</p>
                  <p className="text-xs text-orange-200/70 mt-1">Difficulty: {stats?.progressPercent && stats.progressPercent > 50 ? "Advanced" : "Intermediate"}</p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
