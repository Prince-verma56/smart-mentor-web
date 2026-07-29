import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CapabilityRegistry, Capability } from "@/lib/capabilities/CapabilityRegistry";
import { cn } from "@/lib/utils";
import { ChevronDown, Sparkles, Zap, Brain, Code2, Eye, FileText, Globe, ScanText, Mic, Video } from "lucide-react";

const IconMap: Record<string, React.ElementType> = {
  Sparkles,
  Zap,
  Brain,
  Code2,
  Eye,
  FileText,
  Globe,
  ScanText,
  Mic,
  Video
};

interface CapabilitySelectorProps {
  currentCapability: Capability;
  onCapabilityChange: (cap: Capability) => void;
  disabled?: boolean;
}

export function CapabilitySelector({ currentCapability, onCapabilityChange, disabled }: CapabilitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const activeDef = CapabilityRegistry[currentCapability] || CapabilityRegistry.chat;
  const ActiveIcon = IconMap[activeDef.icon] || Sparkles;

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
          "flex items-center gap-1.5 h-10 pl-3 pr-2.5 rounded-xl border border-border/40 transition-all duration-300",
          "bg-muted/30 hover:bg-muted text-sm font-medium hover:border-border/60 hover:shadow-sm",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && "bg-muted shadow-sm border-border/80 ring-1 ring-border"
        )}
      >
        <ActiveIcon className="h-4 w-4 text-emerald-500" />
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
            className="absolute bottom-full left-0 mb-2 w-64 bg-card/95 backdrop-blur-xl border shadow-2xl rounded-2xl p-1.5 z-50 overflow-hidden"
          >
            <div className="text-xs font-semibold text-muted-foreground px-3 py-2 uppercase tracking-wider">
              AI Capabilities
            </div>
            <div className="max-h-[300px] overflow-y-auto no-scrollbar flex flex-col gap-0.5">
              {(Object.values(CapabilityRegistry) as any[]).map((cap) => {
                const Icon = IconMap[cap.icon] || Sparkles;
                const isActive = cap.id === currentCapability;
                
                return (
                  <button
                    key={cap.id}
                    onClick={() => {
                      onCapabilityChange(cap.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex items-start gap-3 w-full p-2.5 rounded-xl text-left transition-colors",
                      isActive ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{cap.name}</span>
                      <span className={cn("text-xs", isActive ? "text-primary/70" : "text-muted-foreground")}>
                        {cap.description}
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
