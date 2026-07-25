import { useState, useEffect } from "react";

export interface VoicePreferences {
  aiVolume: number;
  responseLength: "Short" | "Balanced" | "Detailed";
  conversationStyle: "Professional" | "Friendly" | "Teacher" | "Interviewer" | "Coding Mentor";
  voiceSpeed: number;
  autoInterrupt: boolean;
  autoContinue: boolean;
  showLiveTranscript: boolean;
}

const DEFAULT_PREFS: VoicePreferences = {
  aiVolume: 100,
  responseLength: "Balanced",
  conversationStyle: "Friendly",
  voiceSpeed: 1,
  autoInterrupt: true,
  autoContinue: true,
  showLiveTranscript: true,
};

export function useVoiceSettingsManager(mentorId: string) {
  const [preferences, setPreferences] = useState<VoicePreferences>(DEFAULT_PREFS);

  // Load from LocalStorage and listen for sync events
  useEffect(() => {
    const loadPrefs = () => {
      const stored = localStorage.getItem(`voice_prefs_${mentorId}`);
      if (stored) {
        try {
          setPreferences({ ...DEFAULT_PREFS, ...JSON.parse(stored) });
        } catch (e) {
          console.error("Failed to parse stored voice prefs");
        }
      }
    };
    
    // Initial load
    if (typeof window !== "undefined") {
      loadPrefs();
      
      // Listen for custom sync event
      const onSync = () => loadPrefs();
      window.addEventListener(`sync-voice-prefs-${mentorId}`, onSync);
      return () => window.removeEventListener(`sync-voice-prefs-${mentorId}`, onSync);
    }
  }, [mentorId]);

  const updatePreference = <K extends keyof VoicePreferences>(key: K, value: VoicePreferences[K]) => {
    // Save to localStorage directly
    const stored = localStorage.getItem(`voice_prefs_${mentorId}`);
    const current = stored ? { ...DEFAULT_PREFS, ...JSON.parse(stored) } : DEFAULT_PREFS;
    const next = { ...current, [key]: value };
    localStorage.setItem(`voice_prefs_${mentorId}`, JSON.stringify(next));
    
    // Update local state
    setPreferences(next);
    
    // Dispatch sync event asynchronously to other components to avoid React update depth limits
    if (typeof window !== "undefined") {
      setTimeout(() => window.dispatchEvent(new Event(`sync-voice-prefs-${mentorId}`)), 0);
    }
    
    // If AI Volume changed, apply it immediately to Vapi DOM audio elements
    if (key === "aiVolume") {
        const audios = document.querySelectorAll("audio");
        let vol = Number(value) / 100;
        if (!isFinite(vol) || isNaN(vol)) vol = 1;
        if (vol < 0) vol = 0;
        if (vol > 1) vol = 1;
        
        audios.forEach((audio: HTMLAudioElement) => {
          try {
            audio.volume = vol;
          } catch (e) {
            console.warn("Could not set volume on audio element", e);
          }
        });
      }
  };

  return { preferences, updatePreference };
}
