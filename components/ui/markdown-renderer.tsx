"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block";

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
              <CodeBlock
                language={match[1]}
                value={String(children).replace(/\n$/, "")}
              />
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
            <h1 className="text-[1.25em] font-bold mt-6 mb-3 pb-2 border-b border-border/50 tracking-tight text-foreground">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-[1.1em] font-semibold mt-5 mb-2.5 tracking-tight text-foreground">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-[1em] font-semibold mt-4 mb-2 text-foreground/90">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-[0.9em] font-semibold mt-3 mb-1.5 text-foreground/80">
              {children}
            </h4>
          ),

          // ── Paragraph ──────────────────────────────────────────────────────
          p: ({ children }) => (
            <p className="mb-3 leading-[1.75] last:mb-0 text-foreground/90">{children}</p>
          ),

          // ── Lists ──────────────────────────────────────────────────────────
          ul: ({ children }) => (
            <ul className="list-none pl-0 mb-3 space-y-1.5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-3 space-y-1.5 marker:text-muted-foreground marker:text-[0.85em]">
              {children}
            </ol>
          ),
          li: ({ children, ordered, ...props }: any) => {
            // For ordered list items React renders them inside ol — don't prepend dot
            const isOrdered = (props as any).node?.parent?.type === "list" &&
              (props as any).node?.parent?.ordered;
            if (isOrdered) {
              return (
                <li className="leading-[1.7] pl-1 text-foreground/85">{children}</li>
              );
            }
            return (
              <li className="flex items-start gap-2 leading-[1.7]">
                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-primary/50 shrink-0" />
                <span className="flex-1 text-foreground/85">{children}</span>
              </li>
            );
          },

          // ── Links ──────────────────────────────────────────────────────────
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-2 underline hover:text-primary/75 transition-colors font-medium"
            >
              {children}
            </a>
          ),

          // ── Blockquote ─────────────────────────────────────────────────────
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary/50 pl-4 my-4 py-1 bg-primary/5 rounded-r-lg">
              <div className="italic text-muted-foreground text-[0.95em] leading-relaxed">
                {children}
              </div>
            </blockquote>
          ),

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
