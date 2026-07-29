"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { CodeBlock } from "./code-block";
import { MermaidDiagram } from "./mermaid-diagram";
import { Loader2, Settings } from "lucide-react";
import "katex/dist/katex.min.css";

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
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // ── Code ───────────────────────────────────────────────────────────
          code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";
            const isInline = !match && !String(children).includes("\n");
            const codeString = String(children).replace(/\n$/, "");

            if (language === "mermaid") {
              return <MermaidDiagram chart={codeString} />;
            }

            return !isInline && match ? (
              <div className="my-5 shadow-sm rounded-xl overflow-hidden border border-border/50">
                <CodeBlock
                  language={language}
                  value={codeString}
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

          h1: ({ children }) => (
            <h1 className="text-[1.45em] font-bold mt-6 first:mt-0 mb-3 tracking-tight text-white/90">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-[1.25em] font-semibold mt-5 first:mt-0 mb-3 tracking-tight text-white/90">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-[1.1em] font-medium mt-4 first:mt-0 mb-2 text-white/80">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-[1em] font-medium mt-3 first:mt-0 mb-2 text-white/70">
              {children}
            </h4>
          ),

          // ── Paragraph ──────────────────────────────────────────────────────
          p: ({ children }) => (
            <p className="mb-5 leading-[1.8] last:mb-0 text-white/80">{children}</p>
          ),

          // ── Lists ──────────────────────────────────────────────────────────
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-5 space-y-2 text-white/80 leading-[1.8] marker:text-emerald-500/50">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-5 space-y-2 text-white/80 leading-[1.8] marker:text-emerald-500/50">
              {children}
            </ol>
          ),
          li: ({ children }) => {
            return (
              <li className="pl-1.5">{children}</li>
            );
          },

          // ── Links ──────────────────────────────────────────────────────────
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 underline-offset-4 hover:underline transition-all font-medium"
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
                <div className="my-5 rounded-xl border border-white/5 bg-black/20 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-4 py-2.5 border-b border-white/5 bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[0.85em] font-semibold text-white/60 tracking-wide uppercase">
                      {isComplete ? (
                        <Settings className="w-4 h-4 text-white/40" />
                      ) : (
                        <Settings className="w-4 h-4 text-emerald-400 animate-[spin_3s_linear_infinite]" />
                      )}
                      System Action
                    </div>
                    {!isComplete && (
                      <div className="flex space-x-1.5 px-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500/70 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 bg-emerald-500/70 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-emerald-500/70 rounded-full animate-bounce"></div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 text-[0.9em] text-white/50 bg-black/20 leading-relaxed font-mono">
                    {children}
                  </div>
                </div>
              );
            }

            return (
              <blockquote className="border-l-[3px] border-emerald-500/30 pl-5 my-5 py-1 text-white/60 italic text-[0.95em] bg-emerald-500/[0.02] rounded-r-lg">
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
