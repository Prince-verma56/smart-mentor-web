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
import SmoothTab from "@/components/kokonutui/smooth-tab";
import { cn } from "@/lib/utils";

function PremiumScrollArea({ children, className }: { children: React.ReactNode; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  const [thumbHeight, setThumbHeight] = useState(30);
  const [thumbTop, setThumbTop] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    
    const scrollable = Math.ceil(scrollHeight) > clientHeight + 1;
    setIsScrollable(scrollable);
    
    setCanScrollUp(scrollable && scrollTop > 0);
    setCanScrollDown(scrollable && Math.ceil(scrollTop + clientHeight) < scrollHeight);
    
    if (!scrollable) {
      setThumbTop(0);
      return;
    }
    
    const heightRatio = clientHeight / scrollHeight;
    const calculatedThumbHeight = Math.max(heightRatio * clientHeight, 30);
    setThumbHeight(calculatedThumbHeight);
    
    const maxScrollTop = scrollHeight - clientHeight;
    const maxThumbTop = clientHeight - calculatedThumbHeight;
    
    if (maxScrollTop <= 0) {
      setThumbTop(0);
    } else {
      setThumbTop((scrollTop / maxScrollTop) * maxThumbTop);
    }
  };

  useEffect(() => {
    handleScroll();
    
    const observer = new MutationObserver(handleScroll);
    const resizeObserver = new ResizeObserver(handleScroll);
    
    if (containerRef.current) {
      observer.observe(containerRef.current, { childList: true, subtree: true, characterData: true });
      resizeObserver.observe(containerRef.current);
      if (containerRef.current.firstElementChild) {
        resizeObserver.observe(containerRef.current.firstElementChild);
      }
    }
    
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("resize", handleScroll);
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  const startDrag = (e: React.MouseEvent) => {
    if (!isScrollable) return;
    e.preventDefault();
    setIsDragging(true);
    
    const startY = e.clientY;
    const startScrollTop = containerRef.current!.scrollTop;
    const scrollHeight = containerRef.current!.scrollHeight;
    const clientHeight = containerRef.current!.clientHeight;
    
    const calculatedThumbHeight = Math.max((clientHeight / scrollHeight) * clientHeight, 30);
    const maxScrollTop = scrollHeight - clientHeight;
    const maxThumbTop = clientHeight - calculatedThumbHeight;

    const onMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startY;
      const scrollRatio = maxScrollTop / maxThumbTop;
      containerRef.current!.scrollTop = startScrollTop + deltaY * scrollRatio;
    };

    const onMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div 
      className={cn("relative overflow-hidden w-full group", className)} 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Gradient */}
      <div className={cn("absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-black/90 to-transparent pointer-events-none z-20 transition-opacity duration-300", canScrollUp ? "opacity-100" : "opacity-0")} />
      
      {/* Scroll Container (Native) */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-auto no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {children}
      </div>
      
      {/* Bottom Gradient */}
      <div className={cn("absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none z-20 transition-opacity duration-300", canScrollDown ? "opacity-100" : "opacity-0")} />
      
      {/* Custom Scrollbar */}
      <div 
        className={cn(
          "absolute right-1 top-0 bottom-0 w-4 z-30 flex justify-center transition-opacity duration-500", 
          isScrollable && (isHovered || isDragging) ? "opacity-100" : "opacity-0"
        )}
      >
        <motion.div
          onMouseDown={startDrag}
          animate={{
            height: thumbHeight,
            y: thumbTop,
            width: isDragging || isHovered ? 6 : 3,
            backgroundColor: isDragging ? "rgba(16, 185, 129, 0.9)" : "rgba(16, 185, 129, 0.5)",
            boxShadow: isDragging ? "0 0 12px rgba(16, 185, 129, 0.8)" : isHovered ? "0 0 6px rgba(16, 185, 129, 0.4)" : "none"
          }}
          transition={{
            width: { type: "spring", stiffness: 400, damping: 25 },
            backgroundColor: { duration: 0.2 },
            boxShadow: { duration: 0.2 },
            height: { duration: 0 },
            y: { duration: 0 }
          }}
          className="rounded-full cursor-grab active:cursor-grabbing absolute top-0"
        />
      </div>
    </div>
  );
}

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
            className="fixed inset-0 z-[10000] bg-black/40 pointer-events-auto"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-[10001] pointer-events-none flex items-center justify-center">
            <motion.div
              layout
              ref={panelRef}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-[420px] max-h-[85vh] pointer-events-auto bg-black/85 backdrop-blur-3xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1),0_0_20px_rgba(16,185,129,0.05)] rounded-[24px] overflow-hidden text-white flex flex-col"
            >
            {/* Glass noise overlay */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
            
            {/* Subtle gradient glow */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none"></div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between p-5 pb-3 border-b border-white/5 shrink-0">
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

            {/* Scrollable Content wrapped in PremiumScrollArea */}
            <PremiumScrollArea className="relative z-10 flex-1 min-h-0">
              <div className="p-5 space-y-6 relative">
                <AnimatePresence mode="popLayout">
                  {activeTab === "audio" ? (
                    <motion.div 
                      key="audio"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="space-y-6 w-full"
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
                          <SmoothTab
                            hideContent
                            value={String(global.voiceSpeed)}
                            onChange={(val) => updateGlobal("voiceSpeed", parseFloat(val))}
                            activeColor="bg-white/15 shadow-sm"
                            selectedTextColor="text-white"
                            className="bg-black/40 p-1 rounded-xl h-9"
                            items={[
                              { id: "0.8", title: "0.8x", color: "" },
                              { id: "1", title: "1x", color: "" },
                              { id: "1.1", title: "1.1x", color: "" },
                              { id: "1.2", title: "1.2x", color: "" },
                            ]}
                          />
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
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="space-y-6 w-full"
                  >
                    {/* BEHAVIOR SECTION */}
                    <section className="space-y-3">
                      <h4 className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">AI Behavior</h4>
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-5">
                        <div className="space-y-3">
                          <span className="text-sm font-medium flex items-center gap-2"><Zap className="w-4 h-4 text-muted-foreground" /> Response Length</span>
                          <SmoothTab
                            hideContent
                            value={mentor.responseLength}
                            onChange={(val) => updateMentor("responseLength", val as any)}
                            activeColor="bg-white/15 shadow-sm"
                            selectedTextColor="text-white"
                            className="bg-black/40 p-1 rounded-xl h-9"
                            items={[
                              { id: "Short", title: "Short", color: "" },
                              { id: "Balanced", title: "Balanced", color: "" },
                              { id: "Detailed", title: "Detailed", color: "" },
                            ]}
                          />
                        </div>
                        <div className="h-px w-full bg-white/5" />
                        <div className="space-y-3">
                          <span className="text-sm font-medium flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-muted-foreground" /> Teaching Style</span>
                          <SmoothTab
                            hideContent
                            value={mentor.teachingStyle}
                            onChange={(val) => updateMentor("teachingStyle", val as any)}
                            activeColor="bg-white/15 shadow-sm"
                            selectedTextColor="text-white"
                            className="bg-black/40 p-1.5 rounded-xl h-10"
                            items={[
                              { id: "Explain Simply", title: "Simple", color: "" },
                              { id: "Interview Mode", title: "Interview", color: "" },
                              { id: "Senior Developer", title: "Senior Dev", color: "" },
                            ]}
                          />
                        </div>
                        <div className="h-px w-full bg-white/5" />
                        <div className="space-y-3">
                          <span className="text-sm font-medium flex items-center gap-2"><Sliders className="w-4 h-4 text-muted-foreground" /> Correction Level</span>
                          <SmoothTab
                            hideContent
                            value={mentor.correctionLevel}
                            onChange={(val) => updateMentor("correctionLevel", val as any)}
                            activeColor="bg-white/15 shadow-sm"
                            selectedTextColor="text-white"
                            className="bg-black/40 p-1 rounded-xl h-9"
                            items={[
                              { id: "Gentle", title: "Gentle", color: "" },
                              { id: "Balanced", title: "Balanced", color: "" },
                              { id: "Strict", title: "Strict", color: "" },
                            ]}
                          />
                        </div>
                      </div>
                    </section>

                    {/* ENVIRONMENT SECTION */}
                    <section className="space-y-3">
                      <h4 className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">Environment</h4>
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-5">
                        <div className="space-y-3">
                          <span className="text-sm font-medium flex items-center gap-2"><Globe className="w-4 h-4 text-muted-foreground" /> Preferred Language</span>
                          <SmoothTab
                            hideContent
                            value={global.preferredLanguage}
                            onChange={(val) => updateGlobal("preferredLanguage", val as any)}
                            activeColor="bg-white/15 shadow-sm"
                            selectedTextColor="text-white"
                            className="bg-black/40 p-1 rounded-xl h-9"
                            items={[
                              { id: "English", title: "English", color: "" },
                              { id: "Hindi", title: "Hindi", color: "" },
                              { id: "Hinglish", title: "Hinglish", color: "" },
                            ]}
                          />
                        </div>
                        <div className="h-px w-full bg-white/5" />
                        <div className="space-y-3">
                          <span className="text-sm font-medium flex items-center gap-2"><Code className="w-4 h-4 text-muted-foreground" /> Code Style</span>
                          <SmoothTab
                            hideContent
                            value={mentor.codeStyle}
                            onChange={(val) => updateMentor("codeStyle", val as any)}
                            activeColor="bg-white/15 shadow-sm"
                            selectedTextColor="text-white"
                            className="bg-black/40 p-1.5 rounded-xl h-auto flex-wrap sm:flex-nowrap"
                            items={[
                              { id: "Beginner", title: "Beginner", color: "" },
                              { id: "Production", title: "Production", color: "" },
                              { id: "FAANG", title: "FAANG", color: "" },
                              { id: "Startup", title: "Startup", color: "" },
                            ]}
                          />
                        </div>
                      </div>
                    </section>
                  </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </PremiumScrollArea>

            {/* Footer Status */}
            <div className="relative z-10 p-3 px-5 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[10px] text-muted-foreground font-mono shrink-0">
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
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
