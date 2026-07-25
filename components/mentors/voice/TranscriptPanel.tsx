import { motion, AnimatePresence } from "framer-motion";
import { ConversationState } from "./useVoiceSession";
import { Sparkles, User } from "lucide-react";

interface TranscriptPanelProps {
  transcript: { text: string; role: "user" | "assistant" | null };
  callState: ConversationState;
}

export function TranscriptPanel({ transcript, callState }: TranscriptPanelProps) {
  const isTranscribing = transcript.text.length > 0;
  const isAI = transcript.role === "assistant";

  return (
    <div className="h-28 w-full max-w-3xl px-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
      <AnimatePresence mode="wait">
        {isTranscribing ? (
          <motion.div
            key={transcript.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-2"
          >
            <div className={`flex items-center gap-1.5 text-xs font-semibold tracking-wide ${isAI ? 'text-primary' : 'text-emerald-400'}`}>
              {isAI ? <Sparkles className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
              {isAI ? "AI is speaking" : "You"}
            </div>
            <p className={`text-xl md:text-2xl font-normal leading-relaxed ${isAI ? 'text-foreground/90' : 'text-emerald-50/90'}`}>
              {transcript.text}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex items-center justify-center"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
