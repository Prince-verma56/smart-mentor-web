import { memo } from "react";
import { cn } from "@/lib/utils";
import { Copy, Bookmark, HelpCircle, Code2, GraduationCap, Edit2, RotateCw, Square } from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

export const MessageActions = memo(function MessageActions({
  content,
  onAction,
  isUser = false,
  isStreaming = false,
  alwaysShow = false,
}: {
  content: string;
  onAction?: (action: string) => void;
  isUser?: boolean;
  isStreaming?: boolean;
  alwaysShow?: boolean;
}) {
  if (isStreaming) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "flex flex-wrap items-center gap-2 transition-opacity duration-300 mt-2",
          alwaysShow ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        <div className="flex items-center gap-1 bg-black/30 backdrop-blur-md p-0.5 rounded-lg border border-white/5 shadow-sm">
          <button
            onClick={() => {
              navigator.clipboard.writeText(content);
              toast.success("Copied to clipboard");
            }}
            title="Copy"
            className="h-7 w-7 flex items-center justify-center rounded-md text-white/40 hover:text-emerald-400 hover:bg-white/5 hover:shadow-[0_0_12px_rgba(16,185,129,0.2)] transition-all duration-300 group"
          >
            <Copy className="h-3.5 w-3.5 group-hover:scale-110 transition-transform duration-300" />
          </button>
          {!isUser && (
            <button
              title="Bookmark"
              className="h-7 w-7 flex items-center justify-center rounded-md text-white/40 hover:text-emerald-400 hover:bg-white/5 hover:shadow-[0_0_12px_rgba(16,185,129,0.2)] transition-all duration-300 group"
            >
              <Bookmark className="h-3.5 w-3.5 group-hover:scale-110 transition-transform duration-300" />
            </button>
          )}
        </div>

        {!isUser && <div className="flex items-center gap-2">
          {[
            { icon: HelpCircle, label: "Explain More", action: "explain" },
            { icon: Code2, label: "Practice", action: "practice" },
            { icon: GraduationCap, label: "Quiz Me", action: "quiz" },
          ].map(({ icon: Icon, label, action }) => (
            <button
              key={action}
              onClick={() => onAction?.(action)}
              className="group inline-flex items-center gap-1.5 px-3.5 h-8 rounded-full text-[11px] font-medium text-white/60 bg-black/30 backdrop-blur-md border border-white/5 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-white/5 hover:shadow-[0_4px_16px_rgba(16,185,129,0.2)] transition-all duration-300 ease-out hover:-translate-y-0.5"
            >
              <Icon className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
              {label}
            </button>
          ))}
        </div>}
      </motion.div>
    </AnimatePresence>
  );
});
