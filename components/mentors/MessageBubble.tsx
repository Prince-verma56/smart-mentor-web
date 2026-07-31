import { memo } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { MessageActions } from "./MessageActions";
import { getInitials } from "@/lib/utils";
import { FileText, CheckCircle2, Loader2 } from "lucide-react";
import { AttachmentCard } from "./AttachmentCard";

interface MessageBubbleProps {
  m: any;
  mentor: any;
  user: any;
  isStreaming: boolean;
  isLastAssistantMessage: boolean;
  onQuickAction: (action: string) => void;
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
  onStop,
  style,
  measureRef,
  index,
}: MessageBubbleProps) {
  let displayContent = m.content.replace(/\*?\[Analyzing context\.\.\.\]\*?\n*/g, "").trimStart();

  if (isStreaming && isLastAssistantMessage) {
    displayContent += " █";
  }

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
                      <AttachmentCard 
                        key={attIdx} 
                        attachment={att} 
                        onClick={() => {
                          const event = new CustomEvent('open-resource-preview', { detail: { ...att, source: "chat" } });
                          window.dispatchEvent(event);
                        }}
                      />
                    ))}
                  </div>
                )}
                <span className="whitespace-pre-wrap text-[15px]">{m.content}</span>
              </div>
            ) : (
              <div className="w-full">
                {displayContent === "" ? (
                  <div className="flex flex-col gap-3 px-2 py-1 w-full max-w-[300px]">
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                      <span className="text-[13px] font-medium text-emerald-500">
                        {m.metadata?.statuses && m.metadata.statuses.length > 0 
                          ? m.metadata.statuses[m.metadata.statuses.length - 1].status || m.metadata.statuses[m.metadata.statuses.length - 1].message || "Thinking..."
                          : "Thinking..."}
                      </span>
                    </div>
                    {/* Animated pipeline history */}
                    {m.metadata?.statuses && m.metadata.statuses.length > 1 && (
                      <div className="flex flex-col gap-2 ml-[9px] pl-3 border-l-2 border-white/10 relative overflow-hidden">
                        {m.metadata.statuses.slice(0, -1).map((s: any, idx: number) => (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle2 className="h-3 w-3 text-white/40" />
                            <span className="text-[11px] text-white/40 line-clamp-1">{s.status || s.message || "Done"}</span>
                          </motion.div>
                        ))}
                        {/* Gradient mask for smooth fade out at the top if there are many */}
                        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-background to-transparent" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full text-[15px]">
                    <MarkdownRenderer content={displayContent} />
                    
                    {/* Source References */}
                    {m.metadata?.sources && m.metadata.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 uppercase tracking-wider">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Knowledge Retrieved</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {m.metadata.sources.map((src: any, idx: number) => (
                            <div key={idx} className="group/src relative flex items-center gap-2 bg-black/20 hover:bg-black/40 border border-white/5 hover:border-white/10 rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-all cursor-default">
                              <FileText className="h-3.5 w-3.5 text-white/40 group-hover/src:text-emerald-400/80 transition-colors" />
                              <span className="truncate max-w-[150px]">{src.metadata?.title || src.metadata?.source || `Source ${idx + 1}`}</span>
                              
                              {/* Tooltip content */}
                              {src.content && (
                                <div className="absolute bottom-full left-0 mb-2 w-[300px] p-3 bg-[#1e1e1e] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover/src:opacity-100 group-hover/src:visible transition-all z-50">
                                  <p className="text-white/80 text-[11px] leading-relaxed line-clamp-6 whitespace-pre-wrap">
                                    {src.content}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Contextual Floating Actions ── */}
          {displayContent.length > 0 && (
            <div className={cn("transition-all duration-300 mt-1", 
              m.role === "assistant" ? "ml-2 opacity-100" : "mr-2 opacity-0 group-hover:opacity-100"
            )}>
              <MessageActions
                content={displayContent}
                onAction={onQuickAction}
                isUser={m.role === "user"}
                isStreaming={isStreaming && isLastAssistantMessage}
                alwaysShow={m.role === "assistant"}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});
