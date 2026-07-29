import { memo } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { MessageActions } from "./MessageActions";
import { getInitials } from "@/lib/utils";
import { FileText, CheckCircle2, Loader2 } from "lucide-react";

interface MessageBubbleProps {
  m: any;
  mentor: any;
  user: any;
  isStreaming: boolean;
  isLastAssistantMessage: boolean;
  onQuickAction: (action: string) => void;
  onEdit?: () => void;
  onRegenerate?: () => void;
  onStop?: () => void;
  style?: React.CSSProperties;
  measureRef?: (node: HTMLElement | null) => void;
  index: number;
}

export const MessageBubble = memo(function MessageBubble({
  m,
  mentor,
  user,
  isStreaming,
  isLastAssistantMessage,
  onQuickAction,
  onEdit,
  onRegenerate,
  onStop,
  style,
  measureRef,
  index,
}: MessageBubbleProps) {
  const displayContent = m.content.replace(/\*?\[Analyzing context\.\.\.\]\*?\n*/g, "").trimStart();

  return (
    <motion.div
      ref={measureRef}
      data-index={index}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "group flex w-full pt-4 px-4 md:px-8",
        m.role === "user" ? "justify-end" : "justify-start"
      )}
      style={style}
    >
      <div
        className={cn(
          "flex items-start gap-3 md:gap-4 w-full relative",
          m.role === "user" ? "flex-row-reverse" : "flex-row"
        )}
      >
        {/* Avatar */}
        <Avatar className="h-8 w-8 mt-1 border border-white/10 bg-[#1e1e1e] shadow-sm shrink-0 z-10">
          {m.role === "assistant" && mentor.avatarUrl ? (
            <img src={mentor.avatarUrl} alt={mentor.name} className="object-cover" />
          ) : m.role === "user" && user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user?.name || "User"} className="object-cover" />
          ) : null}
          <AvatarFallback
            style={{
              background: m.role === "assistant"
                ? `linear-gradient(135deg, ${mentor.avatarColor} 0%, rgba(0,0,0,0.8) 100%)`
                : '#2a2a2a'
            }}
            className="text-[10px] font-bold text-white/90"
          >
            {m.role === "assistant" ? getInitials(mentor.name) : getInitials(user?.fullName || user?.firstName || "User")}
          </AvatarFallback>
        </Avatar>

        {/* Message Wrapper */}
        <div className={cn("flex flex-col gap-2 max-w-[95%] md:max-w-[85%]", m.role === "user" ? "items-end" : "items-start")}>
          {/* Message Content */}
          <div
            className={cn(
              "leading-relaxed w-full transition-all duration-300 flex flex-col",
              m.role === "user"
                ? "rounded-2xl rounded-tr-sm bg-white/5 border border-white/10 px-5 py-4 text-foreground/90"
                : "rounded-2xl rounded-tl-sm bg-transparent border border-white/10 px-5 md:px-6 py-5 text-foreground hover:bg-white/[0.02]"
            )}
          >
            {m.role === "user" ? (
              <div className="flex flex-col gap-2">
                {m.metadata?.attachments && m.metadata.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-end mb-2">
                    {m.metadata.attachments.map((att: any, attIdx: number) => (
                      att.type?.startsWith("image/") ? (
                        <div key={attIdx} className="rounded-lg overflow-hidden border border-white/10 shadow-sm max-h-[300px]">
                          <img src={att.url} alt={att.fileName || "Attached"} className="object-contain max-h-[300px]" />
                        </div>
                      ) : (
                        <div key={attIdx} className="bg-black/20 rounded-md px-3 py-2 text-xs border border-white/5 flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="truncate max-w-[200px] text-white/80">{att.fileName}</span>
                        </div>
                      )
                    ))}
                  </div>
                )}
                <span className="whitespace-pre-wrap text-[15px]">{m.content}</span>
              </div>
            ) : (
              <div className="w-full">
                {displayContent === "" ? (
                  <div className="flex items-center gap-1.5 px-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                ) : (
                  <div className="w-full text-[15px]">
                    <MarkdownRenderer content={displayContent} />
                    {/* Streaming cursor */}
                    {isLastAssistantMessage && isStreaming && displayContent.length > 0 && (
                      <span className="inline-block w-2 h-[1em] bg-emerald-500 ml-1 animate-[blink_1s_ease-in-out_infinite] align-middle rounded-sm shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Contextual Floating Actions ── */}
          {displayContent.length > 0 && (
            <div className={cn("transition-all duration-300 opacity-0 group-hover:opacity-100 mt-1", m.role === "assistant" ? "ml-2" : "mr-2")}>
              <MessageActions
                content={displayContent}
                onAction={onQuickAction}
                onEdit={onEdit}
                onRegenerate={onRegenerate}
                onStop={onStop}
                isUser={m.role === "user"}
                isStreaming={isStreaming && isLastAssistantMessage}
                alwaysShow={false}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});
