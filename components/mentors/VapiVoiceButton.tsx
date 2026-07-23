"use client";

import { useState, useEffect, useRef } from "react";
import Vapi from "@vapi-ai/web";
import { Square, X, Loader2, AudioLines } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Mentor } from "@/types/mentor";
import { saveMessage } from "@/actions/chatActions";
import { markTopicComplete, markTopicIncomplete } from "@/actions/progressActions";
import SiriOrb from "@/components/ui/smoothui/siri-orb";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Initialize Vapi outside the component to avoid recreating it
const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "a3a65c73-9cbd-4e8a-910f-8b5c99d56177");

interface VapiVoiceButtonProps {
  mentor: Mentor;
  sessionId?: string;
  isInputIcon?: boolean;
}

export function VapiVoiceButton({ mentor, sessionId, isInputIcon = false }: VapiVoiceButtonProps) {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isVoiceLoading, setIsVoiceLoading] = useState(false);
  const [cachedPrompt, setCachedPrompt] = useState<string | null>(null);
  const [cachedGreeting, setCachedGreeting] = useState<string | null>(null);
  // Accumulates full voice transcript for end-of-call summarization
  const transcriptRef = useRef<string>("");

  const connectingMessages = ["Preparing mentor...", "Connecting...", "Mentor is joining..."];
  const [connectingMsgIndex, setConnectingMsgIndex] = useState(0);

  useEffect(() => {
    if (isVoiceLoading) {
      const interval = setInterval(() => {
        setConnectingMsgIndex(i => (i + 1) % connectingMessages.length);
      }, 800);
      return () => clearInterval(interval);
    } else {
      setConnectingMsgIndex(0);
    }
  }, [isVoiceLoading]);

  // Pre-fetch the prompt to make Voice Call start instantly
  useEffect(() => {
    async function prefetchPrompt() {
      const basePrompt = `You are ${mentor.name}, a ${mentor.role} teaching ${mentor.subject}.
TEACHING STYLE: ${mentor.conversationStyle}
STUDENT GOAL: ${mentor.learningGoal}
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

  useEffect(() => {
    vapi.on("call-start", () => {
      setIsVoiceActive(true);
      setIsVoiceLoading(false);
      transcriptRef.current = ""; // Reset transcript on new call
    });
    
    vapi.on("call-end", async () => {
      setIsVoiceActive(false);
      setIsVoiceLoading(false);

      // ── Extract voice memory in background ────────────────────────────
      const fullTranscript = transcriptRef.current.trim();
      if (fullTranscript.length > 50) {
        fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: fullTranscript,
            mentorId: mentor.id,
            sessionId: sessionId || null,
          }),
        }).catch((err) => console.warn("[Voice Summary] failed:", err));
      }
    });
    
    vapi.on("error", (e) => {
      console.error("Vapi error", e);
      setIsVoiceLoading(false);
      setIsVoiceActive(false);
      toast.error("Voice call error: " + (e.message || "Unknown error"));
    });

    // Listen for messages to sync with our database and execute tools
    vapi.on("message", async (msg: any) => {
      if (msg.type === "transcript" && msg.transcriptType === "final") {
        const speaker = msg.role === "user" ? "Student" : "Mentor";
        
        if (msg.role === "user" && sessionId) {
          await saveMessage(sessionId, "user", msg.transcript);
        } else if (msg.role === "assistant" && sessionId) {
          await saveMessage(sessionId, "assistant", msg.transcript);
        }
        
        // Accumulate full transcript for end-of-call summarization
        transcriptRef.current += `${speaker}: ${msg.transcript}\n`;
      }
      
      // Handle Client-Side Tool Calls
      if (msg.type === "tool-calls") {
        const results = [];
        for (const toolCall of msg.toolCallList) {
          try {
            if (toolCall.function.name === "update_roadmap_topic_complete") {
              const args = typeof toolCall.function.arguments === "string" 
                ? JSON.parse(toolCall.function.arguments) 
                : toolCall.function.arguments;
              
              console.log("Tool executing: complete topic", args.topic_id);
              const res = await markTopicComplete(args.topic_id);
              
              results.push({
                toolCallId: toolCall.id,
                result: 'error' in res && res.error ? `Error: ${res.error}` : "Successfully marked topic as complete."
              });
            } 
            else if (toolCall.function.name === "update_roadmap_revision_required") {
              const args = typeof toolCall.function.arguments === "string" 
                ? JSON.parse(toolCall.function.arguments) 
                : toolCall.function.arguments;
              
              console.log("Tool executing: revision required", args.topic_id);
              const res = await markTopicIncomplete(args.topic_id);
              
              results.push({
                toolCallId: toolCall.id,
                result: 'error' in res && res.error ? `Error: ${res.error}` : "Successfully marked topic for revision."
              });
            }
            else if (toolCall.function.name === "end_call") {
              console.log("Tool executing: end call");
              setIsVoiceActive(false);
              setIsVoiceLoading(false);
              vapi.stop();
              results.push({
                toolCallId: toolCall.id,
                result: "Call ended successfully."
              });
            }
          } catch (e: any) {
            console.error("Tool execution error", e);
            results.push({
              toolCallId: toolCall.id,
              result: `Error executing tool: ${e.message}`
            });
          }
        }
        
        // Send tool results back to VAPI
        if (results.length > 0) {
          vapi.send({
            type: "add-message",
            message: {
              role: "tool",
              content: JSON.stringify(results),
            }
          } as any);
        }
      }
    });

    return () => {
      vapi.removeAllListeners();
    };
  }, [sessionId]);

  const endCall = () => {
    setIsVoiceActive(false);
    setIsVoiceLoading(false);
    vapi.stop();
  };

  const handleVoiceClick = async () => {
    if (isVoiceActive) {
      endCall();
      return;
    }
    
    setIsVoiceLoading(true);
    
    try {
      const basePrompt = `You are ${mentor.name}, a ${mentor.role} teaching ${mentor.subject}.
TEACHING STYLE: ${mentor.conversationStyle}
STUDENT GOAL: ${mentor.learningGoal}
Use short, concise sentences perfect for spoken audio. Do not use markdown.`;

      let prompt = cachedPrompt;
      let greeting = cachedGreeting;
      
      if (!prompt) {
        // OPTIMIZATION: Don't block the voice connection waiting 6+ seconds for an LLM to generate a prompt.
        // Fallback to the synchronous base prompt immediately for instant connection.
        prompt = basePrompt;
        greeting = "Hi! I am your AI mentor. Let's get started whenever you're ready.";
      }
      
      await vapi.start({
        firstMessage: greeting || "Hi! I am your mentor. Are you ready to begin?",
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: "en",
          endpointing: 1500 // Adds a 1.5 second patience delay before AI responds
        },
        voice: {
          provider: "11labs",
          voiceId: mentor.voiceId || "21m00Tcm4TlvDq8ikWAM",
          model: "eleven_turbo_v2_5"
        },
        model: {
          provider: "openai",
          model: mentor.voiceModel || "gpt-4-turbo-preview",
          messages: [{ role: "system", content: prompt! }],
          tools: [
            {
              type: "function",
              messages: [
                { type: "request-start", content: "I'll mark that topic as complete for you." },
                { type: "request-complete", content: "Alright, the topic is marked as complete. You can see it on your roadmap." }
              ],
              function: {
                name: "update_roadmap_topic_complete",
                description: "Mark a roadmap topic as complete. Call this ONLY when the user explicitly agrees they understand the current topic or asks to mark it complete.",
                parameters: {
                  type: "object",
                  properties: {
                    topic_id: { type: "string", description: "The UUID of the topic to mark complete." }
                  },
                  required: ["topic_id"]
                }
              }
            },
            {
              type: "function",
              messages: [
                { type: "request-start", content: "I'll flag that topic for revision." },
                { type: "request-complete", content: "The topic has been marked for revision." }
              ],
              function: {
                name: "update_roadmap_revision_required",
                description: "Mark a roadmap topic as requiring revision or incomplete. Call this if the user is struggling or wants to go back.",
                parameters: {
                  type: "object",
                  properties: {
                    topic_id: { type: "string", description: "The UUID of the topic to mark for revision." }
                  },
                  required: ["topic_id"]
                }
              }
            },
            {
              type: "function",
              messages: [
                { type: "request-start", content: "Ending the call now. Goodbye!" }
              ],
              function: {
                name: "end_call",
                description: "End the current voice call. Call this tool when the user says goodbye, wants to hang up, or asks to end the conversation.",
                parameters: {
                  type: "object",
                  properties: {}
                }
              }
            }
          ]
        }
      });
    } catch (err: any) {
      console.error(err);
      setIsVoiceLoading(false);
      toast.error(err.message || "Failed to start voice call");
    }
  };

  const IconComponent = isVoiceLoading ? Loader2 : isVoiceActive ? Square : AudioLines;

  return (
    <>
      <Button 
        type="button"
        variant={isInputIcon ? "ghost" : (isVoiceActive ? "default" : "ghost")} 
        size={isInputIcon ? "icon" : "sm"} 
        onClick={handleVoiceClick}
        disabled={isVoiceLoading}
        title="Speak with AI Mentor"
        className={cn(
          "transition-all duration-300 rounded-full",
          isInputIcon
            ? "h-8 w-8 bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(var(--primary),0.2)]"
            : `h-7 text-[11px] gap-1.5 shrink-0 ${isVoiceActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'text-muted-foreground hover:text-foreground'}`,
          isVoiceLoading && "opacity-70 cursor-wait",
          isVoiceActive && isInputIcon && "bg-red-500/10 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:bg-red-500/20"
        )}
      >
        <IconComponent className={cn(
          isInputIcon ? "h-4 w-4" : "h-3.5 w-3.5",
          isVoiceLoading && "animate-spin",
          isVoiceActive && !isInputIcon && "fill-current"
        )} />
        {!isInputIcon && (isVoiceActive ? "End Voice" : "Voice")}
        {isInputIcon && !isVoiceActive && !isVoiceLoading && (
          <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-20" style={{ animationDuration: '3s' }} />
        )}
      </Button>

      <AnimatePresence>
        {(isVoiceActive || isVoiceLoading) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-card/95 backdrop-blur-xl border border-border shadow-2xl shadow-black/20 rounded-full px-4 py-3 pointer-events-auto"
          >
            {isVoiceLoading ? (
              <>
                <div className="relative h-9 w-9 shrink-0 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
                  <div className="absolute inset-1.5 rounded-full border-r-2 border-primary/60 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                </div>
                <div className="flex flex-col min-w-[140px]">
                   <span className="text-sm font-semibold tracking-tight">{connectingMessages[connectingMsgIndex]}</span>
                   <span className="text-[11px] text-muted-foreground">Please wait...</span>
                </div>
              </>
            ) : (
              <>
                <div className="h-10 w-10 shrink-0 flex items-center justify-center overflow-hidden rounded-full ring-1 ring-border/50">
                   <SiriOrb 
                      animationDuration={15}
                      size="40px"
                      colors={{
                        bg: "#020617",
                        c1: "#10b981", 
                        c2: "#3b82f6",
                        c3: "#8b5cf6"
                      }}
                   />
                </div>
                <div className="flex flex-col min-w-[160px] mr-2">
                  <span className="text-[13px] font-bold tracking-tight text-foreground/90 leading-tight">Speaking with {mentor.name}</span>
                  <span className="text-[11px] text-emerald-500 font-medium">The AI is listening...</span>
                </div>
              </>
            )}

            <div className="pl-3 border-l border-border/60">
              <Button 
                variant="destructive" 
                size="icon" 
                onClick={endCall}
                className="rounded-full h-9 w-9 shadow-sm shadow-red-500/20 hover:scale-105 transition-transform"
                title="End Call"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
