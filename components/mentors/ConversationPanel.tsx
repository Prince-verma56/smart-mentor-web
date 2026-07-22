import { Button } from "@/components/ui/button";
import { MessageSquare, Lightbulb, Sparkles, User, Loader2 } from "lucide-react";
import type { Mentor, MentorStats } from "@/types/mentor";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect, useRef } from "react";
import AI_Prompt from "@/components/kokonutui/ai-prompt";
import { createChatSession, saveMessage, getChatHistory } from "@/actions/chatActions";
import MaskRevealUp from "@/components/ui/smoothui/mask-reveal-up";

interface ConversationPanelProps {
  mentor: Mentor;
  stats: MentorStats;
}

const SUGGESTED_QUESTIONS = [
  "Give me an overview of today's topic.",
  "Create a practice exercise.",
  "Explain this with a real-world example.",
  "What are common mistakes to avoid?",
];

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export function ConversationPanel({ mentor, stats }: ConversationPanelProps) {
  const [messages, setMessages] = useState<{ id: string; role: string; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handlePromptSubmit = async (value: string, model: string) => {
    if (!value.trim()) return;
    
    // 1. Ensure we have a session ID
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      try {
        currentSessionId = await createChatSession(mentor.id, value.slice(0, 30));
        setSessionId(currentSessionId);
      } catch (error) {
        console.error("Failed to create session", error);
        return;
      }
    }

    // 2. Save user message to DB
    await saveMessage(currentSessionId, "user", value);

    const userMessage = { id: Date.now().toString(), role: "user", content: value };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          mentorId: mentor.id,
          model: model, // Selected dynamically from the prompt UI!
          sessionId: currentSessionId
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const assistantMessageId = (Date.now() + 1).toString();
      let assistantContent = "";
      
      // Initialize assistant message
      setMessages(current => [
        ...current, 
        { id: assistantMessageId, role: "assistant", content: "" }
      ]);
      setIsLoading(false);

      // Stream the response directly to the UI
      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;
          
          setMessages(current => 
            current.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: assistantContent }
                : msg
            )
          );
        }
      }
      
      // 3. Save assistant message to DB after stream finishes
      if (currentSessionId && assistantContent) {
        await saveMessage(currentSessionId, "assistant", assistantContent);
      }
      
    } catch (error) {
      console.error("Chat error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Main Conversation Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8">
        
        {/* Empty State / Welcome Screen */}
        <div className="flex flex-col items-center justify-center text-center mt-12 mb-8 max-w-2xl mx-auto space-y-6">
          <Avatar className="h-16 w-16 ring-4 ring-primary/10">
            {mentor.avatarUrl ? (
              <img src={mentor.avatarUrl} alt={mentor.name} className="object-cover" />
            ) : null}
            <AvatarFallback
              style={{ backgroundColor: mentor.avatarColor }}
              className="text-white text-xl font-bold"
            >
              {getInitials(mentor.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-2">
            <MaskRevealUp className="text-2xl font-semibold tracking-tight">
              {`Chat with ${mentor.name}`}
            </MaskRevealUp>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Your {mentor.subject} mentor is ready. Currently covering{" "}
              <span className="font-medium text-foreground">{stats.currentTopic}</span>.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-8">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                className="flex items-center gap-3 text-left p-4 rounded-xl border bg-card hover:bg-muted/50 transition-all hover:border-primary/30 group shadow-sm"
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {q}
                </span>
              </button>
            ))}
          </div>
        </div>
        
        {messages.length > 0 && (
          <div className="max-w-3xl mx-auto space-y-6 mt-8 pb-12">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-4 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <Avatar className="h-8 w-8 ring-1 ring-primary/10 shrink-0">
                    <AvatarFallback style={{ backgroundColor: mentor.avatarColor }} className="text-white text-xs">
                      {getInitials(mentor.name)}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`rounded-2xl px-5 py-3 max-w-[85%] ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted rounded-bl-none text-foreground border shadow-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <Avatar className="h-8 w-8 ring-1 ring-primary/10 shrink-0">
                  <AvatarFallback style={{ backgroundColor: mentor.avatarColor }} className="text-white text-xs">
                    {getInitials(mentor.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-2xl px-5 py-3 max-w-[85%] bg-muted rounded-bl-none border shadow-sm flex items-center justify-center min-w-[80px]">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:px-8 pb-8 lg:pb-12 bg-background border-t shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-center">
          <AI_Prompt
            className="w-full"
            onSubmit={handlePromptSubmit}
            placeholder={`Ask ${mentor.name} anything...`}
            headerText="Powered by Groq"
            headerAction="Online"
            models={["llama3-8b-8192", "llama3-70b-8192", "mixtral-8x7b-32768"]}
            defaultModel="llama3-8b-8192"
          />
        </div>
      </div>
    </div>
  );
}
