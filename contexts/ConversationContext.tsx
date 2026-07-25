"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import {
  getChatSessions,
  getChatHistory,
  createChatSession,
  saveMessage,
  deleteChatSession,
  renameChatSession,
  pinChatSession,
  archiveChatSession,
  favoriteChatSession,
  duplicateChatSession,
} from "@/actions/chatActions";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import type { ChatSession, Message } from "@/types/session";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ConversationContextValue {
  // Sessions list
  sessions: ChatSession[];
  isLoadingSessions: boolean;

  // Active session
  activeSessionId: string | null;
  messages: Message[];
  isLoadingMessages: boolean;
  isStreaming: boolean;

  // Actions
  setActiveSession: (id: string) => void;
  createNewSession: () => Promise<string | null>;
  deleteSession: (id: string) => Promise<void>;
  renameSession: (id: string, title: string) => Promise<void>;
  pinSession: (id: string, pinned: boolean) => Promise<void>;
  archiveSession: (id: string, archived: boolean) => Promise<void>;
  favoriteSession: (id: string, fav: boolean) => Promise<void>;
  duplicateSession: (id: string) => Promise<string | null>;

  // Chat
  sendMessage: (
    content: string,
    model: string,
    action?: string,
    attachments?: { type: string, url: string }[]
  ) => Promise<void>;
  stopMessage: () => void;
  currentModel: string;
  setCurrentModel: (model: string) => void;

  mentorId: string;
}

// ─── Context ───────────────────────────────────────────────────────────────────

const ConversationContext = createContext<ConversationContextValue | null>(null);

export function useConversation() {
  const ctx = useContext(ConversationContext);
  if (!ctx)
    throw new Error(
      "useConversation must be used within ConversationProvider"
    );
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface ConversationProviderProps {
  children: ReactNode;
  mentorId: string;
}

const LOADING_STEPS = [
  "👤 Reading mentor profile...",
  "🗺️ Checking your roadmap...",
  "📊 Reviewing progress...",
  "💬 Scanning conversation history...",
  "🧠 Generating response...",
];

export function ConversationProvider({
  children,
  mentorId,
}: ConversationProviderProps) {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentModel, setCurrentModel] = useState("auto");

  // Track whether user explicitly clicked "New Chat" to avoid auto-restoring
  const isNewChatRef = useRef(false);
  
  // AbortController for stopping generation
  const abortControllerRef = useRef<AbortController | null>(null);

  // ── Load initial sessions ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    getChatSessions(mentorId).then((data) => {
      if (cancelled) return;
      setSessions(data as ChatSession[]);
      setIsLoadingSessions(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user, mentorId]);

  // ── Auto-select session from URL or latest ────────────────────────────────
  useEffect(() => {
    if (isLoadingSessions) return;
    const urlSessionId = searchParams.get("session");

    if (urlSessionId) {
      setActiveSessionId(urlSessionId);
      isNewChatRef.current = false;
      return;
    }

    if (!activeSessionId && !isNewChatRef.current && sessions.length > 0) {
      const latest = sessions[0];
      setActiveSessionId(latest.id);
      // Sync to URL silently
      const p = new URLSearchParams(searchParams.toString());
      p.set("session", latest.id);
      router.replace(`${pathname}?${p.toString()}`);
    }
  }, [sessions, isLoadingSessions, searchParams]);

  // ── Load messages when session changes ────────────────────────────────────
  useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
      return;
    }
    setIsLoadingMessages(true);
    getChatHistory(activeSessionId)
      .then((data) => setMessages(data as Message[]))
      .catch((err) => {
        console.error("Failed to load chat history:", err);
        setMessages([]);
      })
      .finally(() => setIsLoadingMessages(false));
  }, [activeSessionId]);

  // ── Supabase Realtime: sessions list ─────────────────────────────────────
  useEffect(() => {
    if (!mentorId) return;

    const channel = supabase
      .channel(`sessions-${mentorId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_sessions",
          filter: `mentor_id=eq.${mentorId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const s = payload.new as ChatSession;
            setSessions((prev) => {
              if (prev.some((x) => x.id === s.id)) return prev;
              return [s, ...prev];
            });
          }

          if (payload.eventType === "UPDATE") {
            const s = payload.new as ChatSession;
            setSessions((prev) => {
              const updated = prev.map((x) => (x.id === s.id ? { ...x, ...s } : x));
              // Re-sort: pinned first, then by last_message_at
              return [...updated].sort((a, b) => {
                if (a.is_pinned !== b.is_pinned)
                  return a.is_pinned ? -1 : 1;
                const aTime = a.last_message_at ?? a.created_at;
                const bTime = b.last_message_at ?? b.created_at;
                return new Date(bTime).getTime() - new Date(aTime).getTime();
              });
            });
          }

          if (payload.eventType === "DELETE") {
            const deleted = payload.old as { id: string };
            setSessions((prev) => prev.filter((x) => x.id !== deleted.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mentorId]);

  // ── Switch to a session ───────────────────────────────────────────────────
  const handleSetActiveSession = useCallback(
    (id: string) => {
      if (id === activeSessionId) return;
      setActiveSessionId(id);
      isNewChatRef.current = false;
      const p = new URLSearchParams(searchParams.toString());
      p.set("session", id);
      router.push(`${pathname}?${p.toString()}`);
    },
    [activeSessionId, searchParams, pathname, router]
  );

  // ── Create new chat ───────────────────────────────────────────────────────
  const createNewSession = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    isNewChatRef.current = true;
    setActiveSessionId(null);
    setMessages([]);

    try {
      const newId = await createChatSession(mentorId, "New Conversation");
      setActiveSessionId(newId);

      const p = new URLSearchParams(searchParams.toString());
      p.set("session", newId);
      router.push(`${pathname}?${p.toString()}`);

      isNewChatRef.current = false;
      return newId;
    } catch (err) {
      console.error("Failed to create session:", err);
      toast.error("Failed to start new conversation.");
      isNewChatRef.current = false;
      return null;
    }
  }, [user, mentorId, searchParams, pathname, router]);

  // ── Delete session ────────────────────────────────────────────────────────
  const deleteSession = useCallback(
    async (id: string) => {
      const prevSessions = [...sessions];
      setSessions(prev => prev.filter(s => s.id !== id));
      
      try {
        const success = await deleteChatSession(id, mentorId);
        if (!success) throw new Error("Failed to delete");
        
        // If it was the active session, switch to the next available one
        if (id === activeSessionId) {
          const remaining = prevSessions.filter((s) => s.id !== id);
          if (remaining.length > 0) {
            handleSetActiveSession(remaining[0].id);
          } else {
            setActiveSessionId(null);
            setMessages([]);
            const p = new URLSearchParams(searchParams.toString());
            p.delete("session");
            router.push(`${pathname}?${p.toString()}`);
          }
        }
      } catch (err) {
        setSessions(prevSessions);
        toast.error("Failed to delete conversation.");
      }
    },
    [activeSessionId, sessions, mentorId, handleSetActiveSession, searchParams, pathname, router]
  );

  // ── Rename session ────────────────────────────────────────────────────────
  const renameSession = useCallback(async (id: string, title: string) => {
    const session = sessions.find(s => s.id === id);
    if (!session) return;
    const oldTitle = session.title;
    
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title } : s));
    
    try {
      const success = await renameChatSession(id, title);
      if (!success) throw new Error("Rename failed");
    } catch (err) {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, title: oldTitle } : s));
      toast.error("Failed to rename conversation.");
    }
  }, [sessions]);

  // ── Pin session ───────────────────────────────────────────────────────────
  const pinSession = useCallback(async (id: string, pinned: boolean) => {
    const session = sessions.find(s => s.id === id);
    if (!session) return;
    const oldPinned = session.is_pinned;
    
    setSessions(prev => prev.map(s => s.id === id ? { ...s, is_pinned: pinned } : s));
    
    try {
      const success = await pinChatSession(id, pinned);
      if (!success) throw new Error("Pin failed");
    } catch (err) {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, is_pinned: oldPinned } : s));
      toast.error("Failed to pin conversation.");
    }
  }, [sessions]);

  // ── Archive session ───────────────────────────────────────────────────────
  const archiveSession = useCallback(async (id: string, archived: boolean) => {
    const session = sessions.find(s => s.id === id);
    if (!session) return;
    const oldArchived = session.is_archived;
    
    setSessions(prev => prev.map(s => s.id === id ? { ...s, is_archived: archived } : s));
    
    try {
      const success = await archiveChatSession(id, archived);
      if (!success) throw new Error("Archive failed");
    } catch (err) {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, is_archived: oldArchived } : s));
      toast.error("Failed to archive conversation.");
    }
  }, [sessions]);

  // ── Favorite session ──────────────────────────────────────────────────────
  const favoriteSession = useCallback(async (id: string, fav: boolean) => {
    const session = sessions.find(s => s.id === id);
    if (!session) return;
    const oldFav = session.is_favorite;
    
    setSessions(prev => prev.map(s => s.id === id ? { ...s, is_favorite: fav } : s));
    
    try {
      const success = await favoriteChatSession(id, fav);
      if (!success) throw new Error("Favorite failed");
    } catch (err) {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, is_favorite: oldFav } : s));
      toast.error("Failed to favorite conversation.");
    }
  }, [sessions]);

  // ── Duplicate session ─────────────────────────────────────────────────────
  const duplicateSession = useCallback(
    async (id: string): Promise<string | null> => {
      const newId = await duplicateChatSession(id, mentorId);
      if (newId) {
        // Realtime INSERT will add it to the list automatically
        toast.success("Conversation duplicated.");
      }
      return newId;
    },
    [mentorId]
  );

  // ── Trigger AI Title (fire-and-forget) ────────────────────────────────────
  // Called after the first complete AI response. Uses real LLM to generate a
  // 3-6 word title, saves to DB, Realtime updates sidebar automatically.
  const triggerAITitle = useCallback(
    (sessionId: string, msgs: { role: string; content: string }[]) => {
      fetch("/api/ai-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, messages: msgs }),
      }).catch((err) => console.warn("[AI Title] fire-and-forget failed:", err));
    },
    []
  );

  // ── Send message ──────────────────────────────────────────────────────────
  const stopMessage = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(
    async (content: string, model: string, action?: string, attachments?: { type: string, url: string, fileName?: string, size?: number }[]) => {
      if (!user || isStreaming) return;

      let displayContent = action ? `*Requested: ${action}*` : content;
      const metadata: any = {};

      if (attachments && attachments.length > 0) {
        if (!displayContent) displayContent = `Sent ${attachments.length} attachment(s)`;
        
        metadata.attachments = attachments;
        // Keep image-specific metadata for backwards compatibility if needed
        const imageAttach = attachments.find(a => a.type.startsWith("image"));
        if (imageAttach) {
           metadata.type = "image";
           metadata.imageUrl = imageAttach.url;
        }
      }
      const tempUserMsg: Message = {
        id: `temp-user-${Date.now()}`,
        role: "user",
        content: displayContent,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      };
      setMessages((prev) => [...prev, tempUserMsg]);
      setIsStreaming(true);

      // Ensure we have a session
      let currentSessionId = activeSessionId;
      if (!currentSessionId) {
        try {
          currentSessionId = await createChatSession(
            mentorId,
            content.slice(0, 40) || "New Conversation"
          );
          setActiveSessionId(currentSessionId);
          const p = new URLSearchParams(searchParams.toString());
          p.set("session", currentSessionId!);
          router.push(`${pathname}?${p.toString()}`);
        } catch {
          setIsStreaming(false);
          toast.error("Failed to create session.");
          return;
        }
      }

      // Save user message to DB
      await saveMessage(currentSessionId!, "user", content || action || "", undefined, Object.keys(metadata).length > 0 ? metadata : undefined);

      // Auto-generate title if this is the first real message
      // NOTE: we now do AI title AFTER the first response completes — see below
      const isFirstMessage = messages.filter((m) => m.role === "user").length === 0;

      // Build chat body
      const chatBody = {
        messages: [
          ...messages,
          { role: "user" as const, content: displayContent },
        ].map((m) => ({ role: m.role, content: m.content })),
        mentorId,
        sessionId: currentSessionId,
        model: model || currentModel,
        action,
        attachments,
      };

      // Stream the response
      try {
        const tempAssistantId = `temp-assistant-${Date.now()}`;
        setMessages((prev) => [
          ...prev,
          { id: tempAssistantId, role: "assistant", content: "" },
        ]);

        abortControllerRef.current = new AbortController();

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(chatBody),
          signal: abortControllerRef.current.signal,
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
              return [...next.slice(0, -1), { ...last, content: assistantText }];
            }
            return next;
          });
        }

        assistantText += decoder.decode();
        if (!assistantText) assistantText = "[No response received]";

        // Finalise the assistant message in DB
        await saveMessage(currentSessionId!, "assistant", assistantText);

        // ── AI Title: fire after first complete response ─────────────────────
        if (isFirstMessage && content && assistantText) {
          triggerAITitle(currentSessionId!, [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content },
            { role: "assistant", content: assistantText.slice(0, 500) },
          ]);
        }

        // Replace temp IDs with final content
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last && last.role === "assistant") {
            return [...next.slice(0, -1), { ...last, content: assistantText }];
          }
          return next;
        });
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("Chat generation stopped by user.");
          return;
        }
        console.error("Chat error:", err);
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last && last.role === "assistant" && !last.content) {
            return [
              ...next.slice(0, -1),
              {
                ...last,
                content:
                  "Oops! Something went wrong while connecting to the AI. Please try again.",
              },
            ];
          }
          return next;
        });
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
        // Refresh server components (e.g. Roadmap) to reflect DB changes
        router.refresh();
      }
    },
    [
      user,
      isStreaming,
      activeSessionId,
      messages,
      mentorId,
      currentModel,
      searchParams,
      pathname,
      router,
      triggerAITitle,
    ]
  );

  const value: ConversationContextValue = {
    sessions,
    isLoadingSessions,
    activeSessionId,
    messages,
    isLoadingMessages,
    isStreaming,
    setActiveSession: handleSetActiveSession,
    createNewSession,
    deleteSession,
    renameSession,
    pinSession,
    archiveSession,
    favoriteSession,
    duplicateSession,
    sendMessage,
    stopMessage,
    currentModel,
    setCurrentModel,
    mentorId,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}
