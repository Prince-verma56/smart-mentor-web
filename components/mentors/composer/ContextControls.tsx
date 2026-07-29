import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Globe, Library, Brain, Map, Folder } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface ContextState {
  webSearch: boolean;
  knowledgeBase: boolean;
  memory: boolean;
  roadmap: boolean;
  files: boolean;
}

interface ContextControlsProps {
  state: ContextState;
  onChange: (newState: ContextState) => void;
  disabled?: boolean;
}

export function ContextControls({ state, onChange, disabled }: ContextControlsProps) {
  const toggle = (key: keyof ContextState) => {
    if (disabled) return;
    onChange({ ...state, [key]: !state[key] });
  };

  const controls = [
    { key: "memory", label: "Memory", icon: Brain, color: "text-purple-500" },
    { key: "knowledgeBase", label: "Knowledge", icon: Library, color: "text-blue-500" },
    { key: "webSearch", label: "Web Search", icon: Globe, color: "text-emerald-500" },
    { key: "roadmap", label: "Roadmap", icon: Map, color: "text-orange-500" },
    { key: "files", label: "Files", icon: Folder, color: "text-indigo-500" },
  ] as const;

  return (
    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
      <TooltipProvider>
        {controls.map((ctrl) => {
          const isActive = state[ctrl.key as keyof ContextState];
          const Icon = ctrl.icon;
          return (
            <Tooltip key={ctrl.key}>
              <TooltipTrigger>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => toggle(ctrl.key as keyof ContextState)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-300 border border-transparent whitespace-nowrap",
                    isActive 
                      ? "bg-muted shadow-sm border-border/40 text-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5 transition-colors", isActive ? ctrl.color : "text-muted-foreground/70")} />
                  {ctrl.label}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Toggle {ctrl.label} Context
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
}
