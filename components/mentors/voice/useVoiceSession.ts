import { useState, useEffect, useRef, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import { toast } from "sonner";
import { saveMessage } from "@/actions/chatActions";
import { markTopicComplete, markTopicIncomplete } from "@/actions/progressActions";
import type { Mentor } from "@/types/mentor";
import { useVoicePreferences } from "./useVoicePreferences";

export type ConversationState = "idle" | "connecting" | "listening" | "recording" | "transcribing" | "understanding" | "thinking" | "generating" | "speaking" | "waiting" | "searching knowledge base";

interface UseVoiceSessionProps {
  mentor: Mentor;
  sessionId?: string;
  onCallEnded?: () => void;
}

// Global Vapi singleton to prevent "Duplicate DailyIframe instances"
let globalVapiInstance: Vapi | null = null;

export function useVoiceSession({ mentor, sessionId, onCallEnded }: UseVoiceSessionProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  const vapiRef = useRef<Vapi | null>(null);
  const transcriptRef = useRef<string>("");

  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isVoiceLoading, setIsVoiceLoading] = useState(false);
  
  const [callState, setCallState] = useState<ConversationState>("idle");
  const [volume, setVolume] = useState(0);
  const [activeTranscript, setActiveTranscript] = useState<{ text: string, role: "user" | "assistant" | null }>({ text: "", role: null });
  
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);

  const [cachedPrompt, setCachedPrompt] = useState<string | null>(null);
  const [cachedGreeting, setCachedGreeting] = useState<string | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);

  const { global, mentor: mentorPrefs, session } = useVoicePreferences(mentor.id);
  const lastGlobalRef = useRef(global);
  const lastMentorPrefsRef = useRef(mentorPrefs);
  const lastMessageTimeRef = useRef<number>(Date.now());
  const idleWarningSentRef = useRef<boolean>(false);

  // Initialize Vapi instance safely
  if (!vapiRef.current && typeof window !== "undefined") {
    if (!globalVapiInstance) {
      globalVapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "a3a65c73-9cbd-4e8a-910f-8b5c99d56177");
      
      // @ts-ignore
      if (!window.__vapi_error_suppressed) {
        const originalError = console.error;
        console.error = (...args) => {
          if (args[0] && typeof args[0] === 'string' && args[0].includes('Error unloading krisp processor')) return;
          originalError(...args);
        };
        // @ts-ignore
        window.__vapi_error_suppressed = true;
      }
    }
    vapiRef.current = globalVapiInstance;
  }

  // Session Duration Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVoiceActive) {
      interval = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
    } else {
      setSessionDuration(0);
    }
    return () => clearInterval(interval);
  }, [isVoiceActive]);

  // Pre-fetch prompt
  useEffect(() => {
    async function prefetchPrompt() {
        const basePrompt = `You are ${mentor.name}, a ${mentor.role} teaching ${mentor.subject}.
TEACHING STYLE: ${mentorPrefs.teachingStyle} (${mentor.conversationStyle})
CORRECTION LEVEL: ${mentorPrefs.correctionLevel}
PREFERRED LANGUAGE: ${global.preferredLanguage}
CODE STYLE: ${mentorPrefs.codeStyle}
STUDENT GOAL: ${mentor.learningGoal}
RESPONSE LENGTH: ${mentorPrefs.responseLength}
Use short, concise sentences perfect for spoken audio. Do not use markdown.`;

      try {
        const res = await fetch(`/api/vapi/prompt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mentorId: mentor.id, basePrompt, sessionId })
        });
        if (res.ok) {
          const { prompt, greeting } = await res.json();
          setCachedPrompt(prompt);
          setCachedGreeting(greeting);
        }
      } catch (err) {
        console.error("Prefetch error", err);
      }
    }
    prefetchPrompt();
  }, [mentor, sessionId]);

  const callStateRef = useRef(callState);
  useEffect(() => { callStateRef.current = callState; }, [callState]);

  // Vapi Event Listeners
  useEffect(() => {
    const vapi = vapiRef.current;
    if (!vapi) return;

    const onCallStart = () => {
      setIsVoiceLoading(false);
      setIsVoiceActive(true);
      setCallState("speaking");
      setActiveTranscript({ text: "", role: null });
      transcriptRef.current = ""; 
      lastMessageTimeRef.current = Date.now();
      idleWarningSentRef.current = false;
    };
    
    const onCallEnd = async () => {
      setIsVoiceActive(false);
      setIsVoiceLoading(false);
      setCallState("idle");
      setVolume(0);

      const fullTranscript = transcriptRef.current.trim();
      if (fullTranscript.length > 50) {
        fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: fullTranscript, mentorId: mentor.id, sessionId: sessionId || null }),
        }).catch((err) => console.warn("[Voice Summary] failed:", err));
      }
      if (onCallEnded) onCallEnded();
    };
    
    const onError = (e: any) => {
      if (e?.type === "daily-error" && e?.error?.errorMsg === "Meeting has ended") return;
      
      setIsVoiceLoading(false);
      setIsVoiceActive(false);
      setCallState("idle");
      
      try { vapi.stop(); } catch (err) {}
      
      if (e?.message !== "Call ended") {
        // Suppress daily iframe duplicate errors in toast, we handled it silently
        if (!e?.message?.includes("Duplicate DailyIframe") && !e?.message?.includes("ejection")) {
          console.error("Vapi error", e);
          toast.error("Voice call error: " + (e.message || "Unknown error"));
        }
      }
      if (onCallEnded) onCallEnded();
    };

    const onMessage = async (msg: any) => {
      if (msg.type === "transcript") {
        if (msg.transcriptType === "partial") {
          setActiveTranscript({ text: msg.transcript, role: msg.role });
          lastMessageTimeRef.current = Date.now(); // keep resetting while talking
          if (msg.role === "user") {
            setCallState("recording");
          }
        } else if (msg.transcriptType === "final") {
          setActiveTranscript({ text: msg.transcript, role: msg.role });
          const speaker = msg.role === "user" ? "Student" : "Mentor";
          
          if (msg.role === "user") {
            setCallState("understanding");
            lastMessageTimeRef.current = Date.now();
            idleWarningSentRef.current = false;
            setTimeout(() => { if (callStateRef.current !== "speaking" && callStateRef.current !== "searching knowledge base") setCallState("thinking"); }, 800);
            if (sessionId) await saveMessage(sessionId, "user", msg.transcript);
          } else if (msg.role === "assistant") {
            setCallState("waiting");
            lastMessageTimeRef.current = Date.now();
            idleWarningSentRef.current = false;
            
            if (session.autoContinue) {
              setTimeout(() => { setCallState("listening"); }, 1000);
            }
            
            if (sessionId) await saveMessage(sessionId, "assistant", msg.transcript);
            setTimeout(() => {
              setActiveTranscript(t => t.text === msg.transcript ? { text: "", role: null } : t);
            }, 3000);
          }
          transcriptRef.current += `${speaker}: ${msg.transcript}\n`;
        }
      }

      if (msg.type === "speech-update") {
        if (msg.role === "assistant" && msg.status === "started") {
          setCallState("speaking");
        }
      }
      
      if (msg.type === "function-call") {
        setCallState("searching knowledge base");
      }

      if (msg.type === "tool-calls") {
        const results = [];
        for (const toolCall of msg.toolCallList) {
          try {
            if (toolCall.function.name === "update_roadmap_topic_complete") {
              const args = typeof toolCall.function.arguments === "string" ? JSON.parse(toolCall.function.arguments) : toolCall.function.arguments;
              const res = await markTopicComplete(args.topic_id);
              results.push({ toolCallId: toolCall.id, result: 'error' in res && res.error ? `Error: ${res.error}` : "Topic complete." });
            } 
            else if (toolCall.function.name === "update_roadmap_revision_required") {
              const args = typeof toolCall.function.arguments === "string" ? JSON.parse(toolCall.function.arguments) : toolCall.function.arguments;
              const res = await markTopicIncomplete(args.topic_id);
              results.push({ toolCallId: toolCall.id, result: 'error' in res && res.error ? `Error: ${res.error}` : "Topic marked for revision." });
            }
            else if (toolCall.function.name === "end_call") {
              setIsVoiceActive(false);
              setIsVoiceLoading(false);
              vapi.stop();
              results.push({ toolCallId: toolCall.id, result: "Call ended." });
            }
          } catch (e: any) {
            results.push({ toolCallId: toolCall.id, result: `Error: ${e.message}` });
          }
        }
        if (results.length > 0) {
          vapi.send({ type: "add-message", message: { role: "tool", content: JSON.stringify(results) } } as any);
        }
      }
    };

    const onVolumeLevel = (level: number) => setVolume(level);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("error", onError);
    vapi.on("message", onMessage);
    vapi.on("volume-level", onVolumeLevel);

    // Idle Timeout Checker
    const idleInterval = setInterval(() => {
      const currentCallState = callStateRef.current;
      if (currentCallState === "listening" || currentCallState === "waiting") {
        const silentSeconds = (Date.now() - lastMessageTimeRef.current) / 1000;
        const lang = lastGlobalRef.current.preferredLanguage;
        
        if (silentSeconds > 30 && !idleWarningSentRef.current) {
          idleWarningSentRef.current = true;
          let content = "The user has been silent for 30 seconds. Say this exactly: 'I noticed things have been quiet for a while. I'll stay connected a little longer in case you have another question.'";
          if (lang === "Hindi") content = "The user has been silent for 30 seconds. Say this exactly in Hindi: 'मुझे लग रहा है कि आप कुछ समय से शांत हैं। अगर आपका कोई सवाल है तो मैं थोड़ी देर और कनेक्टेड रहूँगा।'";
          else if (lang === "Hinglish") content = "The user has been silent for 30 seconds. Say this exactly in Hinglish: 'Aisa lag raha hai aap kaafi der se shant hain. Agar aapka koi aur question hai toh main thodi der aur connected rahunga.'";
          
          vapi.send({
            type: "add-message",
            message: { role: "system", content }
          } as any);
        } else if (silentSeconds > 50 && idleWarningSentRef.current) {
          // It's been 20s since the warning (50s total)
          let content = "The user is still silent. Say this exactly: 'Looks like we're done for now. Feel free to start another conversation anytime. Have a great day.' And then trigger the end_call tool immediately.";
          if (lang === "Hindi") content = "The user is still silent. Say this exactly in Hindi: 'लगता है कि अभी के लिए हम समाप्त कर चुके हैं। आप कभी भी नई बातचीत शुरू कर सकते हैं। आपका दिन शुभ हो!' And then trigger the end_call tool immediately.";
          else if (lang === "Hinglish") content = "The user is still silent. Say this exactly in Hinglish: 'Lagta hai abhi ke liye hum done hain. Aap kabhi bhi nayi conversation start kar sakte hain. Have a great day!' And then trigger the end_call tool immediately.";
          
          vapi.send({
            type: "add-message",
            message: { role: "system", content }
          } as any);
          clearInterval(idleInterval);
        }
      }
    }, 2000);

    return () => {
      clearInterval(idleInterval);
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("error", onError);
      vapi.off("message", onMessage);
      vapi.off("volume-level", onVolumeLevel);
    };
  }, [sessionId, mentor.id, onCallEnded, session.autoContinue]);

  // Handle mid-call preference updates via Vapi system messages
  useEffect(() => {
    if (!isVoiceActive || !vapiRef.current) {
      lastGlobalRef.current = global;
      lastMentorPrefsRef.current = mentorPrefs;
      return;
    }

    const messages: string[] = [];
    const prevGlobal = lastGlobalRef.current;
    const prevMentor = lastMentorPrefsRef.current;

    if (global.preferredLanguage !== prevGlobal.preferredLanguage) {
      messages.push(`The user has changed their preferred language to ${global.preferredLanguage}. From now on, you MUST speak entirely in ${global.preferredLanguage}. Briefly acknowledge this change in ${global.preferredLanguage}.`);
    }

    if (mentorPrefs.teachingStyle !== prevMentor.teachingStyle) {
      messages.push(`The user has changed your teaching style to "${mentorPrefs.teachingStyle}". Adjust your tone and approach accordingly. Briefly acknowledge this change.`);
    }

    if (mentorPrefs.correctionLevel !== prevMentor.correctionLevel) {
      messages.push(`The user has set the correction level to "${mentorPrefs.correctionLevel}". Adjust how strictly you point out mistakes.`);
    }

    if (mentorPrefs.responseLength !== prevMentor.responseLength) {
      messages.push(`The user wants your response length to be "${mentorPrefs.responseLength}". Please confirm this briefly.`);
    }

    if (messages.length > 0) {
      vapiRef.current.send({
        type: "add-message",
        message: {
          role: "system",
          content: `SYSTEM UPDATE: ${messages.join(" ")}`
        }
      } as any);
    }

    lastGlobalRef.current = global;
    lastMentorPrefsRef.current = mentorPrefs;
  }, [global, mentorPrefs, isVoiceActive]);

  const endCall = useCallback(() => {
    setIsVoiceActive(false);
    setIsVoiceLoading(false);
    
    // Stop the call immediately to cut audio
    if (vapiRef.current) {
      try { vapiRef.current.stop(); } catch (e) {}
    }
    
    if (onCallEnded) onCallEnded();
  }, [onCallEnded]);

  const startCall = useCallback(async () => {
    const vapi = vapiRef.current;
    if (!vapi) {
      toast.error("Voice client not initialized");
      return;
    }

    if (isVoiceActive) {
      endCall();
      return;
    }
    
    setIsVoiceLoading(true);
    setCallState("connecting");
    
    try {
      const basePrompt = `You are ${mentor.name}, a ${mentor.role} teaching ${mentor.subject}.
TEACHING STYLE: ${mentorPrefs.teachingStyle} (${mentor.conversationStyle})
CORRECTION LEVEL: ${mentorPrefs.correctionLevel}
PREFERRED LANGUAGE: ${global.preferredLanguage}
CODE STYLE: ${mentorPrefs.codeStyle}
STUDENT GOAL: ${mentor.learningGoal}
Use short, concise sentences perfect for spoken audio. Do not use markdown.`;

      const lengthPrompt = mentorPrefs.responseLength === "Short" 
        ? "Keep your answers very short and to the point (1-2 sentences). Do not ramble." 
        : mentorPrefs.responseLength === "Detailed" 
        ? "Provide detailed, comprehensive answers with examples and explanations." 
        : "Keep your answers balanced and conversational.";

      const initialOverrides = `
CRITICAL INITIALIZATION INSTRUCTIONS:
- You must speak entirely in ${global.preferredLanguage} starting from your very first response.
- Your teaching style is set to "${mentorPrefs.teachingStyle}".
- Your correction level is set to "${mentorPrefs.correctionLevel}".
`;

      let prompt = (cachedPrompt || basePrompt) + "\n\n" + lengthPrompt + "\n" + initialOverrides;
      
      let greeting = cachedGreeting || "Hi! I am your AI mentor. Let's get started whenever you're ready.";
      if (global.preferredLanguage === "Hindi") {
        greeting = "नमस्ते! मैं आपका एआई मेंटर हूँ। जब आप तैयार हों, हम शुरू कर सकते हैं।";
      } else if (global.preferredLanguage === "Hinglish") {
        greeting = "Hi! Main aapka AI mentor hoon. Jab aap ready ho, hum start kar sakte hain.";
      }
      
      await vapi.start({
        firstMessage: greeting,
        silenceTimeoutSeconds: 300,
        maxDurationSeconds: 1800,
        recordingEnabled: true,
        voice: {
          provider: "11labs",
          voiceId: mentor.voiceId || "21m00Tcm4TlvDq8ikWAM",
          model: "eleven_turbo_v2_5",
          speed: global.voiceSpeed
        },
        model: {
          provider: "openai",
          model: mentor.voiceModel || "gpt-4-turbo-preview",
          messages: [{ role: "system", content: prompt }],
          tools: [
            {
              type: "function",
              messages: [{ type: "request-start", content: "I'll mark that topic as complete." }, { type: "request-complete", content: "Topic is complete." }],
              function: {
                name: "update_roadmap_topic_complete",
                description: "Mark a roadmap topic as complete.",
                parameters: { type: "object", properties: { topic_id: { type: "string" } }, required: ["topic_id"] }
              }
            },
            {
              type: "function",
              messages: [{ type: "request-start", content: "I'll flag that topic for revision." }, { type: "request-complete", content: "Topic marked for revision." }],
              function: {
                name: "update_roadmap_revision_required",
                description: "Mark a roadmap topic as requiring revision.",
                parameters: { type: "object", properties: { topic_id: { type: "string" } }, required: ["topic_id"] }
              }
            },
            {
              type: "function",
              messages: [{ type: "request-start", content: "Ending the call now. Goodbye!" }],
              function: {
                name: "end_call",
                description: "End the current voice call.",
                parameters: { type: "object", properties: {} }
              }
            }
          ]
        }
      });
    } catch (err: any) {
      console.error("Vapi start crash:", err);
      setIsVoiceLoading(false);
      setCallState("idle");
      vapi.stop(); 
      if (!err.message?.includes("Duplicate DailyIframe")) {
        toast.error(err.message || "Failed to start voice call");
      }
      if (onCallEnded) onCallEnded();
    }
  }, [mentor, isVoiceActive, cachedPrompt, cachedGreeting, endCall, onCallEnded, mentorPrefs, global]);

  // Handle component unmount safely
  useEffect(() => {
    return () => {
      // We do NOT destroy the globalVapiInstance here. 
      // We only stop the call if it's currently active.
      if (globalVapiInstance && isVoiceActive) {
        try { globalVapiInstance.stop(); } catch (e) {}
      }
    };
  }, [isVoiceActive]);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    vapiRef.current?.setMuted(!isMuted);
  }, [isMuted]);

  const toggleSpeaker = useCallback(() => {
    setIsSpeakerMuted(!isSpeakerMuted);
  }, [isSpeakerMuted]);

  return {
    mounted,
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
    global,
    mentorPrefs,
    session
  };
}
