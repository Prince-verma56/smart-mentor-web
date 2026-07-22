"use client";

import { useState, useEffect } from "react";
import Vapi from "@vapi-ai/web";
import { Mic, Loader2, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Mentor } from "@/types/mentor";
import { saveMessage } from "@/actions/chatActions";
import { markTopicComplete, markTopicIncomplete } from "@/actions/progressActions";
import SiriOrb from "@/components/ui/smoothui/siri-orb";
import { motion, AnimatePresence } from "framer-motion";

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

  // Pre-fetch the prompt to make Voice Call start instantly
  useEffect(() => {
    async function prefetchPrompt() {
      const basePrompt = `You are ${mentor.name}, a ${mentor.role} teaching ${mentor.subject}.
TEACHING STYLE: ${mentor.conversation_style}
STUDENT GOAL: ${mentor.learning_goal}
Use short, concise sentences perfect for spoken audio. Do not use markdown.`;

      try {
        const res = await fetch(`/api/vapi/prompt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mentorId: mentor.id, basePrompt, sessionId })
        });
        if (res.ok) {
          const { prompt } = await res.json();
          setCachedPrompt(prompt);
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
    });
    
    vapi.on("call-end", () => {
      setIsVoiceActive(false);
      setIsVoiceLoading(false);
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
        if (msg.role === "user" && sessionId) {
          await saveMessage(sessionId, "user", msg.transcript);
        }
      }
      if (msg.type === "message" && msg.message?.role === "assistant" && sessionId) {
        await saveMessage(sessionId, "assistant", msg.message.content);
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
                result: res.error ? `Error: ${res.error}` : "Successfully marked topic as complete."
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
                result: res.error ? `Error: ${res.error}` : "Successfully marked topic for revision."
              });
            }
            else if (toolCall.function.name === "end_call") {
              console.log("Tool executing: end call");
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
            type: "tool-call-result",
            toolCallList: results
          });
        }
      }
    });

    return () => {
      vapi.removeAllListeners();
    };
  }, [sessionId]);

  const handleVoiceClick = async () => {
    if (isVoiceActive) {
      vapi.stop();
      return;
    }
    
    setIsVoiceLoading(true);
    
    try {
      const basePrompt = `You are ${mentor.name}, a ${mentor.role} teaching ${mentor.subject}.
TEACHING STYLE: ${mentor.conversation_style}
STUDENT GOAL: ${mentor.learning_goal}
Use short, concise sentences perfect for spoken audio. Do not use markdown.`;

      let prompt = cachedPrompt;
      
      if (!prompt) {
        // Fallback fetch if not cached yet
        const res = await fetch(`/api/vapi/prompt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mentorId: mentor.id, basePrompt, sessionId })
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch learning state: ${errorText}`);
        }
        const data = await res.json();
        prompt = data.prompt;
        setCachedPrompt(data.prompt);
      }
      
      // Start VAPI call
      await vapi.start({
        model: {
          provider: "openai",
          model: "gpt-4-turbo-preview",
          messages: [{ role: "system", content: prompt }],
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
        },
        voice: {
          provider: "11labs",
          voiceId: mentor.voice_id || "21m00Tcm4TlvDq8ikWAM"
        }
      });
    } catch (err: any) {
      console.error(err);
      setIsVoiceLoading(false);
      toast.error(err.message || "Failed to start voice call");
    }
  };

  const IconComponent = isVoiceLoading ? Loader2 : isVoiceActive ? Square : Mic;

  return (
    <>
      <Button 
        variant={isInputIcon ? "ghost" : (isVoiceActive ? "default" : "ghost")} 
        size={isInputIcon ? "icon" : "sm"} 
        onClick={handleVoiceClick}
        disabled={isVoiceLoading}
        className={isInputIcon ? 
          `h-8 w-8 rounded-full ${isVoiceActive ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'}` 
          : 
          `h-7 text-[11px] gap-1.5 rounded-full shrink-0 ${isVoiceActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'text-muted-foreground hover:text-foreground'}`
        }
      >
        <IconComponent className={`${isInputIcon ? 'h-4 w-4' : 'h-3.5 w-3.5'} ${isVoiceLoading ? 'animate-spin' : ''} ${isVoiceActive && !isInputIcon ? 'fill-current' : ''}`} />
        {!isInputIcon && (isVoiceActive ? "End Voice" : "Voice")}
      </Button>

      <AnimatePresence>
        {isVoiceActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm"
          >
            <div className="absolute top-8 right-8">
              <Button variant="ghost" size="icon" onClick={() => vapi.stop()} className="rounded-full h-12 w-12 hover:bg-red-500/10 hover:text-red-500">
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center gap-12 w-full max-w-md mx-auto">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-semibold tracking-tight">Speaking with {mentor.name}</h2>
                <p className="text-muted-foreground">The AI is listening and will respond shortly.</p>
              </div>

              <div className="h-64 w-64 flex items-center justify-center">
                 <SiriOrb 
                    animationDuration={15}
                    size="250px"
                    colors={{
                      bg: "#1a1a1a",
                      c1: "#ff3b30",
                      c2: "#ff9500",
                      c3: "#ffcc00"
                    }}
                 />
              </div>

              <Button 
                variant="destructive" 
                size="lg" 
                onClick={() => vapi.stop()}
                className="rounded-full px-8 shadow-lg shadow-red-500/20"
              >
                <Square className="h-4 w-4 mr-2 fill-current" />
                End Call
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
