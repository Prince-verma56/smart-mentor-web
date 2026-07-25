import { motion, AnimatePresence } from "framer-motion";
import SiriOrb from "@/components/ui/smoothui/siri-orb";
import { ConversationState } from "./useVoiceSession";
import { useVoiceAnimationManager } from "./useVoiceAnimationManager";
import { cn } from "@/lib/utils";

interface OrbAnimatorProps {
  callState: ConversationState;
  volume: number;
}

export function OrbAnimator({ callState, volume }: OrbAnimatorProps) {
  const { 
    orbColors, glowColor, isThinking, isSpeaking, isListening, 
    scale, rotate, innerGlowOpacity, outerGlowScale, outerGlowOpacity 
  } = useVoiceAnimationManager(callState, volume);

  return (
    <motion.div 
      // Subtle continuous floating animation
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
      className="relative shrink-0 flex items-center justify-center mt-8 mb-4"
    >
      <motion.div 
        animate={{ scale, rotate }}
        transition={{ 
          scale: { type: "spring", bounce: 0.2, duration: 0.1 },
          rotate: { duration: 4, ease: "linear", repeat: Infinity }
        }}
        className="relative flex items-center justify-center overflow-hidden rounded-full ring-4 ring-white/5 shadow-2xl z-10"
      >
         {/* Inner Glow Layer */}
         <motion.div 
           className={cn("absolute inset-0 mix-blend-overlay rounded-full blur-xl opacity-50", glowColor)}
           animate={{ opacity: innerGlowOpacity }}
         />

         {/* Outer Glow Layer */}
         <motion.div 
           className={cn("absolute -inset-10 mix-blend-screen rounded-full blur-3xl opacity-20", glowColor)}
           animate={{ scale: outerGlowScale, opacity: outerGlowOpacity }}
         />

         <SiriOrb 
            animationDuration={isSpeaking ? 5 : isThinking ? 8 : 15}
            size="240px"
           colors={{
              bg: "#020617",
              c1: orbColors.c1, 
              c2: orbColors.c2,
              c3: orbColors.c3
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
