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
  // Hide internal AI signals from the display
  const cleanedContent = content
    .replace(/LESSON_COMPLETE_SUGGESTION:\s*.+/g, "")
    .replace(/REVISION_SUGGESTION:\s*.+/g, "")
    .trim();

  return (
    <div className={compact ? "text-xs" : "text-sm"}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Code blocks
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
                className="bg-muted/70 px-1.5 py-0.5 rounded-md font-mono text-[0.85em] border border-border/50 text-foreground"
                {...props}
              >
                {children}
              </code>
            );
          },

          // Headings
          h1: ({ children }) => (
            <h1 className="text-xl font-bold mt-6 mb-3 pb-2 border-b border-border/50 tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold mt-5 mb-2.5 tracking-tight">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold mt-4 mb-2 text-foreground/90">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-semibold mt-3 mb-1.5">{children}</h4>
          ),

          // Paragraphs
          p: ({ children }) => (
            <p className="mb-3 leading-7 last:mb-0">{children}</p>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className="list-none pl-0 mb-3 space-y-1.5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-3 space-y-1.5">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-2 leading-6">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
              <span className="flex-1">{children}</span>
            </li>
          ),

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-2 underline hover:text-primary/80 transition-colors"
            >
              {children}
            </a>
          ),

          // Blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-[3px] border-primary/40 pl-4 italic text-muted-foreground my-4 py-1">
              {children}
            </blockquote>
          ),

          // Horizontal rule
          hr: () => <hr className="border-border my-5" />,

          // Strong / emphasis
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground/80">{children}</em>
          ),

          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4 rounded-lg border border-border">
              <table className="w-full text-sm text-left">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/60 text-muted-foreground border-b border-border">
              {children}
            </thead>
          ),
          tbody: ({ children }) => <tbody className="divide-y divide-border/50">{children}</tbody>,
          th: ({ children }) => (
            <th className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wide">{children}</th>
          ),
          td: ({ children }) => <td className="px-4 py-2.5">{children}</td>,
        }}
      >
        {cleanedContent}
      </ReactMarkdown>
    </div>
  );
}
