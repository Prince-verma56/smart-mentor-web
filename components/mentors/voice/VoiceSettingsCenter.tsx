import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Volume2, Mic, Activity, Clock, MessageSquare, Zap, Speech } from "lucide-react";
import { useVoiceSettingsManager } from "./useVoiceSettingsManager";
import { Switch } from "@/components/ui/switch";
import Scrubber from "@/components/ui/smoothui/scrubber/index";

interface VoiceSettingsCenterProps {
  mentorId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceSettingsCenter({ mentorId, isOpen, onClose }: VoiceSettingsCenterProps) {
  const { preferences, updatePreference } = useVoiceSettingsManager(mentorId);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[380px] bg-zinc-950/85 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/80 rounded-[24px] p-5 z-[10000] overflow-hidden text-white"
        >
          {/* Glass noise overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 opacity-70" />
              <h3 className="font-semibold text-lg tracking-tight">Control Center</h3>
            </div>

            {/* Volume Section */}
            <div className="space-y-4 bg-black/20 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2"><Volume2 className="w-4 h-4" /> AI Volume</span>
                <span className="text-xs text-muted-foreground">{preferences.aiVolume}%</span>
              </div>
              <div className="pt-2">
                <Scrubber 
                  value={preferences.aiVolume} 
                  onValueChange={(v) => updatePreference("aiVolume", v)} 
                  max={100} 
                  step={1} 
                  decimals={0}
                  ticks={0}
                />
              </div>
            </div>

            {/* Toggles Section */}
            <div className="space-y-4 bg-black/20 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium flex items-center gap-2"><Activity className="w-4 h-4" /> Allow Interruption</span>
                  <span className="text-[10px] text-muted-foreground ml-6">AI stops speaking when you talk</span>
                </div>
                <Switch checked={preferences.autoInterrupt} onCheckedChange={(v) => updatePreference("autoInterrupt", v)} />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium flex items-center gap-2"><Clock className="w-4 h-4" /> Auto-Continue</span>
                  <span className="text-[10px] text-muted-foreground ml-6">AI automatically prompts you</span>
                </div>
                <Switch checked={preferences.autoContinue} onCheckedChange={(v) => updatePreference("autoContinue", v)} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Live Transcript</span>
                  <span className="text-[10px] text-muted-foreground ml-6">Show real-time speech-to-text</span>
                </div>
                <Switch checked={preferences.showLiveTranscript} onCheckedChange={(v) => updatePreference("showLiveTranscript", v)} />
              </div>
            </div>

            {/* Segmented Controls Section */}
            <div className="space-y-3">
              <span className="text-sm font-medium flex items-center gap-2 text-muted-foreground"><Zap className="w-4 h-4" /> Response Length</span>
              <div className="flex bg-black/40 p-1 rounded-xl">
                {["Short", "Balanced", "Detailed"].map((len) => (
                  <button
                    key={len}
                    onClick={() => updatePreference("responseLength", len as any)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${preferences.responseLength === len ? "bg-white/15 shadow-sm text-white" : "text-muted-foreground hover:text-white"}`}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-sm font-medium flex items-center gap-2 text-muted-foreground"><Speech className="w-4 h-4" /> Voice Speed</span>
              <div className="flex bg-black/40 p-1 rounded-xl">
                {[0.8, 1, 1.25, 1.5].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => updatePreference("voiceSpeed", speed)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${preferences.voiceSpeed === speed ? "bg-white/15 shadow-sm text-white" : "text-muted-foreground hover:text-white"}`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
