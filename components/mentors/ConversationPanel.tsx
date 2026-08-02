"use client";

import {
  CheckCircle2, Copy, HelpCircle, Code2, GraduationCap,
  Sparkles, Loader2, Plus, Send, Square, Mic, FileText,
  Image as ImageIcon, Video, Bookmark, Paperclip,
  BookOpen, Terminal, Wand2, ChevronDown, X, MessageSquarePlus
} from "lucide-react";
import type { Mentor, MentorStats } from "@/types/mentor";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { WelcomeDashboard } from "./WelcomeDashboard";
import { Button } from "@/components/ui/button";
import MaskRevealUp from "@/components/ui/smoothui/mask-reveal-up";
import { useUser, useClerk } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { cn, getInitials } from "@/lib/utils";
import { VapiVoiceButton } from "./VapiVoiceButton";
import { VoiceToTextButton } from "./VoiceToTextButton";
import { useConversation } from "@/contexts/ConversationContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { MessageBubble } from "./MessageBubble";
import { ResourcePreviewModal } from "./ResourcePreviewModal";
import { ArrowDown } from "lucide-react";
import { EnhancedComposer } from "./composer/EnhancedComposer";

// ─── Constants ────────────────────────────────────────────────────────────────



// Old Composer components removed, now using EnhancedComposer

interface ConversationPanelProps {
  mentor: Mentor;
  stats: MentorStats;
  isActive?: boolean;
}

const getSuggestedQuestions = (subject: string, currentTopic?: string) => [
  currentTopic
    ? `Explain ${currentTopic} to me`
    : `What should I learn first in ${subject}?`,
  "Where are we in my roadmap?",
  "What have we completed so far?",
  "What should I study today?",
  "Give me a quiz on the current topic",
];

// ─── ConversationPanel ────────────────────────────────────────────────────────

export function ConversationPanel({ mentor, stats, isActive = true }: ConversationPanelProps) {
  const { user } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    activeSessionId,
    messages,
    isLoadingMessages,
    isStreaming,
    conversationState,
    hasMoreMessages,
    isLoadingMore,
    loadMoreMessages,
    sendMessage,
    stopMessage,
    currentModel,
    deleteSession
  } = useConversation();

  const suggestedQuestions = getSuggestedQuestions(mentor.subject, stats.currentTopic);

  const searchParams = useSearchParams();
  const urlSessionId = searchParams?.get("session");
  const isTransitioning = !!urlSessionId && urlSessionId !== activeSessionId;
  const isEffectivelyLoading = isLoadingMessages || isTransitioning;

  // Sentinel for infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreMessages && !isLoadingMore) {
          // Record current scroll state before loading more
          if (scrollContainerRef.current) {
            previousScrollHeight.current = scrollContainerRef.current.scrollHeight;
            previousScrollTop.current = scrollContainerRef.current.scrollTop;
          }
          loadMoreMessages();
        }
      },
      { root: scrollContainerRef.current, threshold: 0.1, rootMargin: '100px' }
    );
    
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }
    return () => observer.disconnect();
  }, [hasMoreMessages, isLoadingMore, loadMoreMessages]);



  const handleQuickAction = useCallback(async (action: string) => {
    await sendMessage("", currentModel, action);
  }, [sendMessage, currentModel]);

  const handleDeleteSession = useCallback(async () => {
    if (!activeSessionId) return;
    if (!window.confirm("Delete this conversation?")) return;
    await deleteSession(activeSessionId);
  }, [activeSessionId, deleteSession]);

  const isThinking =
    isStreaming &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant" &&
    messages[messages.length - 1].content === "";

  const lastAssistantMessageId = [...messages].reverse().find(m => m.role === "assistant" && m.content !== "")?.id;

  const validMessages = useMemo(() => messages.filter(m => m.content !== ""), [messages]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);


  const [showScrollDown, setShowScrollDown] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<any | null>(null);
  const isUserScrollingUp = useRef(false);
  const previousScrollTop = useRef(0);
  const previousScrollHeight = useRef(0);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight;

    if (distanceToBottom > 200) {
      setShowScrollDown(true);
      isUserScrollingUp.current = true;
    } else {
      setShowScrollDown(false);
      isUserScrollingUp.current = false;
    }

    // Trigger infinite scroll if needed (assuming scrolling UP loads older messages)
    if (target.scrollTop < 100 && hasMoreMessages && !isLoadingMore) {
      previousScrollHeight.current = target.scrollHeight;
      previousScrollTop.current = target.scrollTop;
      loadMoreMessages();
    }
  }, [hasMoreMessages, isLoadingMore, loadMoreMessages]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      setShowScrollDown(false);
    }, 100);
  }, []);

  // Adjust scroll when new messages arrive while NOT scrolling up
  useEffect(() => {
    if (!isUserScrollingUp.current && validMessages.length > 0) {
      scrollToBottom();
    }
  }, [validMessages.length, isStreaming, scrollToBottom, conversationState]);

  // Maintain scroll position when older messages are loaded
  useEffect(() => {
    const handleOpenPreview = (e: any) => {
      if (e.detail && e.detail.source === "chat") {
        setPreviewAttachment(e.detail);
      }
    };
    window.addEventListener('open-resource-preview', handleOpenPreview);
    return () => window.removeEventListener('open-resource-preview', handleOpenPreview);
  }, []);

  // Maintain scroll position when older messages are loaded
  useEffect(() => {
    if (scrollContainerRef.current && previousScrollHeight.current > 0) {
      const target = scrollContainerRef.current;
      const heightDiff = target.scrollHeight - previousScrollHeight.current;
      if (heightDiff > 0) {
        target.scrollTop = previousScrollTop.current + heightDiff;
        previousScrollHeight.current = 0; // reset
      }
    }
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* ── Atmospheric Living Background ── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[200px] animate-[pulse_16s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-600/5 blur-[250px] animate-[pulse_18s_ease-in-out_infinite_alternate]" />
      </div>

      <ScrollArea
        className="flex-1 min-h-0 h-full w-full relative z-10"
        viewportRef={scrollContainerRef}
        onScroll={handleScroll}
        data-lenis-prevent="true"
      >
        <div className="px-4 py-8 md:px-6 min-h-full">
          {isEffectivelyLoading ? (
            <div className="flex flex-col max-w-[760px] mx-auto space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-12 rounded-2xl bg-muted/30 animate-pulse",
                    i % 2 === 0 ? "ml-16" : "mr-16"
                  )}
                />
              ))}
            </div>
          ) : !activeSessionId && (conversationState === "IDLE" || conversationState === "READY") ? (
            /* Welcome Dashboard */
            <WelcomeDashboard
              mentor={mentor}
              stats={stats}
              onFillInput={(msg) => window.dispatchEvent(new CustomEvent('fill-chat-input', { detail: msg }))}
            />
          ) : (
            /* Messages */
            <div className="w-full max-w-4xl mx-auto space-y-12 pb-12 relative">
              {validMessages.length === 0 && !isThinking && !isStreaming && (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 animate-in fade-in duration-500">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 shadow-sm border border-primary/10">
                    <MessageSquarePlus className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight mb-3">New Conversation</h3>
                  <p className="text-muted-foreground text-[15px] max-w-[400px] leading-relaxed">
                    Start chatting with <span className="font-semibold text-foreground">{mentor.name}</span>. Messages will appear here.
                  </p>
                </div>
              )}

              {hasMoreMessages && (
                <div ref={sentinelRef} className="flex justify-center py-4 absolute top-[-40px] left-0 right-0 z-10">
                  {isLoadingMore ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : null}
                </div>
              )}

              <div className="w-full flex flex-col gap-6">
                {validMessages.map((m, index) => (
                  <MessageBubble
                    key={m.id}
                    m={m}
                    mentor={mentor}
                    user={user}
                    isStreaming={isStreaming}
                    isLastAssistantMessage={m.id === lastAssistantMessageId}
                    onQuickAction={handleQuickAction}
                    index={index}
                    onStop={stopMessage}
                  />
                ))}
              </div>

              {/* Premium Thinking indicator */}
              {isThinking && (
                <div className="flex gap-4 justify-start animate-in fade-in duration-500 mt-6 px-4 md:px-6 relative">
                  <div className="relative mt-1 z-10 shrink-0">
                    <Avatar className="h-9 w-9 ring-1 ring-white/10 shadow-sm opacity-80 grayscale">
                      {mentor.avatarUrl ? (
                        <img src={mentor.avatarUrl} alt={mentor.name} className="object-cover" />
                      ) : null}
                      <AvatarFallback
                        style={{ background: `linear-gradient(135deg, ${mentor.avatarColor} 0%, rgba(0,0,0,0.8) 100%)` }}
                        className="text-white text-[12px] font-bold"
                      >
                        {getInitials(mentor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500/50 border-2 border-background animate-pulse"></span>
                  </div>

                  <div className="pt-2 min-w-[260px] pl-2 flex flex-col justify-center">
                    <span className="text-[13px] font-medium text-emerald-500/80 mb-1 flex items-center gap-1.5 animate-pulse">
                      Thinking
                      <span className="flex gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-emerald-500/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1 h-1 rounded-full bg-emerald-500/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1 h-1 rounded-full bg-emerald-500/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    </span>
                    <div className="text-[14px] text-muted-foreground/60 transition-all duration-300">
                      {(() => {
                        const lastMsg = messages[messages.length - 1];
                        const statuses = (lastMsg?.metadata as any)?.statuses || [];
                        if (statuses.length > 0) {
                          return statuses[statuses.length - 1].message;
                        }
                        return "Initializing...";
                      })()}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-[250px] w-full shrink-0" />
            </div>
          )}
        </div>
        <AnimatePresence>
          {showScrollDown && (
            <motion.button
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              onClick={scrollToBottom}
              className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur border shadow-xl rounded-full px-5 py-2.5 text-sm font-semibold flex items-center gap-2 hover:bg-muted transition-colors z-50 text-primary"
            >
              <ArrowDown className="h-4 w-4" />
              New messages
            </motion.button>
          )}
        </AnimatePresence>
      </ScrollArea>

      {/* ── Composer ──────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-4 bg-transparent shrink-0 z-20 pointer-events-none">
        <div className={cn("w-full max-w-4xl mx-auto relative z-10", isActive && "pointer-events-auto")}>
            <EnhancedComposer mentor={mentor} />
        </div>
        <p className={cn("text-center text-[10px] text-white/30 mt-3 tracking-wide", isActive && "pointer-events-auto")}>
          {mentor.name} can make mistakes. Verify important info.
        </p>
      </div>

      {/* Attachment Preview Modal */}
      {previewAttachment && (
        <ResourcePreviewModal
          open={!!previewAttachment}
          onOpenChange={(open) => !open && setPreviewAttachment(null)}
          resource={{
            id: previewAttachment.url || "1",
            name: previewAttachment.fileName || "Attachment",
            type: previewAttachment.type,
            storage_url: previewAttachment.url,
            status: "ready",
            previewUrl: previewAttachment.url,
            mentor_id: mentor.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }}
        />
      )}
    </div>
  );
}
