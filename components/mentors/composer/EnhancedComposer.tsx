import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Plus, Send, Square } from "lucide-react";
import type { Mentor } from "@/types/mentor";
import { useConversation } from "@/contexts/ConversationContext";
import { VapiVoiceButton } from "../VapiVoiceButton";
import { VoiceToTextButton } from "../VoiceToTextButton";

import { ModelSelector, ModelType } from "./ModelSelector";
import { PlusMenu, ContextState } from "./PlusMenu";
import { ContextChips } from "./ContextChips";
import { AttachmentPreview, Attachment } from "./AttachmentPreview";

export function EnhancedComposer({ mentor }: { mentor: Mentor }) {
  const { sendMessage, stopMessage, isStreaming, activeSessionId, currentModel, setCurrentModel } = useConversation();

  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const dragCounter = useRef(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const composerContainerRef = useRef<HTMLDivElement>(null);

  // New State for Capabilities and Context
  // Context State
  const [contextState, setContextState] = useState<ContextState>({
    webSearch: false,
    knowledge: true,
    memory: true,
    roadmap: false,
    files: true,
  });

  const hasText = text.trim().length > 0 || attachments.some(a => !a.uploading);

  // Backend handles smart capabilities (Vision, Code) automatically.

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.max(44, Math.min(el.scrollHeight, 160)) + "px";
  }, []);

  useEffect(() => {
    resize();
  }, [text, resize]);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setText(e.detail);
      if (textareaRef.current) {
        textareaRef.current.focus();
        setTimeout(() => {
          textareaRef.current!.selectionStart = textareaRef.current!.value.length;
          textareaRef.current!.selectionEnd = textareaRef.current!.value.length;
        }, 0);
      }
    };
    window.addEventListener('fill-chat-input', handler as EventListener);
    return () => window.removeEventListener('fill-chat-input', handler as EventListener);
  }, []);

  const processFiles = async (files: File[]) => {
    const validTypes = ["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf", "text/plain", "text/markdown"];
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const newAttachments: Attachment[] = [];

    for (const file of files) {
      if (file.size > MAX_SIZE) {
        toast.error(`File ${file.name} is too large (max 10MB)`);
        continue;
      }
      const ext = file.name.split('.').pop()?.toLowerCase();
      const isTextExt = ['txt', 'md', 'js', 'ts', 'py', 'html', 'css', 'json', 'csv'].includes(ext || '');

      if (!validTypes.includes(file.type) && !isTextExt && !file.type.startsWith('image/')) {
        toast.error(`Unsupported file type: ${file.name}`);
        continue;
      }
      newAttachments.push({ file, uploading: true });
    }

    if (newAttachments.length === 0) return;
    setAttachments(prev => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = "";

    for (const attach of newAttachments) {
      try {
        const formData = new FormData();
        formData.append("file", attach.file);
        if (mentor?.id) formData.append("mentor_id", mentor.id);

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();

        setAttachments(prev => prev.map(a => a.file === attach.file ? { ...a, url: data.previewUrl || data.publicUrl, uploading: false } : a));
      } catch (err) {
        toast.error(`Failed to upload ${attach.file.name}`);
        setAttachments(prev => prev.filter(a => a.file !== attach.file));
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files));
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault();
      processFiles(Array.from(e.clipboardData.files));
    }
  };

  useEffect(() => {
    const container = composerContainerRef.current;
    if (!container) return;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault(); e.stopPropagation();
      dragCounter.current += 1;
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) setIsDragging(true);
    };
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault(); e.stopPropagation();
      dragCounter.current -= 1;
      if (dragCounter.current === 0) setIsDragging(false);
    };
    const handleDragOver = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault(); e.stopPropagation();
      setIsDragging(false); dragCounter.current = 0;
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) processFiles(Array.from(e.dataTransfer.files));
    };

    container.addEventListener('dragenter', handleDragEnter);
    container.addEventListener('dragleave', handleDragLeave);
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', handleDrop);
    return () => {
      container.removeEventListener('dragenter', handleDragEnter);
      container.removeEventListener('dragleave', handleDragLeave);
      container.removeEventListener('dragover', handleDragOver);
      container.removeEventListener('drop', handleDrop);
    };
  }, [mentor.id]);

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
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

    await sendMessage(val, currentModel, undefined, mappedAttachments.length > 0 ? mappedAttachments : undefined, contextState as unknown as Record<string, boolean>);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isExpanded = isInputFocused || hasText;

  return (
    <div 
      ref={composerContainerRef}
      className={cn(
      "flex flex-col gap-2 relative mx-auto transition-[max-width] duration-300 ease-out",
      isExpanded ? "max-w-4xl" : "max-w-3xl"
    )}>
      
      <div
        className={cn(
          "relative flex flex-col rounded-[24px] bg-card/60 backdrop-blur-2xl shadow-sm ring-1 ring-border/40 transition-all duration-500 ease-out group",
          isInputFocused && "bg-card/90 shadow-[0_8px_30px_rgba(16,185,129,0.2),inset_0_1px_1px_rgba(255,255,255,0.05)] ring-2 ring-primary/60 -translate-y-1",
          isDragging ? "ring-2 ring-primary bg-primary/5" : "border border-border/50"
        )}
      >
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

        <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple className="hidden" />

        <div className="px-4 pt-3 pb-1">
          <ContextChips 
            contextState={contextState} 
            onRemove={(key) => setContextState(prev => ({ ...prev, [key]: false }))} 
          />
        </div>

        <AttachmentPreview attachments={attachments} onRemove={removeAttachment} />

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
            attachments.length > 0 ? "pt-2 pb-2" : "py-1",
            "placeholder:text-muted-foreground/50 focus:outline-none",
            "min-h-[44px] max-h-[250px] overflow-y-auto no-scrollbar"
          )}
          style={{ height: "auto" }}
        />

        <div className="flex flex-col gap-2 px-3 pb-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 pl-1">
              <PlusMenu 
                contextState={contextState} 
                setContextState={setContextState} 
                onAttachClick={() => triggerFileInput("image/*,application/pdf,text/*")}
                disabled={isStreaming} 
              />
              <ModelSelector currentModel={currentModel as ModelType} onModelChange={setCurrentModel} disabled={isStreaming} />
            </div>

            <div className="flex items-center gap-1 pr-1">
              
              <div className="h-4 w-px bg-border/40 mx-1" />
              
              <VoiceToTextButton isStreaming={isStreaming} text={text} setText={setText} />
              <VapiVoiceButton mentor={mentor} sessionId={activeSessionId || undefined} isInputIcon={true} />

              {isStreaming ? (
                <button
                  type="button"
                  onClick={stopMessage}
                  className="h-9 w-9 flex items-center justify-center rounded-full transition-all duration-300 bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-105 active:scale-95 shadow-[0_4px_15px_rgba(239,68,68,0.3)] ml-1"
                >
                  <Square className="h-4 w-4 fill-current" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!hasText || attachments.some(a => a.uploading)}
                  className={cn(
                    "h-9 w-9 flex items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ml-1",
                    hasText && !attachments.some(a => a.uploading)
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.15] active:scale-[0.95] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] shadow-md border border-primary/20"
                      : "bg-muted/60 text-foreground/40 border border-border/40 cursor-not-allowed"
                  )}
                >
                  <Send className="h-4 w-4 -ml-0.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
