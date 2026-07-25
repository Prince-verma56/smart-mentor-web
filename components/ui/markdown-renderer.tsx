"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block";
import { Loader2, Settings } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  compact?: boolean;
}

export function MarkdownRenderer({ content, compact = false }: MarkdownRendererProps) {
  // Strip internal AI signals
  const cleanedContent = content
    .replace(/LESSON_COMPLETE_SUGGESTION:\s*.+/g, "")
    .replace(/REVISION_SUGGESTION:\s*.+/g, "")
    .trim();

  const baseText = compact ? "text-xs" : "text-sm";

  return (
    <div className={baseText}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // ── Code ───────────────────────────────────────────────────────────
          code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !String(children).includes("\n");
            return !isInline && match ? (
              <div className="my-5 shadow-sm rounded-xl overflow-hidden border border-border/50">
                <CodeBlock
                  language={match[1]}
                  value={String(children).replace(/\n$/, "")}
                />
              </div>
            ) : (
              <code
                className="bg-muted/80 px-1.5 py-[2px] rounded-md font-mono text-[0.83em] border border-border/40 text-foreground/90 break-words"
                {...props}
              >
                {children}
              </code>
            );
          },

          // ── Headings ───────────────────────────────────────────────────────
          h1: ({ children }) => (
            <h1 className="text-[1.35em] font-semibold mt-7 mb-4 tracking-tight text-foreground">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-[1.15em] font-semibold mt-6 mb-3 tracking-tight text-foreground">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-[1.05em] font-medium mt-5 mb-2.5 text-foreground/90">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-[0.95em] font-medium mt-4 mb-2 text-foreground/80">
              {children}
            </h4>
          ),

          // ── Paragraph ──────────────────────────────────────────────────────
          p: ({ children }) => (
            <p className="mb-4 leading-[1.7] last:mb-0 text-foreground/90">{children}</p>
          ),

          // ── Lists ──────────────────────────────────────────────────────────
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-4 space-y-1.5 text-foreground/90 leading-[1.7] marker:text-muted-foreground/70">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-4 space-y-1.5 text-foreground/90 leading-[1.7] marker:text-muted-foreground/70">
              {children}
            </ol>
          ),
          li: ({ children }) => {
            return (
              <li className="pl-1">{children}</li>
            );
          },

          // ── Links ──────────────────────────────────────────────────────────
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline transition-all font-medium"
            >
              {children}
            </a>
          ),

          // ── Blockquote ─────────────────────────────────────────────────────
          blockquote: ({ children }) => {
            const extractText = (node: any): string => {
              if (typeof node === "string") return node;
              if (typeof node === "number") return String(node);
              if (Array.isArray(node)) return node.map(extractText).join("");
              if (node && node.props && node.props.children) return extractText(node.props.children);
              return "";
            };
            const text = extractText(children);
            
            if (text.includes("Executing action:")) {
              const isComplete = text.includes("Action completed successfully.") || text.includes("Action failed:");
              return (
                <div className="my-5 rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden flex flex-col">
                  <div className="px-4 py-2.5 border-b border-border/50 bg-muted/40 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[0.85em] font-semibold text-foreground/80 tracking-wide uppercase">
                      {isComplete ? (
                        <Settings className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Settings className="w-4 h-4 text-primary animate-[spin_3s_linear_infinite]" />
                      )}
                      System Action
                    </div>
                    {!isComplete && (
                      <div className="flex space-x-1.5 px-2">
                        <div className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce"></div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 text-[0.9em] text-muted-foreground bg-background/50 leading-relaxed font-mono">
                    {children}
                  </div>
                </div>
              );
            }

            return (
              <blockquote className="border-l-2 border-primary/50 pl-4 my-4 py-0.5 text-foreground/70 italic text-[0.95em]">
                {children}
              </blockquote>
            );
          },

          // ── Horizontal rule ────────────────────────────────────────────────
          hr: () => <hr className="border-border/50 my-5" />,

          // ── Strong / Emphasis ──────────────────────────────────────────────
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground/80">{children}</em>
          ),

          // ── Tables ─────────────────────────────────────────────────────────
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4 rounded-xl border border-border shadow-sm">
              <table className="w-full text-sm text-left">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/70 text-muted-foreground border-b border-border">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-border/40">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2.5 font-semibold text-[11px] uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5 text-foreground/85">{children}</td>
          ),
        }}
      >
        {cleanedContent}
      </ReactMarkdown>
    </div>
  );
}
