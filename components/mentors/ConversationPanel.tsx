"use client";

import {
  CheckCircle2, Copy, HelpCircle, Code2, GraduationCap,
  Sparkles, Loader2, Plus, Send, Mic, FileText,
  Image as ImageIcon, Video, Bookmark, Paperclip,
  BookOpen, Terminal, Wand2, ChevronDown, X
} from "lucide-react";
import type { Mentor, MentorStats } from "@/types/mentor";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { WelcomeDashboard } from "./WelcomeDashboard";
import { Button } from "@/components/ui/button";
import MaskRevealUp from "@/components/ui/smoothui/mask-reveal-up";
import { useUser, useClerk } from "@clerk/nextjs";
import { Separator } from "@/components/ui/separator";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { cn } from "@/lib/utils";
import { VapiVoiceButton } from "./VapiVoiceButton";
import { VoiceToTextButton } from "./VoiceToTextButton";
import { useConversation } from "@/contexts/ConversationContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// ─── Constants ────────────────────────────────────────────────────────────────

const LOADING_STEPS = [
  { icon: "👤", text: "Reading mentor profile..." },
  { icon: "🗺️", text: "Checking your roadmap..." },
  { icon: "📊", text: "Reviewing progress..." },
  { icon: "💬", text: "Scanning conversation history..." },
  { icon: "🧠", text: "Generating response..." },
];

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

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
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

function MessageActions({
  content,
  onAction,
  alwaysShow = false,
}: {
  content: string;
  onAction?: (action: string) => void;
  alwaysShow?: boolean;
}) {
  return (
    <div className={cn(
      "flex flex-wrap items-center gap-2 transition-opacity duration-300 mt-2",
      alwaysShow ? "opacity-100" : "opacity-0 group-hover:opacity-100"
    )}>
      <div className="flex items-center gap-1 bg-card/50 p-0.5 rounded-lg border border-border/60">
        <button
          onClick={() => {
            navigator.clipboard.writeText(content);
            toast.success("Copied to clipboard");
          }}
          title="Copy"
          className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-[0_0_10px_rgba(16,185,129,0.15)] transition-all duration-300 group"
        >
          <Copy className="h-3.5 w-3.5 group-hover:scale-110 transition-transform duration-300" />
        </button>
        <button
          title="Bookmark"
          className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-[0_0_10px_rgba(16,185,129,0.15)] transition-all duration-300 group"
        >
          <Bookmark className="h-3.5 w-3.5 group-hover:scale-110 transition-transform duration-300" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {[
          { icon: HelpCircle, label: "Explain More", action: "explain" },
          { icon: Code2, label: "Practice", action: "practice" },
          { icon: GraduationCap, label: "Quiz Me", action: "quiz" },
        ].map(({ icon: Icon, label, action }) => (
          <button
            key={action}
            onClick={() => onAction?.(action)}
            className="group inline-flex items-center gap-1.5 px-3.5 h-8 rounded-full text-[11px] font-medium text-muted-foreground bg-card/80 border border-border/60 hover:text-primary hover:border-primary/40 hover:bg-primary/10 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all duration-300 ease-out hover:-translate-y-0.5"
          >
            <Icon className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

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
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-foreground/80 hover:text-foreground bg-muted/80 hover:bg-muted transition-all border border-border/40 hover:border-border/80 shadow-sm"
      >
        <Wand2 className="h-3 w-3" />
        {current.label}
        <ChevronDown className="h-3 w-3" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="absolute bottom-full left-0 mb-2 w-48 rounded-xl border bg-popover shadow-xl p-1 z-50"
          >
            {MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  onChange(m.id);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left hover:bg-muted transition-colors",
                  m.id === currentModel && "bg-primary/10"
                )}
              >
                <span className="text-[12px] font-medium">{m.label}</span>
                {m.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {m.badge}
                  </span>
                )}
                {m.id === currentModel && (
                  <CheckCircle2 className="h-3 w-3 text-primary" />
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
  const { sendMessage, isStreaming, activeSessionId, currentModel, setCurrentModel } =
    useConversation();

  const [text, setText] = useState("");
  const [showAttach, setShowAttach] = useState(false);
  const [attachments, setAttachments] = useState<{ file: File; url?: string; uploading: boolean }[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const attachRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasText = text.trim().length > 0 || attachments.some(a => !a.uploading);

  const [isDragging, setIsDragging] = useState(false);
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
        "relative rounded-[24px] bg-card/60 backdrop-blur-xl border shadow-sm transition-all duration-500 ease-out focus-within:bg-card focus-within:border-primary/50 focus-within:shadow-[0_0_40px_rgba(var(--primary),0.25),_0_0_15px_rgba(var(--primary),0.3)] dark:focus-within:shadow-[0_0_40px_rgba(var(--primary),0.25),_0_0_15px_rgba(var(--primary),0.3)] focus-within:-mx-2 focus-within:scale-[1.01] group",
        isDragging ? "border-primary/50" : "border-border/60"
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
        <div className="flex flex-wrap gap-2 px-5 pt-4 pb-1">
          {attachments.map((a, i) => (
            <div key={i} className="relative group/att flex items-center gap-2 bg-muted/80 rounded-lg pr-8 p-1.5 border border-border/50 max-w-[200px]">
              {a.uploading ? (
                <div className="h-8 w-8 rounded bg-background flex items-center justify-center shrink-0">
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : a.file.type.startsWith("image/") ? (
                <div className="h-8 w-8 rounded overflow-hidden shrink-0">
                  <img src={a.url} alt="preview" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-8 w-8 rounded bg-background flex items-center justify-center shrink-0 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                </div>
              )}
              <span className="text-[11px] font-medium truncate flex-1">{a.file.name}</span>
              
              <button 
                onClick={() => removeAttachment(i)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-5 w-5 bg-background/80 hover:bg-destructive hover:text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover/att:opacity-100 transition-all"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={`Ask ${mentor.name} anything...`}
        disabled={isStreaming}
        rows={1}
        aria-label="Chat input"
        className={cn(
          "w-full bg-transparent resize-none text-[15px] leading-relaxed px-5 pt-3.5 pb-1",
          "placeholder:text-muted-foreground/40 focus:outline-none",
          "min-h-[48px] max-h-[200px] overflow-y-auto no-scrollbar"
        )}
        style={{ height: "auto" }}
      />

      {/* Bottom bar */}
      <div className="flex items-center gap-1 px-3 pb-2.5 pt-0">
        {/* Attach */}
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
              "h-8 w-8 flex items-center justify-center rounded-xl text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 transition-all duration-200",
              showAttach && "bg-muted text-foreground"
            )}
          >
            <Paperclip className="h-4 w-4" />
          </button>
        </div>

        {/* Model selector */}
        <ModelPill currentModel={currentModel} onChange={setCurrentModel} />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side actions */}
        <div className="flex items-center gap-3.5 pr-1">
          {/* Mic / Voice-to-Text */}
          <VoiceToTextButton
            isStreaming={isStreaming}
            text={text}
            setText={setText}
          />

          {/* Separator */}
          <div className="h-4 w-px bg-border/60 mx-1" />

          {/* Large AI Voice Button */}
          <VapiVoiceButton
            mentor={mentor}
            sessionId={activeSessionId || undefined}
            isInputIcon={true}
          />

          {/* Send — visible only when input has text */}
          <AnimatePresence>
            {hasText && (
              <motion.button
                key="send"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.12 }}
                type="button"
                onClick={handleSubmit}
                disabled={isStreaming}
                aria-label="Send message"
                title="Send (Enter)"
                className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all shadow-sm shadow-primary/20"
              >
                <Send className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
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
  } = useConversation();

  const [loadingStep, setLoadingStep] = useState(0);
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
        setLoadingStep((p) => (p < LOADING_STEPS.length - 1 ? p + 1 : p));
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

  const lastAssistantMessageIndex = messages.findLastIndex(m => m.role === "assistant" && m.content !== "");

  return (
    <div className="flex flex-col h-full bg-background relative">

      {/* Removed floating New Chat button from here */}

      {/* ── Messages ──────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-4 py-8 md:px-6"
        data-lenis-prevent="true"
      >
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
        ) : messages.length === 0 ? (
          /* Welcome Dashboard */
          <WelcomeDashboard 
            mentor={mentor} 
            stats={stats} 
            onSendMessage={(msg) => sendMessage(msg, currentModel)}
          />
        ) : (
          /* Messages */
          <div className="max-w-[700px] mx-auto space-y-8 pb-12">
            {messages.filter(m => m.content !== "").map((m, index) => (
              <div
                key={m.id}
                className={cn(
                  "group flex gap-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-200",
                  m.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {m.role === "assistant" && (
                  <Avatar className="h-8 w-8 ring-2 ring-background shadow-sm shrink-0 mt-1 z-10">
                    {mentor.avatarUrl ? (
                      <img src={mentor.avatarUrl} alt={mentor.name} className="object-cover" />
                    ) : null}
                    <AvatarFallback
                      style={{ backgroundColor: mentor.avatarColor }}
                      className="text-white text-[11px] font-bold"
                    >
                      {getInitials(mentor.name)}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    "flex flex-col relative",
                    m.role === "user" ? "items-end max-w-[85%]" : "items-start max-w-[100%]"
                  )}
                >
                  <div
                    className={cn(
                      "leading-relaxed",
                      m.role === "user"
                        ? "rounded-2xl rounded-tr-sm bg-muted/50 px-5 py-3.5 text-foreground overflow-hidden"
                        : "pt-1"
                    )}
                  >
                    {m.role === "user" ? (
                      <div className="flex flex-col gap-2">
                        {m.metadata?.attachments && m.metadata.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 justify-end mb-2">
                            {m.metadata.attachments.map((att: any, attIdx: number) => (
                              att.type?.startsWith("image/") ? (
                                <div key={attIdx} className="rounded-lg overflow-hidden border border-border/50 max-h-[300px]">
                                  <img src={att.url} alt={att.fileName || "Attached"} className="object-contain max-h-[300px]" />
                                </div>
                              ) : (
                                <div key={attIdx} className="bg-background/80 rounded px-3 py-2 text-sm border flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="truncate max-w-[200px]">{att.fileName}</span>
                                </div>
                              )
                            ))}
                          </div>
                        )}
                        <span className="whitespace-pre-wrap text-[15px]">{m.content}</span>
                      </div>
                    ) : (
                      <>
                        <MarkdownRenderer content={m.content} />
                        {/* Streaming cursor */}
                        {index === messages.length - 1 && isStreaming && m.content.length > 0 && (
                          <span className="inline-block w-0.5 h-[1em] bg-primary ml-0.5 animate-[blink_1s_ease-in-out_infinite] align-middle" />
                        )}
                      </>
                    )}
                  </div>

                  {m.role === "assistant" && m.content && (
                    <MessageActions
                      content={m.content}
                      onAction={handleQuickAction}
                      alwaysShow={index === lastAssistantMessageIndex}
                    />
                  )}
                </div>

                {m.role === "user" && (
                  <Avatar className="h-8 w-8 shrink-0 mt-1 ring-2 ring-background shadow-sm z-10">
                    <AvatarFallback className="bg-muted text-foreground font-semibold text-[11px]">
                      {user?.firstName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {/* Thinking indicator */}
            {isThinking && (
              <div className="flex gap-3 justify-start animate-in fade-in-0 duration-200 mt-2">
                <Avatar className="h-8 w-8 ring-2 ring-background shadow-sm shrink-0 mt-1 z-10">
                  {mentor.avatarUrl ? (
                    <img src={mentor.avatarUrl} alt={mentor.name} className="object-cover" />
                  ) : null}
                  <AvatarFallback
                    style={{ backgroundColor: mentor.avatarColor }}
                    className="text-white text-[11px] font-bold"
                  >
                    {getInitials(mentor.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="pt-1 min-w-[220px]">
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-primary mb-3">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                    {mentor.name} is thinking...
                  </div>
                  <div className="space-y-2">
                    {LOADING_STEPS.map((step, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex items-center gap-2.5 text-[12px] transition-all duration-300",
                          i < loadingStep && "text-muted-foreground/50",
                          i === loadingStep && "text-foreground font-medium",
                          i > loadingStep && "text-muted-foreground/20"
                        )}
                      >
                        {i < loadingStep ? (
                          <div className="h-4 w-4 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                             <CheckCircle2 className="h-3 w-3" />
                          </div>
                        ) : i === loadingStep ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                        ) : (
                          <span className="h-4 w-4 rounded-full border border-border/50 shrink-0" />
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

      {/* ── Composer ──────────────────────────────── */}
      <div className="px-4 pb-5 pt-3 bg-background border-t shrink-0">
        <div className="max-w-[760px] mx-auto">
          <Composer mentor={mentor} />
          <p className="text-center text-[10px] text-muted-foreground/30 mt-2">
            {mentor.name} can make mistakes. Verify important info.
          </p>
        </div>
      </div>
    </div>
  );
}
