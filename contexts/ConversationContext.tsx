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

  // Chat
  sendMessage: (
    content: string,
    model: string,
    action?: string
  ) => Promise<void>;
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
  const [currentModel, setCurrentModel] = useState("llama-3.1-8b-instant");

  // Track whether user explicitly clicked "New Chat" to avoid auto-restoring
  const isNewChatRef = useRef(false);

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
      await deleteChatSession(id, mentorId);
      // Realtime will remove it from sessions list automatically
      // If it was the active session, switch to the next available one
      if (id === activeSessionId) {
        const remaining = sessions.filter((s) => s.id !== id);
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
    },
    [activeSessionId, sessions, mentorId, handleSetActiveSession, searchParams, pathname, router]
  );

  // ── Rename session ────────────────────────────────────────────────────────
  const renameSession = useCallback(async (id: string, title: string) => {
    await renameChatSession(id, title);
    // Realtime will update the list
  }, []);

  // ── Pin session ───────────────────────────────────────────────────────────
  const pinSession = useCallback(async (id: string, pinned: boolean) => {
    await pinChatSession(id, pinned);
    // Realtime will update + re-sort the list
  }, []);

  // ── Archive session ───────────────────────────────────────────────────────
  const archiveSession = useCallback(async (id: string, archived: boolean) => {
    await archiveChatSession(id, archived);
    // Realtime will update the list
  }, []);

  // ── Auto-generate title from first user message ───────────────────────────
  const autoGenerateTitle = useCallback(
    async (sessionId: string, firstMessage: string) => {
      const title = firstMessage
        .trim()
        .split(/\s+/)
        .slice(0, 6)
        .join(" ")
        .replace(/[^\w\s]/g, "")
        .trim();
      if (title) {
        await renameChatSession(sessionId, title.slice(0, 60));
      }
    },
    []
  );

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (content: string, model: string, action?: string) => {
      if (!user) return;

      const displayContent = action ? `*Requested: ${action}*` : content;
      const tempUserMsg: Message = {
        id: `temp-user-${Date.now()}`,
        role: "user",
        content: displayContent,
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
      await saveMessage(currentSessionId!, "user", content || action || "");

      // Auto-generate title if this is the first real message
      const isFirstMessage = messages.filter((m) => m.role === "user").length === 0;
      if (isFirstMessage && content) {
        autoGenerateTitle(currentSessionId!, content);
      }

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
      };

      // Stream the response
      try {
        const tempAssistantId = `temp-assistant-${Date.now()}`;
        setMessages((prev) => [
          ...prev,
          { id: tempAssistantId, role: "assistant", content: "" },
        ]);

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
              return [...next.slice(0, -1), { ...last, content: assistantText }];
            }
            return next;
          });
        }

        assistantText += decoder.decode();
        if (!assistantText) assistantText = "[No response received]";

        // Finalise the assistant message in DB
        await saveMessage(currentSessionId!, "assistant", assistantText);

        // Replace temp IDs with final content
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last && last.role === "assistant") {
            return [...next.slice(0, -1), { ...last, content: assistantText }];
          }
          return next;
        });
      } catch (err) {
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
                  "Sorry, I encountered an error. Please try again.",
              },
            ];
          }
          return next;
        });
        toast.error("Connection error. Please try again.");
      } finally {
        setIsStreaming(false);
      }
    },
    [
      user,
      activeSessionId,
      messages,
      mentorId,
      currentModel,
      searchParams,
      pathname,
      router,
      autoGenerateTitle,
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
    sendMessage,
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
