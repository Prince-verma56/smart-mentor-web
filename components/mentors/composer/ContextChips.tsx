import { cn } from "@/lib/utils";
import { Globe, Library, Brain, Map, Folder, Zap } from "lucide-react";
import { ContextState } from "./ContextControls";
import { Capability } from "@/lib/capabilities/CapabilityRegistry";

interface ContextChipsProps {
  contextState: ContextState;
  activeCapability: Capability;
}

export function ContextChips({ contextState, activeCapability }: ContextChipsProps) {
  // In a real app, these counts would come from the backend or local state
  const mockCounts = {
    memory: 5,
    knowledge: 12,
    files: 3,
  };

  const activeChips = [];

  if (contextState.memory) activeChips.push({ id: "memory", label: `Memory (${mockCounts.memory})`, icon: Brain, color: "text-purple-500" });
  if (contextState.knowledgeBase) activeChips.push({ id: "knowledge", label: `Knowledge (${mockCounts.knowledge})`, icon: Library, color: "text-blue-500" });
  if (contextState.files) activeChips.push({ id: "files", label: `Files (${mockCounts.files})`, icon: Folder, color: "text-indigo-500" });
  if (contextState.webSearch) activeChips.push({ id: "web", label: "Web", icon: Globe, color: "text-emerald-500" });
  if (contextState.roadmap) activeChips.push({ id: "roadmap", label: "Roadmap", icon: Map, color: "text-orange-500" });

  if (activeChips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-2 px-1">
      {activeChips.map(chip => {
        const Icon = chip.icon;
        return (
          <div key={chip.id} className="flex items-center gap-1 bg-muted/40 border border-border/50 rounded-md px-2 py-0.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] text-[11px] font-medium text-muted-foreground/80 cursor-default">
            <Icon className={cn("h-3 w-3", chip.color)} />
            <span>{chip.label}</span>
          </div>
        );
      })}
    </div>
  );
}
