import { useState, useEffect } from "react";

// --- Global Preferences ---
export interface GlobalPreferences {
  aiVolume: number;
  voiceSpeed: number;
  preferredLanguage: "English" | "Hindi" | "Hinglish";
  inputDeviceId: string | null;
  outputDeviceId: string | null;
}

const DEFAULT_GLOBAL: GlobalPreferences = {
  aiVolume: 100,
  voiceSpeed: 1,
  preferredLanguage: "English",
  inputDeviceId: null,
  outputDeviceId: null,
};

// --- Mentor Preferences ---
export interface MentorPreferences {
  responseLength: "Short" | "Balanced" | "Detailed";
  teachingStyle: "Explain Simply" | "Interview Mode" | "Senior Developer" | "Pair Programmer" | "Socratic Mentor";
  correctionLevel: "Gentle" | "Balanced" | "Strict";
  codeStyle: "Beginner" | "Production" | "FAANG" | "Startup";
}

const DEFAULT_MENTOR: MentorPreferences = {
  responseLength: "Balanced",
  teachingStyle: "Explain Simply",
  correctionLevel: "Balanced",
  codeStyle: "Production",
};

// --- Session Preferences ---
export interface SessionPreferences {
  autoInterrupt: boolean;
  autoContinue: boolean;
  showLiveTranscript: boolean;
  isMuted: boolean;
}

const DEFAULT_SESSION: SessionPreferences = {
  autoInterrupt: true,
  autoContinue: true,
  showLiveTranscript: true,
  isMuted: false,
};

// --- Service ---
class VoicePreferenceService {
  private listeners: Set<() => void> = new Set();
  
  // Storage keys
  private get globalKey() { return "voice_prefs_global"; }
  private getMentorKey(id: string) { return `voice_prefs_mentor_${id}`; }

  // Memory store for session
  public sessionPrefs: SessionPreferences = { ...DEFAULT_SESSION };

  public getGlobal(): GlobalPreferences {
    if (typeof window === "undefined") return DEFAULT_GLOBAL;
    const stored = localStorage.getItem(this.globalKey);
    return stored ? { ...DEFAULT_GLOBAL, ...JSON.parse(stored) } : DEFAULT_GLOBAL;
  }

  public getMentor(mentorId: string): MentorPreferences {
    if (typeof window === "undefined") return DEFAULT_MENTOR;
    const stored = localStorage.getItem(this.getMentorKey(mentorId));
    return stored ? { ...DEFAULT_MENTOR, ...JSON.parse(stored) } : DEFAULT_MENTOR;
  }

  public updateGlobal<K extends keyof GlobalPreferences>(key: K, value: GlobalPreferences[K]) {
    const next = { ...this.getGlobal(), [key]: value };
    if (typeof window !== "undefined") {
      localStorage.setItem(this.globalKey, JSON.stringify(next));
    }
    
    // Apply global side-effects immediately
    if (key === "aiVolume") {
      const audios = document.querySelectorAll("audio");
      let vol = Number(value) / 100;
      if (!isFinite(vol) || isNaN(vol)) vol = 1;
      vol = Math.max(0, Math.min(1, vol));
      audios.forEach((audio) => {
        try { audio.volume = vol; } catch (e) { console.warn(e); }
      });
    }

    this.notify();
  }

  public updateMentor<K extends keyof MentorPreferences>(mentorId: string, key: K, value: MentorPreferences[K]) {
    const next = { ...this.getMentor(mentorId), [key]: value };
    if (typeof window !== "undefined") {
      localStorage.setItem(this.getMentorKey(mentorId), JSON.stringify(next));
    }
    this.notify();
  }

  public updateSession<K extends keyof SessionPreferences>(key: K, value: SessionPreferences[K]) {
    this.sessionPrefs = { ...this.sessionPrefs, [key]: value };
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l());
    if (typeof window !== "undefined") {
      setTimeout(() => window.dispatchEvent(new Event("voice-prefs-changed")), 0);
    }
  }
}

export const voicePrefsService = new VoicePreferenceService();

// --- Hooks ---
export function useVoicePreferences(mentorId: string) {
  const [global, setGlobal] = useState<GlobalPreferences>(voicePrefsService.getGlobal());
  const [mentor, setMentor] = useState<MentorPreferences>(voicePrefsService.getMentor(mentorId));
  const [session, setSession] = useState<SessionPreferences>(voicePrefsService.sessionPrefs);

  useEffect(() => {
    const sync = () => {
      setGlobal(voicePrefsService.getGlobal());
      setMentor(voicePrefsService.getMentor(mentorId));
      setSession(voicePrefsService.sessionPrefs);
    };
    
    // Initial sync
    sync();

    // Listen to local changes
    const unsubscribe = voicePrefsService.subscribe(sync);
    
    // Listen to changes from other windows/tabs
    const onStorage = () => sync();
    window.addEventListener("storage", onStorage);
    window.addEventListener("voice-prefs-changed", onStorage);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("voice-prefs-changed", onStorage);
    };
  }, [mentorId]);

  return {
    global,
    mentor,
    session,
    updateGlobal: voicePrefsService.updateGlobal.bind(voicePrefsService),
    updateMentor: (key: keyof MentorPreferences, value: any) => voicePrefsService.updateMentor(mentorId, key, value),
    updateSession: voicePrefsService.updateSession.bind(voicePrefsService),
  };
}
