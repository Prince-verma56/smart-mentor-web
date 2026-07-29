import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Paperclip, FileText, Image as ImageIcon, AlignLeft, HelpCircle } from "lucide-react";

interface ToolsMenuProps {
  onAttachClick: (accept: string) => void;
}

export function ToolsMenu({ onAttachClick }: ToolsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const attachOptions = [
    { label: "Image", accept: "image/*", icon: ImageIcon },
    { label: "PDF Document", accept: ".pdf", icon: FileText },
    { label: "Text Snippet", accept: ".txt,.md,.json,.csv", icon: AlignLeft },
  ];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Attach file or use tool"
        title="Tools & Attachments"
        className={cn(
          "h-10 w-10 flex items-center justify-center rounded-full text-foreground/70 bg-muted/30 transition-all duration-300 border border-border/30 hover:border-border/60 hover:shadow-md",
          isOpen ? "bg-muted text-foreground border-border/60 shadow-md scale-105" : "hover:text-foreground hover:bg-muted hover:scale-110 active:scale-95"
        )}
      >
        <Paperclip className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 w-56 bg-card/95 backdrop-blur-xl border shadow-2xl rounded-2xl p-1.5 z-50 overflow-hidden"
          >
            <div className="text-xs font-semibold text-muted-foreground px-3 py-2 uppercase tracking-wider">
              Attach & Tools
            </div>
            <div className="flex flex-col gap-0.5">
              {attachOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.label}
                    onClick={() => {
                      onAttachClick(opt.accept);
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 w-full p-2 rounded-xl text-left hover:bg-muted text-foreground transition-colors"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
