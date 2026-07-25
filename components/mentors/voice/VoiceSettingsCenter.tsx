import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, Volume2, Activity, Clock, MessageSquare, 
  Zap, Speech, BrainCircuit, Globe, Code, Sliders, CheckCircle2,
  Cpu
} from "lucide-react";
import { useVoicePreferences } from "./useVoicePreferences";
import { Switch } from "@/components/ui/switch";
import Scrubber from "@/components/ui/smoothui/scrubber/index";

interface VoiceSettingsCenterProps {
  mentorId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceSettingsCenter({ mentorId, isOpen, onClose }: VoiceSettingsCenterProps) {
  const { global, mentor, session, updateGlobal, updateMentor, updateSession } = useVoicePreferences(mentorId);
  const panelRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"audio" | "memory">("audio");

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
        <>
          {/* Focus Mode Backdrop */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] bg-black/40 pointer-events-auto"
            onClick={onClose}
          />

          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-[104px] left-1/2 -translate-x-1/2 w-[420px] bg-black/70 backdrop-blur-3xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1),0_0_20px_rgba(16,185,129,0.05)] rounded-[24px] z-[10000] overflow-hidden text-white flex flex-col"
          >
            {/* Glass noise overlay */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
            
            {/* Subtle gradient glow */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none"></div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between p-5 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-400" />
                <h3 className="font-medium text-lg tracking-tight">Control Center</h3>
              </div>
              <div className="flex bg-white/5 rounded-lg p-1">
                <button 
                  onClick={() => setActiveTab("audio")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === "audio" ? "bg-white/15 text-white shadow-sm" : "text-muted-foreground hover:text-white"}`}
                >
                  Session
                </button>
                <button 
                  onClick={() => setActiveTab("memory")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === "memory" ? "bg-white/15 text-white shadow-sm" : "text-muted-foreground hover:text-white"}`}
                >
                  Mentor Memory
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="relative z-10 max-h-[60vh] overflow-y-auto p-5 space-y-6 custom-scrollbar [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
              
              <AnimatePresence mode="wait">
                {activeTab === "audio" ? (
                  <motion.div 
                    key="audio"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    {/* AUDIO SECTION */}
                    <section className="space-y-3">
                      <h4 className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">Audio & Output</h4>
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium flex items-center gap-2"><Volume2 className="w-4 h-4 text-muted-foreground" /> AI Volume</span>
                          <span className="text-xs text-muted-foreground font-mono">{global.aiVolume}%</span>
                        </div>
                        <div className="pt-2">
                          <Scrubber 
                            value={global.aiVolume} 
                            onValueChange={(v) => updateGlobal("aiVolume", v)} 
                            max={100} 
                            step={1} 
                            decimals={0}
                            ticks={0}
                            label=""
                          />
                        </div>
                        <div className="h-px w-full bg-white/5 my-2" />
                        <div className="space-y-2">
                          <span className="text-sm font-medium flex items-center gap-2"><Speech className="w-4 h-4 text-muted-foreground" /> Voice Speed</span>
                          <div className="flex bg-black/40 p-1 rounded-xl">
                            {[0.8, 1, 1.25, 1.5].map((speed) => (
                              <button
                                key={speed}
                                onClick={() => updateGlobal("voiceSpeed", speed)}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${global.voiceSpeed === speed ? "bg-white/15 shadow-sm text-white" : "text-muted-foreground hover:text-white"}`}
                              >
                                {speed}x
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* CONVERSATION SECTION */}
                    <section className="space-y-3">
                      <h4 className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">Conversation Flow</h4>
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-5">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium flex items-center gap-2"><Activity className="w-4 h-4 text-muted-foreground" /> Allow Interruption</span>
                            <span className="text-[11px] text-muted-foreground ml-6 mt-1">AI stops speaking when you talk</span>
                          </div>
                          <Switch checked={session.autoInterrupt} onCheckedChange={(v) => updateSession("autoInterrupt", v)} />
                        </div>
                        <div className="h-px w-full bg-white/5" />
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /> Auto-Continue</span>
                            <span className="text-[11px] text-muted-foreground ml-6 mt-1">AI automatically prompts you when silent</span>
                          </div>
                          <Switch checked={session.autoContinue} onCheckedChange={(v) => updateSession("autoContinue", v)} />
                        </div>
                        <div className="h-px w-full bg-white/5" />
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium flex items-center gap-2"><MessageSquare className="w-4 h-4 text-muted-foreground" /> Live Transcript</span>
                            <span className="text-[11px] text-muted-foreground ml-6 mt-1">Show real-time speech-to-text overlay</span>
                          </div>
                          <Switch checked={session.showLiveTranscript} onCheckedChange={(v) => updateSession("showLiveTranscript", v)} />
                        </div>
                      </div>
                    </section>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="memory"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-6"
                  >
                    {/* BEHAVIOR SECTION */}
                    <section className="space-y-3">
                      <h4 className="text-xs font-semibold text-purple-400/80 uppercase tracking-wider">AI Behavior</h4>
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-5">
                        <div className="space-y-3">
                          <span className="text-sm font-medium flex items-center gap-2"><Zap className="w-4 h-4 text-muted-foreground" /> Response Length</span>
                          <div className="flex bg-black/40 p-1 rounded-xl">
                            {["Short", "Balanced", "Detailed"].map((len) => (
                              <button
                                key={len}
                                onClick={() => updateMentor("responseLength", len as any)}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${mentor.responseLength === len ? "bg-white/15 shadow-sm text-white" : "text-muted-foreground hover:text-white"}`}
                              >
                                {len}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="h-px w-full bg-white/5" />
                        <div className="space-y-3">
                          <span className="text-sm font-medium flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-muted-foreground" /> Teaching Style</span>
                          <div className="grid grid-cols-2 gap-1.5 bg-black/40 p-1.5 rounded-xl">
                            {["Explain Simply", "Interview Mode", "Senior Developer", "Pair Programmer", "Socratic Mentor"].map((style) => (
                              <button
                                key={style}
                                onClick={() => updateMentor("teachingStyle", style as any)}
                                className={`py-1.5 px-2 text-[11px] font-medium rounded-lg transition-all whitespace-nowrap text-left ${mentor.teachingStyle === style ? "bg-white/15 shadow-sm text-white" : "text-muted-foreground hover:text-white"}`}
                              >
                                {style}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="h-px w-full bg-white/5" />
                        <div className="space-y-3">
                          <span className="text-sm font-medium flex items-center gap-2"><Sliders className="w-4 h-4 text-muted-foreground" /> Correction Level</span>
                          <div className="flex bg-black/40 p-1 rounded-xl">
                            {["Gentle", "Balanced", "Strict"].map((level) => (
                              <button
                                key={level}
                                onClick={() => updateMentor("correctionLevel", level as any)}
                                className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg transition-all ${mentor.correctionLevel === level ? "bg-white/15 shadow-sm text-white" : "text-muted-foreground hover:text-white"}`}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* ENVIRONMENT SECTION */}
                    <section className="space-y-3">
                      <h4 className="text-xs font-semibold text-blue-400/80 uppercase tracking-wider">Environment</h4>
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-5">
                        <div className="space-y-3">
                          <span className="text-sm font-medium flex items-center gap-2"><Globe className="w-4 h-4 text-muted-foreground" /> Preferred Language</span>
                          <div className="flex bg-black/40 p-1 rounded-xl">
                            {["English", "Hindi", "Hinglish"].map((lang) => (
                              <button
                                key={lang}
                                onClick={() => updateGlobal("preferredLanguage", lang as any)}
                                className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg transition-all ${global.preferredLanguage === lang ? "bg-white/15 shadow-sm text-white" : "text-muted-foreground hover:text-white"}`}
                              >
                                {lang}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="h-px w-full bg-white/5" />
                        <div className="space-y-3">
                          <span className="text-sm font-medium flex items-center gap-2"><Code className="w-4 h-4 text-muted-foreground" /> Code Style</span>
                          <div className="flex flex-wrap gap-1.5 bg-black/40 p-1.5 rounded-xl">
                            {["Beginner", "Production", "FAANG", "Startup"].map((style) => (
                              <button
                                key={style}
                                onClick={() => updateMentor("codeStyle", style as any)}
                                className={`flex-1 min-w-[70px] py-1.5 px-1 text-[11px] font-medium rounded-lg transition-all ${mentor.codeStyle === style ? "bg-white/15 shadow-sm text-white" : "text-muted-foreground hover:text-white"}`}
                              >
                                {style}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Footer Status */}
            <div className="relative z-10 p-3 px-5 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>Synced locally</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3 h-3 opacity-50" />
                <span>Vapi Active</span>
              </div>
            </div>
            
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
