"use client";

import { Button } from "@/components/ui/button";
import {
  MessageSquare, Sparkles, User, Loader2, Copy, Bookmark, RefreshCcw,
  HelpCircle, Code2, GraduationCap, Plus, Mic, FileText, Image as ImageIcon,
  Video, Brain, Globe, Zap, CheckCircle2, RotateCcw
} from "lucide-react";
import type { Mentor, MentorStats } from "@/types/mentor";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect, useRef } from "react";
import AI_Prompt from "@/components/kokonutui/ai-prompt";
import MaskRevealUp from "@/components/ui/smoothui/mask-reveal-up";
import { useUser } from "@clerk/nextjs";
import { Separator } from "@/components/ui/separator";
import { getChatSessions, getChatHistory, createChatSession, saveMessage, deleteChatSession } from "@/actions/chatActions";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { toast } from "sonner";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { VapiVoiceButton } from "./VapiVoiceButton";

// ─── Loading Steps ────────────────────────────────────────────────────────────

const LOADING_STEPS = [
  { icon: "👤", text: "Reading mentor profile..." },
  { icon: "🗺️", text: "Checking your roadmap..." },
  { icon: "📊", text: "Reviewing progress..." },
  { icon: "💬", text: "Scanning conversation history..." },
  { icon: "🧠", text: "Generating response..." },
];

interface ConversationPanelProps {
  mentor: Mentor;
  stats: MentorStats;
}

const getSuggestedQuestions = (subject: string, currentTopic?: string) => [
  currentTopic ? `Explain ${currentTopic} to me` : `What should I learn first in ${subject}?`,
  "Where are we in my roadmap?",
  "What have we completed so far?",
  "What should I study today?",
  "Give me a quiz on the current topic",
];

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function MessageActions({ content, onAction }: { content: string, onAction?: (action: string) => void }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" title="Copy" onClick={handleCopy}>
        {copied ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
      </Button>
      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" title="Bookmark">
        <Bookmark className="h-3 w-3" />
      </Button>
      <Separator orientation="vertical" className="h-3 mx-1" />
      <Button variant="ghost" size="sm" onClick={() => onAction?.("explain")} className="h-6 text-xs text-muted-foreground hover:text-foreground gap-1">
        <HelpCircle className="h-3 w-3" /> Explain More
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onAction?.("practice")} className="h-6 text-xs text-muted-foreground hover:text-foreground gap-1">
        <Code2 className="h-3 w-3" /> Practice
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onAction?.("quiz")} className="h-6 text-xs text-muted-foreground hover:text-foreground gap-1">
        <GraduationCap className="h-3 w-3" /> Quiz Me
      </Button>
    </div>
  );
}

export function ConversationPanel({ mentor, stats }: ConversationPanelProps) {
  const { user } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [status, setStatus] = useState<"ready" | "submitted" | "streaming" | "error">("ready");
  const [loadingStep, setLoadingStep] = useState(0);
  const [sessions, setSessions] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const sessionQuery = searchParams.get("session");

  useEffect(() => {
    if (sessionQuery && sessionQuery !== sessionId) {
      setSessionId(sessionQuery);
      setIsCreatingNew(false);
    }
  }, [sessionQuery]);

  const suggestedQuestions = getSuggestedQuestions(mentor.subject, stats.currentTopic);

  // Fetch sessions
  useEffect(() => {
    if (!user) return;
    getChatSessions(mentor.id)
      .then((data) => setSessions(data))
      .catch((err) => console.error("Failed to load sessions:", err));
  }, [user, mentor.id]);

  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Auto-select latest session on mount, but respect "New Chat" explicit action
  useEffect(() => {
    if (sessions.length > 0 && !sessionId && !isCreatingNew) {
      setSessionId(sessions[0].id);
    }
  }, [sessions, sessionId, isCreatingNew]);

  // Load chat history when session changes
  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      return;
    }
    getChatHistory(sessionId)
      .then((data) => setMessages(data))
      .catch((err) => console.error("Failed to load history:", err));
  }, [sessionId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status, loadingStep]);

  // Animate loading steps
  useEffect(() => {
    if (status === "submitted" || status === "streaming") {
      setLoadingStep(0);
      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 600);
      return () => clearInterval(interval);
    } else {
      setLoadingStep(0);
    }
  }, [status]);

  const handleDeleteSession = async () => {
    if (!sessionId || !user) return;
    if (!window.confirm("Delete this conversation?")) return;
    await deleteChatSession(sessionId, mentor.id);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("session");
    router.push(`${pathname}?${newParams.toString()}`);
    toast.success("Conversation deleted.");
  };

  const handleNewSession = async () => {
    setIsCreatingNew(true);
    setSessionId(null);
    setMessages([]);
    try {
      const newSessionId = await createChatSession(mentor.id, "New Conversation");
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("session", newSessionId);
      router.push(`${pathname}?${newParams.toString()}`);
      setIsCreatingNew(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to start new chat");
      setIsCreatingNew(false);
    }
  };

  const handlePromptSubmit = async (value: string, model: string, action?: string) => {
    if ((!value.trim() && !action) || !user) return;

    // Use a synthetic message for actions if no value is provided
    const displayValue = action ? `*Requested: ${action}*` : value;
    const newUserMessage = { id: Date.now().toString(), role: "user", content: displayValue };
    setMessages((prev) => [...prev, newUserMessage]);
    setStatus("submitted");

    let currentSessionId = sessionId;
    if (!currentSessionId) {
      try {
        currentSessionId = await createChatSession(mentor.id, value.slice(0, 40));
        setSessionId(currentSessionId);
      } catch {
        setStatus("error");
        toast.error("Failed to create session.");
        return;
      }
    }

    await saveMessage(currentSessionId!, "user", value);

    const chatBody = {
      messages: [...messages, newUserMessage].map((m) => ({ role: m.role, content: m.content })),
      mentorId: mentor.id,
      sessionId: currentSessionId,
      model: model || "llama-3.1-8b-instant",
      action: action,
    };

    try {
      setStatus("streaming");

      const tempId = `temp-${Date.now()}`;
      setMessages((prev) => [...prev, { id: tempId, role: "assistant", content: "" }]);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chatBody),
      });

      if (!res.ok) throw new Error(`API Error ${res.status}`);
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantText += chunk;

        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last && last.role === "assistant") {
            last.content = assistantText;
          }
          return next;
        });
      }

      assistantText += decoder.decode();
      if (!assistantText) assistantText = "[No response received]";

      await saveMessage(currentSessionId!, "assistant", assistantText);

      // Tool calls are now handled by the python orchestrator.
      // We don't need to manually parse the stream for regex tags anymore.
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last && last.role === "assistant" && !last.content) {
          last.content = "Sorry, I encountered an error. Please try again.";
        }
        return next;
      });
      toast.error("Connection error. Please try again.");
    } finally {
      setStatus("ready");
    }
  };

  const handleQuestionClick = (q: string) => {
    handlePromptSubmit(q, "llama-3.1-8b-instant");
  };

  const isThinking = (status === "submitted" || status === "streaming") &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "user";

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Session Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {sessionId && messages.length > 0 && (
          <>
            <Button variant="outline" size="sm" onClick={handleNewSession} className="gap-1.5 bg-background/80 backdrop-blur-sm text-xs h-7">
              <Plus className="h-3 w-3" /> New Chat
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeleteSession} className="bg-background/80 backdrop-blur-sm text-destructive hover:bg-destructive hover:text-destructive-foreground text-xs h-7">
              Delete
            </Button>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8" data-lenis-prevent="true">
        {messages.length === 0 ? (
          // Welcome Screen
          <div className="flex flex-col mt-4 max-w-3xl mx-auto space-y-8 px-4">
            <div className="space-y-3">
              <MaskRevealUp className="text-3xl font-bold tracking-tight">
                {`👋 Hi ${user?.firstName || "there"}!`}
              </MaskRevealUp>
              <p className="text-xl text-muted-foreground">
                I'm your <span className="font-semibold text-foreground">{mentor.role}</span>.
              </p>
              {stats.currentTopic && stats.currentTopic !== "Introduction" && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-200 dark:border-blue-800">
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    📍 Currently on: {stats.currentTopic}
                  </span>
                </div>
              )}
              {stats.progressPercent > 0 && (
                <p className="text-sm text-muted-foreground">
                  You're <span className="font-semibold text-foreground">{stats.progressPercent}%</span> through your roadmap.
                  {stats.completedTopics > 0 && ` ${stats.completedTopics} lessons completed!`}
                </p>
              )}
            </div>

            <Separator className="my-4" />

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Suggested Questions</h3>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuestionClick(q)}
                    className="text-left px-4 py-2 text-sm rounded-full border bg-muted/20 hover:bg-muted/50 hover:border-primary/30 transition-all duration-200"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Chat Messages
          <div className="max-w-3xl mx-auto space-y-6 pb-12">
            {messages.map((m: any, index: number) => (
              <div
                key={m.id}
                className={cn(
                  "group flex gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
                  m.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {m.role === "assistant" && (
                  <Avatar className="h-8 w-8 ring-1 ring-primary/10 shrink-0 mt-1">
                    {mentor.avatarUrl ? (
                      <img src={mentor.avatarUrl} alt={mentor.name} className="object-cover" />
                    ) : null}
                    <AvatarFallback
                      style={{ backgroundColor: mentor.avatarColor }}
                      className="text-white text-xs font-semibold"
                    >
                      {getInitials(mentor.name)}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={cn("flex flex-col max-w-[85%]", m.role === "user" ? "items-end" : "items-start")}>
                  <div
                    className={cn(
                      "rounded-2xl px-5 py-3.5 overflow-hidden",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-card rounded-bl-sm text-foreground border shadow-sm"
                    )}
                  >
                    <div className="text-sm leading-relaxed relative">
                      {m.role === "user" ? (
                        <span className="whitespace-pre-wrap">{m.content}</span>
                      ) : (
                        <>
                          <MarkdownRenderer content={m.content} />
                          {/* Streaming cursor */}
                          {index === messages.length - 1 &&
                            (status === "submitted" || status === "streaming") &&
                            m.content.length > 0 && (
                              <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-middle" />
                            )}
                        </>
                      )}
                    </div>
                  </div>

                  {m.role === "assistant" && m.content && (
                    <MessageActions 
                      content={m.content} 
                      onAction={(act) => handlePromptSubmit("", "llama-3.1-8b-instant", act)} 
                    />
                  )}
                </div>

                {m.role === "user" && (
                  <Avatar className="h-8 w-8 ring-1 ring-primary/10 shrink-0 mt-1">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                      {user?.firstName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {/* Intelligent Loading Animation */}
            {isThinking && (
              <div className="flex gap-3 justify-start animate-in fade-in-0 duration-200">
                <Avatar className="h-8 w-8 ring-1 ring-primary/10 shrink-0 mt-1">
                  {mentor.avatarUrl ? (
                    <img src={mentor.avatarUrl} alt={mentor.name} className="object-cover" />
                  ) : null}
                  <AvatarFallback
                    style={{ backgroundColor: mentor.avatarColor }}
                    className="text-white text-xs font-semibold"
                  >
                    {getInitials(mentor.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="rounded-2xl rounded-bl-sm px-5 py-4 bg-card border shadow-sm min-w-[220px]">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-3">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                    <span>{mentor.name} is thinking...</span>
                  </div>
                  <div className="space-y-2">
                    {LOADING_STEPS.map((step, i) => (
                      <div key={i} className={cn(
                        "flex items-center gap-2 text-xs transition-all duration-300",
                        i < loadingStep && "text-muted-foreground/50 line-through",
                        i === loadingStep && "text-foreground",
                        i > loadingStep && "text-muted-foreground/30"
                      )}>
                        {i < loadingStep ? (
                          <span className="text-emerald-500 text-[10px]">✓</span>
                        ) : i === loadingStep ? (
                          <Loader2 className="h-3 w-3 animate-spin text-primary" />
                        ) : (
                          <span className="h-3 w-3" />
                        )}
                        <span>{step.icon} {step.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="px-4 pb-6 pt-2 bg-background border-t shrink-0 flex flex-col gap-2 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide px-2">
          <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1.5 rounded-full text-muted-foreground hover:text-foreground shrink-0" disabled title="Coming soon">
            <Plus className="h-3.5 w-3.5" /> Upload
          </Button>
          
          {[
            { icon: <FileText className="h-3.5 w-3.5" />, label: "Add PDF" },
            { icon: <ImageIcon className="h-3.5 w-3.5" />, label: "Image" },
            { icon: <Video className="h-3.5 w-3.5" />, label: "Video" },
          ].map(({ icon, label }) => (
            <Button key={label} variant="ghost" size="sm" className="h-7 text-[11px] gap-1.5 rounded-full text-muted-foreground hover:text-foreground shrink-0" disabled title="Coming soon">
              {icon} {label}
            </Button>
          ))}
          <Separator orientation="vertical" className="h-4 mx-1" />
          {[
            { icon: <Code2 className="h-3.5 w-3.5" />, label: "Code Mode" },
            { icon: <Brain className="h-3.5 w-3.5" />, label: "Deep Think" },
            { icon: <Globe className="h-3.5 w-3.5" />, label: "Search Web" },
            { icon: <Zap className="h-3.5 w-3.5" />, label: "Live Mode" },
          ].map(({ icon, label }) => (
            <Button key={label} variant="ghost" size="sm" className="h-7 text-[11px] gap-1.5 rounded-full text-muted-foreground hover:text-foreground shrink-0" disabled title="Coming soon">
              {icon} {label}
            </Button>
          ))}
        </div>

        <AI_Prompt
          onSubmit={handlePromptSubmit}
          placeholder={`Ask ${mentor.name} anything...`}
          headerText="Powered by Groq"
          headerAction="Online"
          models={["llama-3.1-8b-instant", "llama3-8b-8192", "llama3-70b-8192", "mixtral-8x7b-32768"]}
          defaultModel="llama-3.1-8b-instant"
          className="py-0"
          voiceButton={<VapiVoiceButton mentor={mentor} sessionId={sessionId || undefined} isInputIcon={true} />}
        />
      </div>
    </div>
  );
}
