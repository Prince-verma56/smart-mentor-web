import { motion } from "framer-motion";

interface AudioWaveformProps {
  volume: number;
  isSpeaking: boolean;
}

export function AudioWaveform({ volume, isSpeaking }: AudioWaveformProps) {
  // We'll create a 15-bar symmetrical EQ
  const bars = 15;
  const centerIndex = Math.floor(bars / 2);

  return (
    <div className="flex items-center justify-center gap-[3px] h-12 w-48 overflow-hidden px-4">
      {Array.from({ length: bars }).map((_, i) => {
        // Distance from center determines the base height and volume impact
        const dist = Math.abs(i - centerIndex);
        const maxDist = centerIndex;
        
        // Base height is a bell curve shape
        const baseHeight = 10 + (maxDist - dist) * 2;
        
        // Volume impact decreases as we move away from center
        // Vapi volume is typically between 0 and 1
        const volumeImpact = Math.max(0, 1 - (dist / maxDist)) * (volume * 150);
        
        const finalHeight = baseHeight + volumeImpact;
        
        return (
          <motion.div
            key={i}
            className="w-1.5 rounded-full bg-primary/80 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            animate={{ 
              height: `${finalHeight}px`, 
              opacity: volume > 0.02 || isSpeaking ? 1 : 0.3 
            }}
            transition={{ type: "tween", duration: 0.1 }}
          />
        );
      })}
    </div>
  );
}
