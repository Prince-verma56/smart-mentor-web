"use client";

import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { CodeBlock } from "./code-block";
import { MermaidDiagram } from "./mermaid-diagram";
import { Settings } from "lucide-react";
import { motion } from "framer-motion";
import "katex/dist/katex.min.css";

// ── Helper to style the streaming cursor ─────────────────────────────────────────
const renderWithCursor = (children: React.ReactNode) => {
  return React.Children.map(children, (child) => {
    if (typeof child === "string") {
      if (child.includes("█")) {
        const parts = child.split("█");
        return (
          <>
            {parts[0]}
            <span className="inline-block w-[0.6em] h-[1em] bg-emerald-500 mx-[2px] animate-[blink_1s_ease-in-out_infinite] align-middle rounded-[1px] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            {parts[1]}
          </>
        );
      }
    }
    return child;
  });
};

// ── Static Components Map ────────────────────────────────────────────────────────
const markdownComponents: any = {
  // ── Code ───────────────────────────────────────────────────────────
  code({ className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";
    const isInline = !match && !String(children).includes("\n");
    const codeString = String(children).replace(/\n$/, "");

    if (language === "mermaid") {
      return <MermaidDiagram chart={codeString} />;
    }

    const isStreamingCode = codeString.endsWith("█");
    const displayCode = isStreamingCode ? codeString.slice(0, -1) : codeString;

    return !isInline && match ? (
      <motion.div 
        initial={{ opacity: 0, y: 8 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.2 }}
        className="my-5 shadow-sm rounded-xl overflow-hidden border border-border/50"
      >
        {isStreamingCode ? (
          <div className="p-4 bg-black/40 font-mono text-[0.85em] text-white/80 overflow-x-auto whitespace-pre">
            {displayCode}
            <span className="inline-block w-[0.6em] h-[1em] bg-emerald-500 mx-[2px] animate-[blink_1s_ease-in-out_infinite] align-middle rounded-[1px] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
        ) : (
          <CodeBlock
            language={language}
            value={displayCode}
          />
        )}
      </motion.div>
    ) : (
      <code
        className="bg-muted/80 px-1.5 py-[2px] rounded-md font-mono text-[0.83em] border border-border/40 text-foreground/90 break-words"
        {...props}
      >
        {displayCode}
        {isStreamingCode && <span className="inline-block w-[0.6em] h-[1em] bg-emerald-500 mx-[2px] animate-[blink_1s_ease-in-out_infinite] align-middle rounded-[1px] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
      </code>
    );
  },

  h1: ({ children }: any) => (
    <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="text-[1.45em] font-bold mt-6 first:mt-0 mb-3 tracking-tight text-white/90">
      {renderWithCursor(children)}
    </motion.h1>
  ),
  h2: ({ children }: any) => (
    <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="text-[1.25em] font-semibold mt-5 first:mt-0 mb-3 tracking-tight text-white/90">
      {renderWithCursor(children)}
    </motion.h2>
  ),
  h3: ({ children }: any) => (
    <motion.h3 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="text-[1.1em] font-medium mt-4 first:mt-0 mb-2 text-white/80">
      {renderWithCursor(children)}
    </motion.h3>
  ),
  h4: ({ children }: any) => (
    <motion.h4 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="text-[1em] font-medium mt-3 first:mt-0 mb-2 text-white/70">
      {renderWithCursor(children)}
    </motion.h4>
  ),

  // ── Paragraph ──────────────────────────────────────────────────────
  p: ({ children }: any) => (
    <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="mb-5 leading-[1.8] last:mb-0 text-white/80">{renderWithCursor(children)}</motion.p>
  ),

  // ── Lists ──────────────────────────────────────────────────────────
  ul: ({ children }: any) => (
    <motion.ul initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="list-disc pl-6 mb-5 space-y-2 text-white/80 leading-[1.8] marker:text-emerald-500/50">{children}</motion.ul>
  ),
  ol: ({ children }: any) => (
    <motion.ol initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="list-decimal pl-6 mb-5 space-y-2 text-white/80 leading-[1.8] marker:text-emerald-500/50">
      {children}
    </motion.ol>
  ),
  li: ({ children }: any) => (
    <motion.li initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="pl-1.5">{renderWithCursor(children)}</motion.li>
  ),

  // ── Blockquote ─────────────────────────────────────────────────────
  blockquote: ({ children }: any) => {
    const extractText = (node: any): string => {
      if (typeof node === "string") return node;
      if (typeof node === "number") return String(node);
      if (Array.isArray(node)) return node.map(extractText).join("");
      if (node && node.props && node.props.children) return extractText(node.props.children);
      return "";
    };
    const text = extractText(children);
    
    if (text.includes("LESSON_COMPLETE_SUGGESTION:")) return null;

    if (text.includes("THINKING:")) {
      return (
        <div className="my-5 border border-emerald-500/20 bg-emerald-500/[0.03] rounded-xl overflow-hidden shadow-sm">
          <div className="bg-emerald-500/10 px-4 py-2 border-b border-emerald-500/20 flex items-center gap-2">
            <Settings className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
              AI Reasoning
            </span>
          </div>
          <div className="p-4 text-[0.9em] text-white/50 bg-black/20 leading-relaxed font-mono">
            {children}
          </div>
        </div>
      );
    }

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
  strong: ({ children }: any) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }: any) => (
    <em className="italic text-foreground/80">{children}</em>
  ),

  // ── Tables ─────────────────────────────────────────────────────────
  table: ({ children }: any) => (
    <div className="overflow-x-auto mb-4 rounded-xl border border-border shadow-sm">
      <table className="w-full text-sm text-left">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-muted/70 text-muted-foreground border-b border-border">
      {children}
    </thead>
  ),
  tbody: ({ children }: any) => (
    <tbody className="divide-y divide-border/40">{children}</tbody>
  ),
  tr: ({ children }: any) => (
    <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
  ),
  th: ({ children }: any) => (
    <th className="px-4 py-2.5 font-semibold text-[11px] uppercase tracking-wider">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-4 py-2.5 text-foreground/85">{children}</td>
  ),
  
  // ── Interactive / Task Lists ───────────────────────────────────────
  input: ({ type, checked }: any) => {
    if (type === "checkbox") {
      return (
        <input
          type="checkbox"
          checked={checked}
          readOnly
          className="mr-2 mt-1 rounded-sm border-white/20 bg-transparent text-emerald-500 focus:ring-emerald-500 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
        />
      );
    }
    return <input type={type} />;
  },

  // ── Links ──────────────────────────────────────────────────────────
  a: ({ href, children }: any) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 decoration-emerald-500/30 hover:decoration-emerald-400 transition-colors"
    >
      {children}
    </a>
  ),
};

interface MarkdownRendererProps {
  content: string;
  compact?: boolean;
}

export const MarkdownRenderer = memo(function MarkdownRenderer({ content, compact = false }: MarkdownRendererProps) {
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
        components={markdownComponents}
      >
        {cleanedContent}
      </ReactMarkdown>
    </div>
  );
});
