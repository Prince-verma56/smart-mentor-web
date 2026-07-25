import { ConversationState } from "./useVoiceSession";

export function useVoiceAnimationManager(callState: ConversationState, volume: number) {
  
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

  const isThinking = callState === "thinking" || callState === "searching knowledge base" || callState === "understanding";
  const isSpeaking = callState === "speaking" || callState === "generating";
  const isListening = callState === "listening" || callState === "recording";

  return {
    orbColors: getOrbColors(),
    glowColor: getGlowColor(),
    isThinking,
    isSpeaking,
    isListening,
    
    // Derived Framer Motion Configurations
    scale: 1 + (volume * 0.4),
    rotate: isThinking ? 360 : 0,
    innerGlowOpacity: 0.5 + volume * 1.5,
    outerGlowScale: 1 + (volume * 0.5),
    outerGlowOpacity: 0.2 + (volume * 0.8),
  };
}
