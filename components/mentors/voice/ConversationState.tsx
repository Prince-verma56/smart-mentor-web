import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ConversationState } from "./useVoiceSession";
import { Loader2, Mic, Headphones, Brain, Search, Sparkles, MessageSquare, PauseCircle } from "lucide-react";

interface ConversationStateIndicatorProps {
  state: ConversationState;
}

export function ConversationStateIndicator({ state }: ConversationStateIndicatorProps) {
  const getConfig = () => {
    switch (state) {
      case "connecting": return { text: "Connecting...", color: "text-blue-400", bg: "bg-blue-500/10", icon: <Loader2 className="w-3.5 h-3.5 animate-spin" /> };
      case "listening": return { text: "Listening", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: <Mic className="w-3.5 h-3.5" /> };
      case "recording": return { text: "Recording", color: "text-red-400", bg: "bg-red-500/10", icon: <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> };
      case "transcribing": return { text: "Transcribing", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: <Loader2 className="w-3.5 h-3.5 animate-spin" /> };
      case "understanding": return { text: "Understanding", color: "text-purple-400", bg: "bg-purple-500/10", icon: <Brain className="w-3.5 h-3.5 animate-pulse" /> };
      case "searching knowledge base": return { text: "Searching KB", color: "text-amber-400", bg: "bg-amber-500/10", icon: <Search className="w-3.5 h-3.5 animate-pulse" /> };
      case "thinking": return { text: "Thinking", color: "text-purple-400", bg: "bg-purple-500/10", icon: <Sparkles className="w-3.5 h-3.5 animate-pulse" /> };
      case "generating": return { text: "Generating", color: "text-blue-400", bg: "bg-blue-500/10", icon: <MessageSquare className="w-3.5 h-3.5 animate-bounce" /> };
      case "speaking": return { text: "Speaking", color: "text-blue-400", bg: "bg-blue-500/10", icon: <Headphones className="w-3.5 h-3.5" /> };
      case "waiting": return { text: "Waiting", color: "text-muted-foreground", bg: "bg-muted/50", icon: <PauseCircle className="w-3.5 h-3.5" /> };
      case "idle":
      default: return { text: "Ready", color: "text-muted-foreground", bg: "bg-muted/50", icon: null };
    }
  };

  const config = getConfig();

  return (
    <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full transition-colors duration-500 border border-white/5 shadow-lg", config.bg)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={cn("flex items-center gap-2", config.color)}
        >
          {config.icon}
          <span className="text-[13px] font-bold tracking-widest uppercase mt-[1px]">
            {config.text}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
