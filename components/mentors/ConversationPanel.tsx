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
import { useVirtualizer } from "@tanstack/react-virtual";
import { MessageBubble } from "./MessageBubble";
import { ArrowDown } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────



const MODELS = [
  { id: "auto", label: "Auto (Optimal)", badge: "Smart" },
  { id: "fast", label: "Fast & Lightweight", badge: "Speed" },
  { id: "reasoning", label: "Deep Reasoning", badge: "Quality" },
];

const ATTACH_ITEMS = [
  { id: "pdf", icon: FileText, label: "PDF Document", hint: "Upload a PDF", accept: ".pdf" },
  { id: "image", icon: ImageIcon, label: "Image", hint: "JPG, PNG, WebP", accept: "image/*" },
  { id: "text", icon: Terminal, label: "Text Snippet", hint: "TXT, MD, Code", accept: ".txt,.md,.js,.ts,.py,.html,.css" },
];

interface ConversationPanelProps {
  mentor: Mentor;
  stats: MentorStats;
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

// ─── Message Actions ──────────────────────────────────────────────────────────



// ─── Attach Popover ───────────────────────────────────────────────────────────

function AttachPopover({ onClose, onSelect }: { onClose: () => void, onSelect: (accept: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className="absolute bottom-full left-0 mb-2 w-52 rounded-xl border bg-popover shadow-xl p-1.5 z-50"
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 px-2 py-1">
        Attach
      </p>
      {ATTACH_ITEMS.map(({ id, icon: Icon, label, hint, accept }) => (
        <button
          key={id}
          onClick={() => {
            onSelect(accept);
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left hover:bg-muted transition-colors group"
        >
          <Icon className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-foreground" />
          <div>
            <p className="text-[12px] font-medium">{label}</p>
            <p className="text-[10px] text-muted-foreground/50">{hint}</p>
          </div>
        </button>
      ))}
    </motion.div>
  );
}

// ─── Model Pill ───────────────────────────────────────────────────────────────

function ModelPill({
  currentModel,
  onChange,
}: {
  currentModel: string;
  onChange: (model: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = MODELS.find((m) => m.id === currentModel) ?? MODELS[0];
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close model popover on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-foreground/70 bg-muted/30 hover:text-foreground hover:bg-muted transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 active:scale-95 border border-border/30 hover:border-border/60 hover:shadow-sm"
      >
        <Wand2 className="h-4 w-4" />
        {current.label.split(" ")[0]}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full left-0 mb-2 w-56 rounded-xl border border-border/50 bg-popover/80 backdrop-blur-xl shadow-lg p-1.5 z-50"
          >
            {MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  onChange(m.id);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-muted/80 transition-colors",
                  m.id === currentModel && "bg-primary/10 hover:bg-primary/15"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-foreground">{m.label}</span>
                  {m.id === currentModel && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  )}
                </div>
                {m.badge && (
                  <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">
                    {m.badge}
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Composer ─────────────────────────────────────────────────────────────────

function Composer({ mentor }: { mentor: Mentor }) {
  const { sendMessage, stopMessage, isStreaming, activeSessionId, currentModel, setCurrentModel } =
    useConversation();

  const [text, setText] = useState("");
  const [showAttach, setShowAttach] = useState(false);
  const [attachments, setAttachments] = useState<{ file: File; url?: string; uploading: boolean }[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const attachRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasText = text.trim().length > 0 || attachments.some(a => !a.uploading);

  const [isDragging, setIsDragging] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const dragCounter = useRef(0);

  // Auto-resize textarea
  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px"; // Reset height to get true scrollHeight
    el.style.height = Math.max(44, Math.min(el.scrollHeight, 160)) + "px";
  }, []);

  useEffect(() => {
    resize();
  }, [text, resize]);

  // Listen for fill-chat-input events
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setText(e.detail);
      if (textareaRef.current) {
        textareaRef.current.focus();
        // Move cursor to end
        setTimeout(() => {
          textareaRef.current!.selectionStart = textareaRef.current!.value.length;
          textareaRef.current!.selectionEnd = textareaRef.current!.value.length;
        }, 0);
      }
    };
    window.addEventListener('fill-chat-input', handler as EventListener);
    return () => window.removeEventListener('fill-chat-input', handler as EventListener);
  }, []);

  // Close attach popover on outside click
  useEffect(() => {
    if (!showAttach) return;
    const handler = (e: MouseEvent) => {
      if (attachRef.current && !attachRef.current.contains(e.target as Node)) {
        setShowAttach(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showAttach]);

  const processFiles = async (files: File[]) => {
    const validTypes = [
      "image/png", "image/jpeg", "image/webp", "image/gif",
      "application/pdf", "text/plain", "text/markdown"
    ];
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB

    const newAttachments: { file: File; uploading: boolean }[] = [];
    
    for (const file of files) {
      if (file.size > MAX_SIZE) {
        toast.error(`File ${file.name} is too large (max 10MB)`);
        continue;
      }
      
      // Basic type validation (or let it pass if it's text based on extension)
      const ext = file.name.split('.').pop()?.toLowerCase();
      const isTextExt = ['txt', 'md', 'js', 'ts', 'py', 'html', 'css'].includes(ext || '');
      
      if (!validTypes.includes(file.type) && !isTextExt && !file.type.startsWith('image/')) {
        toast.error(`Unsupported file type: ${file.name}`);
        continue;
      }
      newAttachments.push({ file, uploading: true });
    }

    if (newAttachments.length === 0) return;

    setAttachments((prev) => [...prev, ...newAttachments]);
    
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Upload each file
    for (const attach of newAttachments) {
      try {
        const formData = new FormData();
        formData.append("file", attach.file);
        if (mentor?.id) {
          formData.append("mentor_id", mentor.id);
        }

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();

        setAttachments((prev) => 
          prev.map(a => a.file === attach.file ? { ...a, url: data.previewUrl || data.publicUrl, uploading: false } : a)
        );
      } catch (err) {
        toast.error(`Failed to upload ${attach.file.name}`);
        setAttachments((prev) => prev.filter(a => a.file !== attach.file));
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault();
      processFiles(Array.from(e.clipboardData.files));
    }
  };

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current += 1;
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current -= 1;
      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        processFiles(Array.from(e.dataTransfer.files));
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [mentor.id]);

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async () => {
    if (!hasText || isStreaming || attachments.some(a => a.uploading)) return;
    const val = text.trim();
    const currentAttachments = [...attachments];
    setText("");
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    
    const mappedAttachments = currentAttachments.map(a => ({
      type: a.file.type || "text/plain",
      url: a.url!,
      fileName: a.file.name,
      size: a.file.size
    }));

    await sendMessage(val, currentModel, undefined, mappedAttachments.length > 0 ? mappedAttachments : undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div 
      className={cn(
        "relative flex flex-col rounded-3xl bg-card/60 backdrop-blur-2xl shadow-md ring-1 ring-border/40 transition-all duration-500 ease-out group",
        isInputFocused && "bg-card/90 shadow-[0_8px_30px_rgba(16,185,129,0.2),inset_0_1px_1px_rgba(255,255,255,0.05)] ring-2 ring-primary/60 -translate-y-1",
        isDragging ? "ring-2 ring-primary bg-primary/5" : "border border-border/50"
      )}
    >
      {/* Global Full-screen Dropzone Overlay */}
      {isDragging && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] bg-background/20 backdrop-blur-md flex items-center justify-center pointer-events-none transition-all duration-200">
          <div className="flex flex-col items-center justify-center gap-5 text-primary animate-in zoom-in-95 duration-300 bg-card/90 border-2 border-dashed border-primary/50 rounded-[32px] p-16 min-w-[450px] shadow-2xl">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Plus className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold">Drop files to attach</h3>
              <p className="text-base text-muted-foreground mt-2">Upload images, PDFs, or code snippets instantly</p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        className="hidden" 
      />

      {/* Attachment Preview Area */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-3 px-5 pt-4 pb-1">
          {attachments.map((a, i) => (
            <div key={i} className="relative group/att flex items-center gap-3 bg-card/60 backdrop-blur-sm rounded-xl pr-4 p-2 border border-border/60 max-w-[240px] shadow-sm transition-all hover:shadow-md hover:bg-card/90">
              {a.uploading ? (
                <div className="h-10 w-10 rounded-lg bg-background/50 flex items-center justify-center shrink-0">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              ) : a.file.type.startsWith("image/") ? (
                <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 bg-muted relative">
                  <img src={a.url} alt="preview" className="h-full w-full object-cover transition-transform duration-300 group-hover/att:scale-110" />
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-lg"></div>
                </div>
              ) : (
                <div className="h-10 w-10 rounded-lg bg-background/50 flex items-center justify-center shrink-0 text-muted-foreground ring-1 ring-inset ring-border/50">
                  <FileText className="h-5 w-5" />
                </div>
              )}
              
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[12px] font-medium text-foreground truncate">{a.file.name}</span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {(a.file.size / 1024).toFixed(1)} KB • {a.file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                </span>
              </div>
              
              <button 
                onClick={() => removeAttachment(i)}
                className="absolute -right-2 -top-2 h-6 w-6 bg-background hover:bg-destructive hover:text-destructive-foreground border border-border/50 shadow-sm rounded-full flex items-center justify-center opacity-0 scale-90 group-hover/att:opacity-100 group-hover/att:scale-100 transition-all z-10"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={() => setIsInputFocused(true)}
        onBlur={() => setIsInputFocused(false)}
        placeholder={`Ask ${mentor.name} anything...`}
        disabled={isStreaming}
        rows={1}
        aria-label="Chat input"
        className={cn(
          "w-full bg-transparent resize-none text-[15px] leading-relaxed px-5",
          attachments.length > 0 ? "pt-2 pb-2" : "py-4",
          "placeholder:text-muted-foreground/50 focus:outline-none",
          "min-h-[56px] max-h-[250px] overflow-y-auto no-scrollbar"
        )}
        style={{ height: "auto" }}
      />

      {/* Bottom bar: Attach, Model, Voice & Send */}
      <div className="flex items-center justify-between px-3 pb-3 pt-1">
        
        {/* Left Controls */}
        <div className="flex items-center gap-2 pl-1">
          <div ref={attachRef} className="relative">
            <AnimatePresence>
              {showAttach && <AttachPopover onClose={() => setShowAttach(false)} onSelect={triggerFileInput} />}
            </AnimatePresence>
            <button
              type="button"
              onClick={() => setShowAttach((p) => !p)}
              aria-label="Attach file"
              title="Attach file"
              className={cn(
                "h-10 w-10 flex items-center justify-center rounded-full text-foreground/70 bg-muted/30 hover:text-foreground hover:bg-muted transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-95 border border-border/30 hover:border-border/60 hover:shadow-md",
                showAttach && "bg-muted text-foreground border-border/60 shadow-md scale-105"
              )}
            >
              <Paperclip className="h-5 w-5" />
            </button>
          </div>

          <ModelPill currentModel={currentModel} onChange={setCurrentModel} />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 pr-1">
          <VoiceToTextButton
            isStreaming={isStreaming}
            text={text}
            setText={setText}
          />

          <div className="h-4 w-px bg-border/40 mx-0.5" />

          <VapiVoiceButton
            mentor={mentor}
            sessionId={activeSessionId || undefined}
            isInputIcon={true}
          />

          {isStreaming ? (
            <button
              type="button"
              onClick={stopMessage}
              aria-label="Stop generating"
              title="Stop"
              className="h-10 w-10 flex items-center justify-center rounded-lg transition-all duration-300 bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-105 active:scale-95 shadow-[0_4px_15px_rgba(239,68,68,0.3)]"
            >
              <Square className="h-5 w-5 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!hasText || attachments.some(a => a.uploading)}
              aria-label="Send message"
              title="Send (Enter)"
              className={cn(
                "h-10 w-10 flex items-center justify-center rounded-lg transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                hasText && !attachments.some(a => a.uploading)
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.15] active:scale-[0.95] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] shadow-md border border-primary/20"
                  : "bg-muted/60 text-foreground/40 border border-border/40 cursor-not-allowed"
              )}
            >
              <Send className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ConversationPanel ────────────────────────────────────────────────────────

export function ConversationPanel({ mentor, stats }: ConversationPanelProps) {
  const { user } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isStreaming,
    isLoadingMessages,
    activeSessionId,
    createNewSession,
    deleteSession,
    sendMessage,
    currentModel,
    setCurrentModel,
    conversationState,
    hasMoreMessages,
    isLoadingMore,
    loadMoreMessages,
  } = useConversation();

  const [loadingStep, setLoadingStep] = useState(0);

  const lastUserMessage = [...messages].reverse().find(m => m.role === "user");
  const hasImage = lastUserMessage?.metadata?.attachments?.some((a: any) => a.type?.startsWith("image/"));
  
  const currentLoadingSteps = useMemo(() => {
    const baseSteps = [
      { icon: "🤔", text: "Understanding the request" },
      { icon: "🔍", text: "Searching relevant knowledge" },
      { icon: "✨", text: "Preparing response" },
    ];
    if (hasImage) {
      return [{ icon: "👀", text: "Analyzing your image" }, ...baseSteps];
    }
    return baseSteps;
  }, [hasImage]);
  const suggestedQuestions = getSuggestedQuestions(mentor.subject, stats.currentTopic);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Animate loading steps
  useEffect(() => {
    if (isStreaming) {
      setLoadingStep(0);
      const interval = setInterval(() => {
        setLoadingStep((p) => (p < currentLoadingSteps.length - 1 ? p + 1 : p));
      }, 650);
      return () => clearInterval(interval);
    } else {
      setLoadingStep(0);
    }
  }, [isStreaming]);

  const handleQuickAction = async (action: string) => {
    await sendMessage("", currentModel, action);
  };

  const handleDeleteSession = async () => {
    if (!activeSessionId) return;
    if (!window.confirm("Delete this conversation?")) return;
    await deleteSession(activeSessionId);
  };

  const isThinking =
    isStreaming &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant" &&
    messages[messages.length - 1].content === "";

  const lastAssistantMessageId = [...messages].reverse().find(m => m.role === "assistant" && m.content !== "")?.id;

  const validMessages = useMemo(() => messages.filter(m => m.content !== ""), [messages]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: validMessages.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: useCallback(() => 120, []),
    overscan: 5,
  });

  const [showScrollDown, setShowScrollDown] = useState(false);
  const isUserScrollingUp = useRef(false);
  const previousScrollTop = useRef(0);
  const previousScrollHeight = useRef(0);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    
    // Check if user is scrolling up
    if (distanceToBottom > 200) {
      setShowScrollDown(true);
      isUserScrollingUp.current = true;
    } else {
      setShowScrollDown(false);
      isUserScrollingUp.current = false;
    }

    // Trigger infinite scroll
    if (target.scrollTop < 100 && hasMoreMessages && !isLoadingMore) {
      previousScrollHeight.current = target.scrollHeight;
      previousScrollTop.current = target.scrollTop;
      loadMoreMessages();
    }
  }, [hasMoreMessages, isLoadingMore, loadMoreMessages]);

  const scrollToBottom = useCallback(() => {
    if (validMessages.length > 0) {
      virtualizer.scrollToIndex(validMessages.length - 1, { align: 'end' });
    }
    setTimeout(() => {
       messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }, 50);
  }, [validMessages.length, virtualizer]);

  // Adjust scroll when new messages arrive while NOT scrolling up
  useEffect(() => {
    if (!isUserScrollingUp.current && validMessages.length > 0) {
      scrollToBottom();
    }
  }, [validMessages.length, isStreaming, scrollToBottom]);

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
    <div className="flex flex-col h-full bg-background chat-workspace-bg relative">

      <div 
        className="flex-1 min-h-0 h-full w-full overflow-y-auto relative" 
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        <div className="px-4 py-8 md:px-6 min-h-full">
        {isLoadingMessages ? (
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
              <div className="flex justify-center py-4 absolute top-[-40px] left-0 right-0 z-10">
                {isLoadingMore ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : null}
              </div>
            )}

            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const m = validMessages[virtualItem.index];
                return (
                  <MessageBubble 
                    key={m.id}
                    m={m}
                    mentor={mentor}
                    user={user}
                    isStreaming={isStreaming}
                    isLastAssistantMessage={m.id === lastAssistantMessageId}
                    onQuickAction={handleQuickAction}
                    measureRef={virtualizer.measureElement}
                    index={virtualItem.index}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  />
                );
              })}
            </div>

            {/* Thinking indicator */}
            {isThinking && (
              <div 
                className="flex gap-4 justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300 mt-2 px-4 md:px-6"
              >
                <div className="relative mt-1 z-10 shrink-0">
                  <Avatar className="h-9 w-9 ring-2 ring-background shadow-sm">
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
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background animate-pulse"></span>
                </div>

                <div className="pt-1 min-w-[260px]">
                  <div className="bg-gradient-to-br from-card/80 to-card/40 border border-border/60 rounded-2xl p-6 shadow-md backdrop-blur-md">
                    <div className="flex items-center gap-2 text-[13px] font-semibold text-primary mb-4">
                      <div className="flex gap-1">
                         <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                         <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                         <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="ml-1">Thinking...</span>
                    </div>
                    <div className="space-y-3">
                      {currentLoadingSteps.map((step, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex items-center gap-3 text-[13px] transition-all duration-500 ease-out",
                            i < loadingStep && "text-muted-foreground/60",
                            i === loadingStep && "text-foreground font-medium translate-x-1",
                            i > loadingStep && "text-muted-foreground/20"
                          )}
                        >
                          {i < loadingStep ? (
                            <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                               <CheckCircle2 className="h-3.5 w-3.5" />
                            </div>
                          ) : i === loadingStep ? (
                            <div className="h-5 w-5 flex items-center justify-center shrink-0">
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            </div>
                          ) : (
                            <div className="h-5 w-5 flex items-center justify-center shrink-0">
                              <span className="h-2 w-2 rounded-full bg-muted-foreground/20" />
                            </div>
                          )}
                          <span>{step.icon} {step.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-[20px] w-full" />
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
      </div>

      {/* ── Composer ──────────────────────────────── */}
      <div className="px-4 pb-5 pt-3 bg-background border-t shrink-0">
        <div className="max-w-[760px] focus-within:max-w-4xl mx-auto transition-[max-width] duration-500 ease-out">
          <Composer mentor={mentor} />
          <p className="text-center text-[10px] text-muted-foreground/30 mt-2">
            {mentor.name} can make mistakes. Verify important info.
          </p>
        </div>
      </div>
    </div>
  );
}
