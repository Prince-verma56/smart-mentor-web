"use client";

import { useState } from "react";
import { Square, Loader2, AudioLines } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Mentor } from "@/types/mentor";
import { cn } from "@/lib/utils";
import { VoiceWorkspace } from "./voice/VoiceWorkspace";
import { createPortal } from "react-dom";

interface VapiVoiceButtonProps {
  mentor: Mentor;
  sessionId?: string;
  isInputIcon?: boolean;
}

export function VapiVoiceButton({ mentor, sessionId, isInputIcon = false }: VapiVoiceButtonProps) {
  const [showWorkspace, setShowWorkspace] = useState(false);
  
  // A small state just to pretend it's loading for a split second for smooth UX
  const [isOpening, setIsOpening] = useState(false);

  const handleVoiceClick = () => {
    setIsOpening(true);
    // Tiny delay to let the button show active state before portal covers screen
    setTimeout(() => {
      setShowWorkspace(true);
      setIsOpening(false);
    }, 150);
  };

  const IconComponent = isOpening ? Loader2 : showWorkspace ? Square : AudioLines;

  return (
    <>
      <Button 
        type="button"
        variant={isInputIcon ? "ghost" : (showWorkspace ? "default" : "ghost")} 
        size={isInputIcon ? "icon" : "sm"} 
        onClick={handleVoiceClick}
        disabled={isOpening || showWorkspace}
        title="Speak with AI Mentor"
        className={cn(
          "relative transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] rounded-lg flex items-center justify-center overflow-hidden",
          isInputIcon
            ? "h-10 w-10 text-emerald-500/80 bg-emerald-500/10 hover:text-emerald-400 hover:bg-emerald-500/20 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] border border-emerald-500/20 hover:border-emerald-500/40 hover:scale-[1.15] active:scale-[0.95]"
            : `h-7 text-[11px] gap-1.5 shrink-0 rounded-full ${showWorkspace ? 'bg-red-500 hover:bg-red-600 text-white' : 'text-muted-foreground hover:text-foreground'}`,
          isOpening && "opacity-70 cursor-wait animate-pulse",
          showWorkspace && isInputIcon && "bg-red-500/15 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:bg-red-500/25 scale-[1.15]"
        )}
      >
        <IconComponent className={cn(
          isInputIcon ? "h-5 w-5 relative z-10" : "h-3.5 w-3.5",
          isOpening && "animate-spin",
          showWorkspace && !isInputIcon && "fill-current"
        )} />
        {!isInputIcon && (showWorkspace ? "End Voice" : "Voice")}
        {isInputIcon && !showWorkspace && !isOpening && (
          <span className="absolute inset-0 rounded-lg bg-emerald-500/5 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)] opacity-50 group-hover:opacity-100 transition-opacity" />
        )}
        {isInputIcon && showWorkspace && (
          <span className="absolute inset-0 rounded-lg bg-red-500/20 animate-ping opacity-75" style={{ animationDuration: '2s' }} />
        )}
      </Button>

      {showWorkspace && typeof document !== "undefined" && createPortal(
        <VoiceWorkspace 
          mentor={mentor} 
          sessionId={sessionId} 
          onClose={() => setShowWorkspace(false)} 
        />,
        document.body
      )}
    </>
  );
}
