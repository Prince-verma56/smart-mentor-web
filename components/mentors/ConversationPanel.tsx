import { Button } from "@/components/ui/button";
import { MessageSquare, Lightbulb, Sparkles, User, Loader2, Copy, Bookmark, RefreshCcw, HelpCircle, Code2, GraduationCap, Plus, Mic, FileText, Image as ImageIcon, Video, Brain, Globe, Zap } from "lucide-react";
import type { Mentor, MentorStats } from "@/types/mentor";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect, useRef } from "react";
import AI_Prompt from "@/components/kokonutui/ai-prompt";
import MaskRevealUp from "@/components/ui/smoothui/mask-reveal-up";
import { useUser } from "@clerk/nextjs";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useChat } from "@ai-sdk/react";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

interface ConversationPanelProps {
  mentor: Mentor;
  stats: MentorStats;
}

const getSuggestedQuestions = (subject: string) => [
  `Explain ${subject} Hooks`,
  `Create Authentication`,
  `Teach JWT`,
  `Roadmap for ${subject}`,
  `Interview Questions`,
];

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export function ConversationPanel({ mentor, stats }: ConversationPanelProps) {
  const { user } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const suggestedQuestions = getSuggestedQuestions(mentor.subject);
  const mentorTopics = mentor.knowledgeFocus ? mentor.knowledgeFocus.split(',').map(t => t.trim()) : ["React", "Next.js", "Node.js", "Express", "MongoDB"];

  // Convex Queries & Mutations
  const sessions = useQuery(api.chats.getSessions, user ? { mentorId: mentor.id, userId: user.id } : "skip");
  const history = useQuery(api.chats.getMessages, sessionId ? { sessionId } : "skip");
  
  const createSession = useMutation(api.chats.createSession);
  const saveMessage = useMutation(api.chats.saveMessage);
  const deleteSession = useMutation(api.chats.deleteSession);

  // useChat Integration
  const { messages, setMessages, status, append, sendMessage } = useChat({
    api: "/api/chat",
    body: {
      mentorId: mentor.id,
      sessionId: sessionId,
      model: "llama-3.1-8b-instant"
    },
    streamProtocol: "text",
    onFinish: async (message: any) => {
      if (sessionId) {
        await saveMessage({ sessionId, role: "assistant", content: message.content });
      }
    }
  } as any) as any;

  // Load the latest chat session on mount or session change
  useEffect(() => {
    if (sessions && sessions.length > 0 && !sessionId) {
      setSessionId(sessions[0]._id);
    }
  }, [sessions, sessionId]);

  // Sync Convex history to useChat state
  useEffect(() => {
    if (history) {
      const formattedHistory = history.map((msg: any) => ({
        id: msg._id,
        role: msg.role,
        content: msg.content
      }));
      setMessages(formattedHistory);
    } else {
      setMessages([]);
    }
  }, [history, setMessages]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, status, loadingStep]);

  // Loading Steps Animation
  useEffect(() => {
    if (status === 'submitted' || status === 'streaming') {
      setLoadingStep(0);
      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 2 ? prev + 1 : prev));
      }, 800);
      return () => clearInterval(interval);
    }
  }, [status]);

  const handleDeleteSession = async () => {
    if (!sessionId || !user) return;
    const confirmed = window.confirm("Are you sure you want to delete this conversation?");
    if (!confirmed) return;
    
    await deleteSession({ sessionId, userId: user.id });
    setSessionId(null);
    setMessages([]);
  };

  const handleNewSession = () => {
    setSessionId(null);
    setMessages([]);
  };

  const handlePromptSubmit = async (value: string, model: string) => {
    if (!value.trim() || !user) return;
    
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      try {
        currentSessionId = await createSession({
          mentorId: mentor.id,
          userId: user.id,
          title: value.slice(0, 30)
        });
        setSessionId(currentSessionId);
      } catch (error) {
        console.error("Failed to create session", error);
        return;
      }
    }

    // Save user message to Convex
    await saveMessage({ sessionId: currentSessionId, role: "user", content: value });

    // Append to useChat (this triggers the API call automatically)
    if (append) {
      append({ role: "user", content: value });
    } else if (sendMessage) {
      sendMessage({ role: "user", content: value });
    } else {
      console.error("Neither append nor sendMessage is available on useChat");
    }
  };

  const handleQuestionClick = (q: string) => {
     handlePromptSubmit(q, "llama-3.1-8b-instant");
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Session Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {sessionId && messages.length > 0 && (
          <>
            <Button variant="outline" size="sm" onClick={handleNewSession} className="gap-2 bg-background/80 backdrop-blur-sm">
              New Chat
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeleteSession} className="bg-background/80 backdrop-blur-sm text-destructive hover:bg-destructive hover:text-destructive-foreground">
              Delete
            </Button>
          </>
        )}
      </div>

      {/* Main Conversation Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8" data-lenis-prevent="true">
        
        {messages.length === 0 ? (
          /* Empty State / Welcome Screen */
          <div className="flex flex-col mt-4 max-w-3xl mx-auto space-y-8 px-4">
            <div className="space-y-3">
              <MaskRevealUp className="text-3xl font-bold tracking-tight">
                {`👋 Hi ${user?.firstName || 'there'}!`}
              </MaskRevealUp>
              <p className="text-xl text-muted-foreground">
                I'm your <span className="font-semibold text-foreground">{mentor.role}</span>.
              </p>
              <p className="text-muted-foreground text-sm">Today I'll help you with:</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground flex flex-wrap gap-x-6 gap-y-2 pt-2">
                {mentorTopics.map((topic, i) => (
                  <li key={i}>{topic}</li>
                ))}
              </ul>
            </div>

            <Separator className="my-8" />
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Suggested Questions</h3>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuestionClick(q)}
                    className="text-left px-4 py-2 text-sm rounded-full border bg-muted/20 hover:bg-muted transition-colors hover:border-primary/30"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <div className="max-w-3xl mx-auto space-y-8 pb-12">
            {messages.map((m: any, index: number) => (
              <div
                key={m.id}
                className={`group flex gap-4 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <Avatar className="h-8 w-8 ring-1 ring-primary/10 shrink-0 mt-1">
                    {mentor.avatarUrl ? (
                      <img src={mentor.avatarUrl} alt={mentor.name} className="object-cover" />
                    ) : null}
                    <AvatarFallback style={{ backgroundColor: mentor.avatarColor }} className="text-white text-xs">
                      {getInitials(mentor.name)}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`flex flex-col gap-2 max-w-[85%] ${m.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`rounded-2xl px-5 py-3.5 overflow-hidden ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted/50 rounded-bl-sm text-foreground border shadow-sm"
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap leading-relaxed relative">
                      {m.role === "user" ? (
                        m.content
                      ) : (
                        <MarkdownRenderer content={m.content} />
                      )}
                      {/* Streaming cursor */}
                      {index === messages.length - 1 && m.role === "assistant" && (status === 'submitted' || status === 'streaming') && !m.content.endsWith(" ") && m.content.length > 0 && (
                        <span className="inline-block w-1 h-4 bg-primary ml-1 animate-pulse align-middle" />
                      )}
                    </div>
                  </div>
                  
                  {/* Hover Actions */}
                  {m.role === "assistant" && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" title="Copy" onClick={() => navigator.clipboard.writeText(m.content)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" title="Bookmark">
                        <Bookmark className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" title="Regenerate">
                        <RefreshCcw className="h-3 w-3" />
                      </Button>
                      <Separator orientation="vertical" className="h-3 mx-1" />
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground hover:text-foreground gap-1">
                        <HelpCircle className="h-3 w-3" /> Explain More
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground hover:text-foreground gap-1">
                        <Code2 className="h-3 w-3" /> Practice
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground hover:text-foreground gap-1">
                        <GraduationCap className="h-3 w-3" /> Quiz Me
                      </Button>
                    </div>
                  )}
                </div>
                
                {m.role === "user" && (
                  <Avatar className="h-8 w-8 ring-1 ring-primary/10 shrink-0 mt-1">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                       {user?.firstName?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {/* AI Thinking Animation */}
            {(status === 'submitted' || status === 'streaming') && messages.length > 0 && messages[messages.length - 1].role === "user" && (
              <div className="flex gap-4 justify-start">
                <Avatar className="h-8 w-8 ring-1 ring-primary/10 shrink-0 mt-1">
                  {mentor.avatarUrl ? (
                    <img src={mentor.avatarUrl} alt={mentor.name} className="object-cover" />
                  ) : null}
                  <AvatarFallback style={{ backgroundColor: mentor.avatarColor }} className="text-white text-xs">
                    {getInitials(mentor.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-2xl px-5 py-3.5 max-w-[85%] bg-muted/50 rounded-bl-sm border shadow-sm flex flex-col gap-1.5 min-w-[160px]">
                   <div className="flex items-center gap-2 text-xs font-medium text-primary mb-1">
                     <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                     <span>AI Thinking...</span>
                   </div>
                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {loadingStep === 0 && <Loader2 className="h-3 w-3 animate-spin" />}
                      {loadingStep > 0 ? <span className="text-green-500">✓</span> : null}
                      <span className={loadingStep > 0 ? "line-through opacity-70" : ""}>Reading Context</span>
                   </div>
                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {loadingStep === 1 && <Loader2 className="h-3 w-3 animate-spin" />}
                      {loadingStep > 1 ? <span className="text-green-500">✓</span> : null}
                      <span className={loadingStep > 1 ? "line-through opacity-70" : ""}>Searching Notes</span>
                   </div>
                   {loadingStep >= 2 && (
                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Generating Answer</span>
                     </div>
                   )}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="px-4 pb-6 pt-2 bg-background border-t shrink-0 flex flex-col gap-2 max-w-4xl mx-auto w-full">
        {/* Toolbar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide px-2">
           <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1.5 rounded-full text-muted-foreground hover:text-foreground shrink-0" disabled title="Coming soon">
             <Plus className="h-3.5 w-3.5" /> Upload
           </Button>
           <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1.5 rounded-full text-muted-foreground hover:text-foreground shrink-0" disabled title="Coming soon">
             <Mic className="h-3.5 w-3.5" /> Voice
           </Button>
           <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1.5 rounded-full text-muted-foreground hover:text-foreground shrink-0" disabled title="Coming soon">
             <FileText className="h-3.5 w-3.5" /> Add PDF
           </Button>
           <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1.5 rounded-full text-muted-foreground hover:text-foreground shrink-0" disabled title="Coming soon">
             <ImageIcon className="h-3.5 w-3.5" /> Image
           </Button>
           <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1.5 rounded-full text-muted-foreground hover:text-foreground shrink-0" disabled title="Coming soon">
             <Video className="h-3.5 w-3.5" /> Video
           </Button>
           <Separator orientation="vertical" className="h-4 mx-1" />
           <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1.5 rounded-full text-muted-foreground hover:text-foreground shrink-0" disabled title="Coming soon">
             <Code2 className="h-3.5 w-3.5" /> Code Mode
           </Button>
           <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1.5 rounded-full text-muted-foreground hover:text-foreground shrink-0" disabled title="Coming soon">
             <Brain className="h-3.5 w-3.5" /> Deep Think
           </Button>
           <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1.5 rounded-full text-muted-foreground hover:text-foreground shrink-0" disabled title="Coming soon">
             <Globe className="h-3.5 w-3.5" /> Search Web
           </Button>
           <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1.5 rounded-full text-muted-foreground hover:text-foreground shrink-0" disabled title="Coming soon">
             <Zap className="h-3.5 w-3.5" /> Live Mode
           </Button>
        </div>
        
        <AI_Prompt
          onSubmit={handlePromptSubmit}
          placeholder={`Ask ${mentor.name} anything...`}
          headerText="Powered by Groq"
          headerAction="Online"
          models={["llama-3.1-8b-instant", "llama3-8b-8192", "llama3-70b-8192", "mixtral-8x7b-32768"]}
          defaultModel="llama-3.1-8b-instant"
          className="py-0"
        />
      </div>
    </div>
  );
}
