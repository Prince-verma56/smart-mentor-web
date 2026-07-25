import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import type { Mentor } from "@/types/mentor";

import { useVoiceSession } from "./useVoiceSession";
import { OrbAnimator } from "./OrbAnimator";
import { WaveformStatusPill } from "./WaveformStatusPill";
import { TranscriptPanel } from "./TranscriptPanel";
import { VoiceControlDock } from "./VoiceControlDock";
import { SessionInfo } from "./SessionInfo";
import { VoiceSettingsCenter } from "./VoiceSettingsCenter";

interface VoiceWorkspaceProps {
  mentor: Mentor;
  sessionId?: string;
  onClose: () => void;
}

export function VoiceWorkspace({ mentor, sessionId, onClose }: VoiceWorkspaceProps) {
  const {
    isVoiceActive,
    isVoiceLoading,
    callState,
    volume,
    activeTranscript,
    isMuted,
    isSpeakerMuted,
    sessionDuration,
    startCall,
    endCall,
    toggleMute,
    toggleSpeaker,
    vapiRef,
    session
  } = useVoiceSession({ mentor, sessionId, onCallEnded: onClose });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Start the call automatically when the workspace mounts
  useEffect(() => {
    startCall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      // Note: Escape key is deliberately NOT ending the call here. 
      // It is handled by VoiceSettingsCenter to close settings. 
      
      if (e.code === "Space") {
        e.preventDefault();
        toggleMute();
      } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        toggleMute();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleMute]);

  return (
    <AnimatePresence>
      {(isVoiceActive || isVoiceLoading) && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col justify-between bg-background/50 backdrop-blur-[40px] pointer-events-auto overflow-hidden font-sans"
        >
          {/* Deep Cinematic Radial Vignette & Moving Gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-background/60 to-background/95 pointer-events-none" />
          <motion.div 
            animate={{ 
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 40, ease: "linear", repeat: Infinity }}
            className="absolute inset-0 opacity-15 pointer-events-none bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10"
            style={{ backgroundSize: "300% 300%" }}
          />

          {/* Floating Particles Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/10 rounded-full blur-[1px]"
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                }}
                animate={{
                  y: [null, Math.random() * -200 - 100],
                  opacity: [0, 0.5, 0]
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            ))}
          </div>

          {/* ZONE 1: TOP - Minimal Status Bar */}
          <div className="relative z-10 w-full flex justify-between items-start pt-6 px-6 h-24 shrink-0">
            <SessionInfo mentorName={mentor.name} duration={sessionDuration} callState={callState} />
          </div>

          {/* ZONE 2: CENTER - Identity, Orb, & Waveform */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full flex-1 gap-2">
            {isVoiceLoading ? (
              <div className="flex flex-col items-center justify-center gap-8">
                <div className="relative h-40 w-40 shrink-0 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-t-4 border-primary/80 animate-spin shadow-[0_0_30px_rgba(16,185,129,0.3)]" />
                  <div className="absolute inset-4 rounded-full border-b-4 border-blue-500/60 animate-spin shadow-[0_0_30px_rgba(59,130,246,0.3)]" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
                  <Loader2 className="w-12 h-12 text-primary animate-pulse" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-foreground animate-pulse">
                  Connecting...
                </span>
              </div>
            ) : (
              <>
                {/* Mentor Identity */}
                <motion.div 
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className="flex flex-col items-center gap-1 mb-4"
                >
                  <h2 className="text-4xl font-extrabold tracking-tight text-foreground">{mentor.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{mentor.role}</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                    <span className="text-sm font-medium text-primary">AI Mentor</span>
                  </div>
                </motion.div>
                
                {/* Orb */}
                <div className="my-4">
                  <OrbAnimator callState={callState} volume={volume} />
                </div>
                
                {/* Merged Waveform & Status */}
                <div className="mt-4">
                  <WaveformStatusPill state={callState} volume={volume} />
                </div>
              </>
            )}
          </div>

          {/* ZONE 3: BOTTOM - Transcript & Controls */}
          <div className="relative z-10 w-full flex flex-col items-center justify-end pb-8 pt-4 shrink-0 h-[220px]">
            {!isVoiceLoading && session.showLiveTranscript && (
              <div className="mb-4 w-full flex justify-center">
                <TranscriptPanel transcript={activeTranscript} callState={callState} />
              </div>
            )}
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <VoiceControlDock 
                mentorId={mentor.id}
                isMuted={isMuted} 
                isSpeakerMuted={isSpeakerMuted}
                toggleMute={toggleMute}
                toggleSpeaker={toggleSpeaker}
                endCall={() => { endCall(); onClose(); }}
                vapiRef={vapiRef}
                isSettingsOpen={isSettingsOpen}
                setIsSettingsOpen={setIsSettingsOpen}
              />
            </motion.div>
          </div>
          
          <VoiceSettingsCenter 
            mentorId={mentor.id} 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)} 
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
