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
    <div className="relative my-4 rounded-xl overflow-hidden border border-border bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <span className="text-xs font-mono text-muted-foreground select-none">
          {language}
        </span>
        <div className="flex items-center gap-2">
          {isLongCode && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-white"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-6 w-6 text-muted-foreground hover:text-white", isWrapped && "text-white bg-muted")}
            onClick={() => setIsWrapped(!isWrapped)}
            title="Toggle word wrap"
          >
            <WrapText className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-white"
            onClick={copyToClipboard}
          >
            {isCopied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
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
            padding: "1rem",
            background: "transparent",
            fontSize: "0.875rem",
          }}
          showLineNumbers={true}
          wrapLines={isWrapped}
          wrapLongLines={isWrapped}
          lineNumberStyle={{
            minWidth: "2.5em",
            paddingRight: "1em",
            color: "#6e7681",
            textAlign: "right",
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
      {!isExpanded && (
        <div className="px-4 py-3 text-xs text-foreground0 italic bg-[#1e1e1e] flex justify-center cursor-pointer hover:text-zinc-300" onClick={() => setIsExpanded(true)}>
          Code block collapsed ({codeLines.length} lines). Click to expand.
        </div>
      )}
    </div>
  );
}
