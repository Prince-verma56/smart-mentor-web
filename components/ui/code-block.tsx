"use client";

import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Check, Copy, ChevronDown, ChevronUp, WrapText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  language: string;
  value: string;
}

export function CodeBlock({ language, value }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isWrapped, setIsWrapped] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const codeLines = value.split("\n");
  const isLongCode = codeLines.length > 20;

  return (
    <div className="relative my-6 rounded-[16px] overflow-hidden border border-white/5 bg-black/40 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)] group hover:shadow-[0_8px_32px_rgba(16,185,129,0.08)] hover:border-white/10 transition-all duration-500">
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-b border-white/5">
        <div className="flex items-center gap-2">
          {/* Editor Dots */}
          <div className="flex gap-1.5 mr-2">
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          </div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-400/80 select-none bg-emerald-500/10 px-2 py-0.5 rounded-md">
            {language}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {isLongCode && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md text-white/40 hover:text-white hover:bg-white/10"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7 rounded-md text-white/40 hover:text-white hover:bg-white/10", isWrapped && "text-emerald-400 bg-emerald-500/10")}
            onClick={() => setIsWrapped(!isWrapped)}
            title="Toggle word wrap"
          >
            <WrapText className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md text-white/40 hover:text-white hover:bg-white/10"
            onClick={copyToClipboard}
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <div className={isExpanded ? "block" : "hidden"}>
        <SyntaxHighlighter
          language={language || "text"}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: "1.25rem 1rem",
            background: "transparent",
            fontSize: "0.875rem",
          }}
          showLineNumbers={true}
          wrapLines={isWrapped}
          wrapLongLines={isWrapped}
          lineNumberStyle={{
            minWidth: "2.5em",
            paddingRight: "1em",
            color: "rgba(255,255,255,0.2)",
            textAlign: "right",
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
      {!isExpanded && (
        <div className="px-4 py-3 text-xs text-white/40 italic flex justify-center cursor-pointer hover:text-white/80 transition-colors bg-white/[0.02]" onClick={() => setIsExpanded(true)}>
          Code block collapsed ({codeLines.length} lines). Click to expand.
        </div>
      )}
    </div>
  );
}
