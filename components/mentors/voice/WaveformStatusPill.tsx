import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ConversationState } from "./useVoiceSession";
import { Loader2, Mic, Headphones, Brain, Search, Sparkles, MessageSquare, PauseCircle } from "lucide-react";

interface WaveformStatusPillProps {
  state: ConversationState;
  volume: number;
}

export function WaveformStatusPill({ state, volume }: WaveformStatusPillProps) {
  const isSpeaking = state === "speaking" || state === "recording";

  const getConfig = () => {
    switch (state) {
      case "connecting": return { text: "Connecting...", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: <Loader2 className="w-3.5 h-3.5 animate-spin" /> };
      case "listening": return { text: "Listening", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: <Mic className="w-3.5 h-3.5" /> };
      case "recording": return { text: "Recording", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> };
      case "transcribing": return { text: "Transcribing", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: <Loader2 className="w-3.5 h-3.5 animate-spin" /> };
      case "understanding": return { text: "Understanding", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", icon: <Brain className="w-3.5 h-3.5 animate-pulse" /> };
      case "searching knowledge base": return { text: "Searching KB", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: <Search className="w-3.5 h-3.5 animate-pulse" /> };
      case "thinking": return { text: "Thinking", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", icon: <Sparkles className="w-3.5 h-3.5 animate-pulse" /> };
      case "generating": return { text: "Generating", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: <MessageSquare className="w-3.5 h-3.5 animate-bounce" /> };
      case "speaking": return { text: "Speaking", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: <Headphones className="w-3.5 h-3.5" /> };
      case "waiting": return { text: "Waiting", color: "text-muted-foreground", bg: "bg-muted/50 border-white/5", icon: <PauseCircle className="w-3.5 h-3.5" /> };
      case "idle":
      default: return { text: "Ready", color: "text-muted-foreground", bg: "bg-muted/50 border-white/5", icon: null };
    }
  };

  const config = getConfig();

  // Waveform 
  const bars = 11;
  const centerIndex = Math.floor(bars / 2);

  return (
    <div className={cn("flex items-center gap-4 px-4 py-2 rounded-full transition-colors duration-500 border shadow-lg backdrop-blur-md", config.bg)}>
      {/* Mini Waveform */}
      <div className="flex items-center justify-center gap-[2px] h-6 w-16 overflow-hidden border-r border-white/10 pr-4">
        {Array.from({ length: bars }).map((_, i) => {
          const dist = Math.abs(i - centerIndex);
          const maxDist = centerIndex;
          const baseHeight = 4 + (maxDist - dist);
          const volumeImpact = Math.max(0, 1 - (dist / maxDist)) * (volume * 60);
          const finalHeight = baseHeight + volumeImpact;
          
          return (
            <motion.div
              key={i}
              className={cn("w-1 rounded-full", config.color.replace('text-', 'bg-'))}
              animate={{ 
                height: `${finalHeight}px`, 
                opacity: volume > 0.02 || isSpeaking ? 1 : 0.4 
              }}
              transition={{ type: "tween", duration: 0.1 }}
            />
          );
        })}
      </div>

      {/* State Text */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0, scale: 0.9, x: -5 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.9, x: 5 }}
          transition={{ duration: 0.2 }}
          className={cn("flex items-center gap-2", config.color)}
        >
          {config.icon}
          <span className="text-xs font-bold tracking-widest uppercase mt-[1px]">
            {config.text}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
