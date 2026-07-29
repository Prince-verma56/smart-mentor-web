import { cn } from "@/lib/utils";
import { Globe, Library, Brain, Map, Folder, X } from "lucide-react";
import { ContextState } from "./PlusMenu";

interface ContextChipsProps {
  contextState: ContextState;
  onRemove: (key: keyof ContextState) => void;
}

export function ContextChips({ contextState, onRemove }: ContextChipsProps) {
  // In a real app, these counts would come from the backend or local state
  const mockCounts = {
    memory: 5,
    knowledge: 12,
    files: 3,
  };

  const activeChips = [];

  if (contextState.webSearch) activeChips.push({ id: "webSearch" as const, label: "Web Search", icon: Globe, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" });
  if (contextState.memory) activeChips.push({ id: "memory" as const, label: `Memory (${mockCounts.memory})`, icon: Brain, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" });
  if (contextState.knowledge) activeChips.push({ id: "knowledge" as const, label: `Knowledge (${mockCounts.knowledge})`, icon: Library, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" });
  if (contextState.files) activeChips.push({ id: "files" as const, label: `Files (${mockCounts.files})`, icon: Folder, color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" });
  if (contextState.roadmap) activeChips.push({ id: "roadmap" as const, label: "Roadmap", icon: Map, color: "text-orange-500 bg-orange-500/10 border-orange-500/20" });

  if (activeChips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-2 px-1">
      {activeChips.map(chip => {
        const Icon = chip.icon;
        return (
          <div key={chip.id} className={cn(
            "group flex items-center gap-1.5 border rounded-full pl-2.5 pr-1.5 py-1 shadow-sm transition-all",
            chip.color
          )}>
            <Icon className="h-3.5 w-3.5 opacity-80" />
            <span className="text-[12px] font-medium leading-none">{chip.label}</span>
            <button 
              onClick={() => onRemove(chip.id)}
              className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 transition-colors ml-0.5"
            >
              <X className="h-3 w-3 opacity-70" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
