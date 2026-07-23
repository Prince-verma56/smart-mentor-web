"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarAccordionProps {
  title: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  storageKey?: string;
  collapsed?: boolean;
}

export function SidebarAccordion({
  title,
  defaultExpanded = true,
  children,
  storageKey,
  collapsed = false,
}: SidebarAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (storageKey) {
      const stored = localStorage.getItem(`mentor-accordion-${storageKey}`);
      if (stored !== null) {
        setIsExpanded(stored === "true");
      }
    }
  }, [storageKey]);

  const toggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    if (storageKey) {
      localStorage.setItem(`mentor-accordion-${storageKey}`, String(newState));
    }
  };

  if (collapsed) {
    // When the whole sidebar is collapsed, we don't show the accordion wrapper at all,
    // we just render the children directly (which should adapt to collapsed state).
    return <>{children}</>;
  }

  // Prevent hydration mismatch by using default state until mounted
  const expandedState = mounted ? isExpanded : defaultExpanded;

  return (
    <div className="flex flex-col mb-1 w-full">
      <button
        onClick={toggle}
        className="flex items-center w-full px-4 py-1.5 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground/70 hover:text-foreground hover:bg-muted/30 transition-colors group"
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 mr-1.5 transition-transform duration-200 opacity-50 group-hover:opacity-100",
            expandedState && "rotate-90"
          )}
        />
        {title}
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-200 ease-in-out",
          expandedState ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
