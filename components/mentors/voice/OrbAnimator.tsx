import { motion, AnimatePresence } from "framer-motion";
import SiriOrb from "@/components/ui/smoothui/siri-orb";
import { ConversationState } from "./useVoiceSession";
import { cn } from "@/lib/utils";

interface OrbAnimatorProps {
  callState: ConversationState;
  volume: number;
}

export function OrbAnimator({ callState, volume }: OrbAnimatorProps) {
  const getOrbColors = () => {
    switch (callState) {
      case "listening":
      case "recording":
        return { c1: "#10b981", c2: "#059669", c3: "#022c22" }; // Emerald
      case "understanding":
      case "thinking":
      case "searching knowledge base":
        return { c1: "#8b5cf6", c2: "#c084fc", c3: "#3b0764" }; // Purple
      case "generating":
      case "speaking":
        return { c1: "#3b82f6", c2: "#60a5fa", c3: "#1e3a8a" }; // Blue
      case "connecting":
      default:
        return { c1: "#10b981", c2: "#3b82f6", c3: "#8b5cf6" }; // Mixed
    }
  };

  const getGlowColor = () => {
    switch (callState) {
      case "listening":
      case "recording": return "bg-emerald-500";
      case "understanding":
      case "thinking":
      case "searching knowledge base": return "bg-purple-500";
      case "generating":
      case "speaking": return "bg-blue-500";
      default: return "bg-primary";
    }
  };

  const colors = getOrbColors();
  const isThinking = callState === "thinking" || callState === "searching knowledge base" || callState === "understanding";
  const isSpeaking = callState === "speaking" || callState === "generating";
  const isListening = callState === "listening" || callState === "recording";

  return (
    <motion.div 
      // Subtle continuous floating animation
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
      className="relative shrink-0 flex items-center justify-center mt-8 mb-4"
    >
      <motion.div 
        animate={{ 
          scale: 1 + (volume * 0.4),
          rotate: isThinking ? 360 : 0
        }}
        transition={{ 
          scale: { type: "spring", bounce: 0.2, duration: 0.1 },
          rotate: { duration: 4, ease: "linear", repeat: Infinity }
        }}
        className="relative flex items-center justify-center overflow-hidden rounded-full ring-4 ring-white/5 shadow-2xl z-10"
      >
         {/* Inner Glow Layer */}
         <motion.div 
           className={cn("absolute inset-0 mix-blend-overlay rounded-full blur-xl opacity-50", getGlowColor())}
           animate={{ opacity: 0.5 + volume * 1.5 }}
         />

         {/* Outer Glow Layer */}
         <motion.div 
           className={cn("absolute -inset-10 mix-blend-screen rounded-full blur-3xl opacity-20", getGlowColor())}
           animate={{ 
             scale: 1 + (volume * 0.5),
             opacity: 0.2 + (volume * 0.8)
           }}
         />

         <SiriOrb 
            animationDuration={isSpeaking ? 5 : isThinking ? 8 : 15}
            size="240px"
            colors={{
              bg: "#020617",
              c1: colors.c1, 
              c2: colors.c2,
              c3: colors.c3
            }}
         />
      </motion.div>

      {/* Ripple Rings */}
      <AnimatePresence>
        {(isSpeaking || isListening) && (
          <>
            {[1, 2, 3].map((ring) => (
              <motion.div
                key={`ring-${ring}`}
                initial={{ opacity: 0.4, scale: 0.8 }}
                animate={{ opacity: 0, scale: 1.8 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: ring * 0.6,
                  ease: "easeOut"
                }}
                className={cn("absolute inset-0 rounded-full border-2 z-0", 
                  isSpeaking ? "border-blue-500/30" : "border-emerald-500/30"
                )}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
