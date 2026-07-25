import { useState, useEffect } from "react";

export interface VoicePreferences {
  responseLength: "Short" | "Balanced" | "Detailed";
  autoInterrupt: boolean;
  noiseSuppression: boolean;
  echoCancellation: boolean;
  pushToTalk: boolean;
}

const DEFAULT_PREFS: VoicePreferences = {
  responseLength: "Balanced",
  autoInterrupt: true,
  noiseSuppression: true,
  echoCancellation: true,
  pushToTalk: false,
};

export function useVoicePreferences(mentorId: string) {
  const [preferences, setPreferences] = useState<VoicePreferences>(DEFAULT_PREFS);

  // Load from LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`voice_prefs_${mentorId}`);
      if (stored) {
        try {
          setPreferences({ ...DEFAULT_PREFS, ...JSON.parse(stored) });
        } catch (e) {
          console.error("Failed to parse stored voice prefs");
        }
      }
    }
  }, [mentorId]);

  const updatePreference = <K extends keyof VoicePreferences>(key: K, value: VoicePreferences[K]) => {
    setPreferences(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(`voice_prefs_${mentorId}`, JSON.stringify(next));
      return next;
    });
  };

  return { preferences, updatePreference };
}
