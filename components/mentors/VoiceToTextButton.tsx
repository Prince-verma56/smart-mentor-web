"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface VoiceToTextButtonProps {
  text: string;
  setText: (t: string) => void;
  isStreaming: boolean;
}

type SpeechStatus = "idle" | "listening" | "processing";

export function VoiceToTextButton({ text, setText, isStreaming }: VoiceToTextButtonProps) {
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const recognitionRef = useRef<any>(null);
  
  // Text state strictly scoped to the *current* recording session
  const textAtStartRef = useRef<string>("");
  const finalTranscriptRef = useRef<string>("");

  const destroyRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.onstart = null;
      try {
        recognitionRef.current.abort();
      } catch(e) {}
      recognitionRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return destroyRecognition;
  }, [destroyRecognition]);

  // Abort listening if the user submits the message (isStreaming becomes true)
  useEffect(() => {
    if (isStreaming && status !== "idle") {
      destroyRecognition();
      setStatus("idle");
    }
  }, [isStreaming, status, destroyRecognition]);

  const startListening = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    // Enforce fresh session state
    destroyRecognition();
    
    textAtStartRef.current = text;
    finalTranscriptRef.current = "";

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setStatus("listening");
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          let chunk = event.results[i][0].transcript;
          
          // Basic auto-capitalization for the very first word spoken
          if (finalTranscriptRef.current.length === 0 && textAtStartRef.current.length === 0) {
            chunk = chunk.charAt(0).toUpperCase() + chunk.slice(1);
          }
          
          finalTranscriptRef.current += chunk + " ";
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      const base = textAtStartRef.current;
      const combined = (base ? base + " " : "") + finalTranscriptRef.current + interimTranscript;
      
      // Clean up double spaces
      setText(combined.replace(/\s+/g, ' ').trimStart());
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      if (event.error !== 'aborted') {
        toast.error(`Speech recognition failed: ${event.error}`);
      }
      destroyRecognition();
      setStatus("idle");
    };

    recognition.onend = () => {
      // Called when recognition stops naturally or gracefully via .stop()
      destroyRecognition();
      setStatus("idle");
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error(err);
      toast.error("Failed to start speech recognition.");
      setStatus("idle");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && status === "listening") {
      setStatus("processing");
      recognitionRef.current.stop(); // Wait for final results
    }
  };

  const toggleListening = () => {
    if (status === "idle") {
      startListening();
    } else if (status === "listening") {
      stopListening();
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={isStreaming || status === "processing"}
      aria-label={status === "listening" ? "Stop listening" : "Start Voice Input"}
      title="Voice Typing"
      className={cn(
        "h-10 w-10 flex items-center justify-center rounded-lg transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] relative overflow-hidden",
        status === "listening"
          ? "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-[1.15]"
          : status === "processing"
          ? "bg-blue-500/10 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.25)]"
          : "text-foreground/70 bg-muted/30 hover:text-foreground hover:bg-muted hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-border/30 hover:border-border/60 hover:scale-[1.15] active:scale-[0.95]"
      )}
    >
      <AnimatePresence mode="wait">
        {status === "listening" ? (
          <motion.div
            key="listening"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Square className="h-4 w-4 fill-current" />
          </motion.div>
        ) : status === "processing" ? (
          <motion.div
            key="processing"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key="mic"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Mic className="h-5 w-5" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Pulse effect when listening */}
      {status === "listening" && (
        <span className="absolute inset-0 rounded-lg bg-primary/20 animate-ping" />
      )}
    </button>
  );
}
