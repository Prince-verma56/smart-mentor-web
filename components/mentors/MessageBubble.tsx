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
  style,
  measureRef,
  index,
}: MessageBubbleProps) {
  const displayContent = m.content.replace(/\*?\[Analyzing context\.\.\.\]\*?\n*/g, "").trimStart();

  return (
    <div
      ref={measureRef}
      data-index={index}
      className={cn(
        "group flex gap-4 absolute w-full left-0 px-4 md:px-6 py-2",
        m.role === "user" ? "justify-end" : "justify-start"
      )}
      style={style}
    >
      {m.role === "assistant" && (
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
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background"></span>
        </div>
      )}

      <div
        className={cn(
          "flex flex-col relative",
          m.role === "user" ? "items-end max-w-[85%]" : "items-start max-w-[100%]"
        )}
      >
        <div
          className={cn(
            "leading-relaxed w-full",
            m.role === "user"
              ? "rounded-2xl rounded-tr-sm bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 shadow-[0_2px_15px_rgba(16,185,129,0.08)] backdrop-blur-md px-5 py-4 text-foreground overflow-hidden relative"
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
            <div className="bg-gradient-to-br from-card/80 to-card/40 border border-border/60 rounded-2xl p-6 shadow-md backdrop-blur-md min-h-[60px] flex items-center w-full">
              {displayContent === "" ? (
                <div className="flex items-center gap-1.5 px-2">
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              ) : (
                <div className="w-full">
                  <MarkdownRenderer content={displayContent} />
                  {/* Streaming cursor */}
                  {isLastAssistantMessage && isStreaming && displayContent.length > 0 && (
                    <span className="inline-block w-2 h-[1em] bg-primary ml-1 animate-[blink_1s_ease-in-out_infinite] align-middle rounded-sm" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {m.role === "assistant" && displayContent.length > 0 && (
          <MessageActions
            content={displayContent}
            onAction={onQuickAction}
            alwaysShow={isLastAssistantMessage}
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
  );
});
