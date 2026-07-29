import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronDown, Sparkles, Zap, Brain, Scale } from "lucide-react";

export type ModelType = "auto" | "fast" | "balanced" | "deep";

const MODEL_CONFIGS: Record<ModelType, { name: string; description: string; icon: React.ElementType }> = {
  auto: {
    name: "Auto",
    description: "Standard conversational model",
    icon: Sparkles
  },
  fast: {
    name: "Fast",
    description: "Low latency, quick answers",
    icon: Zap
  },
  balanced: {
    name: "Balanced",
    description: "Optimal balance of speed and reasoning",
    icon: Scale
  },
  deep: {
    name: "Deep",
    description: "Complex problem solving",
    icon: Brain
  }
};

interface ModelSelectorProps {
  currentModel: ModelType;
  onModelChange: (model: ModelType) => void;
  disabled?: boolean;
}

export function ModelSelector({ currentModel, onModelChange, disabled }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const activeDef = MODEL_CONFIGS[currentModel] || MODEL_CONFIGS.auto;
  const ActiveIcon = activeDef.icon;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 h-8 pl-3 pr-2.5 rounded-full border border-border/40 transition-all duration-300",
          "bg-muted/30 hover:bg-muted text-sm font-medium hover:border-border/60 hover:shadow-sm",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && "bg-muted shadow-sm border-border/80 ring-1 ring-border"
        )}
      >
        <ActiveIcon className="h-4 w-4 text-primary" />
        <span>{activeDef.name}</span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 w-60 bg-card/95 backdrop-blur-xl border shadow-2xl rounded-2xl p-1.5 z-50 overflow-hidden"
          >
            <div className="text-xs font-semibold text-muted-foreground px-3 py-2 uppercase tracking-wider">
              Model
            </div>
            <div className="flex flex-col gap-0.5">
              {(Object.entries(MODEL_CONFIGS) as [ModelType, typeof MODEL_CONFIGS[ModelType]][]).map(([id, config]) => {
                const Icon = config.icon;
                const isActive = id === currentModel;
                
                return (
                  <button
                    key={id}
                    onClick={() => {
                      onModelChange(id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex items-start gap-3 w-full p-2.5 rounded-xl text-left transition-colors",
                      isActive ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{config.name}</span>
                      <span className={cn("text-xs", isActive ? "text-primary/70" : "text-muted-foreground")}>
                        {config.description}
                      </span>
                    </div>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-primary self-center" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
