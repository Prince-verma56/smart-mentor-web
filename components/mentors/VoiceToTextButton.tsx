"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface VoiceToTextButtonProps {
  onTranscript: (text: string) => void;
  isStreaming: boolean;
}

export function VoiceToTextButton({ onTranscript, isStreaming }: VoiceToTextButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Setup Speech Recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            onTranscript(transcript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          toast.error("Speech recognition failed. Please try again.");
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (!recognitionRef.current && typeof window !== "undefined") return null;

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={isStreaming}
      aria-label={isListening ? "Stop listening" : "Start Voice Input"}
      title="Voice Typing"
      className={cn(
        "h-7 w-7 flex items-center justify-center rounded-lg transition-all",
        isListening
          ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
          : "text-muted-foreground/50 hover:text-foreground hover:bg-muted"
      )}
    >
      <AnimatePresence mode="wait">
        {isListening ? (
          <motion.div
            key="listening"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Square className="h-3 w-3 fill-current" />
          </motion.div>
        ) : (
          <motion.div
            key="mic"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Mic className="h-3.5 w-3.5" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Pulse effect when listening */}
      {isListening && (
        <span className="absolute h-7 w-7 rounded-lg bg-red-500/20 animate-ping" />
      )}
    </button>
  );
}
