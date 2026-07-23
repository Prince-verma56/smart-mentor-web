"use client";

import {
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenu as ContextMenuRoot,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import type React from "react";

const SPRING_DEFAULT = {
  type: "spring",
  stiffness: 350,
  damping: 25,
};

export interface ContextMenuProps {
  /** The trigger element that opens the context menu on right-click */
  children: React.ReactNode;
  /** Optional CSS class for the content container */
  className?: string;
  /** Menu items to render */
  items: ContextMenuItemConfig[];
}

export interface ContextMenuItemConfig {
  /** Nested submenu items */
  children?: ContextMenuItemConfig[];
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Renders a group label instead of an item */
  groupLabel?: string;
  /** Optional icon to display before the label */
  icon?: React.ReactNode;
  /** Unique key for the item */
  key: string;
  /** Display label */
  label: string;
  /** Callback when item is selected */
  onSelect?: () => void;
  /** Renders a separator instead of an item */
  separator?: boolean;
  /** Optional keyboard shortcut text to display */
  shortcut?: string;
  /** Destructive variant styling */
  variant?: "default" | "destructive";
}

export default function ContextMenu({
  children,
  items,
  className,
}: ContextMenuProps) {
  const shouldReduceMotion = useReducedMotion();

  const renderItem = (item: ContextMenuItemConfig, index: number) => {
    if (item.separator) {
      return <ContextMenuSeparator key={item.key} />;
    }

    if (item.groupLabel) {
      return (
        <ContextMenuLabel key={item.key}>{item.groupLabel}</ContextMenuLabel>
      );
    }

    if (item.children && item.children.length > 0) {
      return (
        <ContextMenuSub key={item.key}>
          <ContextMenuSubTrigger disabled={item.disabled}>
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.label}
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {item.children.map((child, childIndex) =>
              renderItem(child, childIndex)
            )}
          </ContextMenuSubContent>
        </ContextMenuSub>
      );
    }

    return (
      <motion.div
        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
        key={item.key}
        transition={
          (shouldReduceMotion
            ? { duration: 0 }
            : { ...SPRING_DEFAULT, delay: index * 0.02 }) as any
        }
      >
        <ContextMenuItem
          disabled={item.disabled}
          onClick={(e) => {
            // Support Base UI which uses standard onClick
            item.onSelect?.();
          }}
          onSelect={(e) => {
            // Support Radix UI which uses onSelect custom event
            e.preventDefault();
            item.onSelect?.();
          }}
          variant={item.variant}
        >
          {item.icon && <span className="mr-2">{item.icon}</span>}
          {item.label}
          {item.shortcut && (
            <ContextMenuShortcut>{item.shortcut}</ContextMenuShortcut>
          )}
        </ContextMenuItem>
      </motion.div>
    );
  };

  return (
    <ContextMenuRoot>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className={cn("origin-top", className)}>
        <motion.div
          animate={
            shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }
          }
          initial={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 0, scale: 0.95, y: -4 }
          }
          transition={(shouldReduceMotion ? { duration: 0 } : SPRING_DEFAULT) as any}
        >
          <ContextMenuGroup>
            {items.map((item, index) => renderItem(item, index))}
          </ContextMenuGroup>
        </motion.div>
      </ContextMenuContent>
    </ContextMenuRoot>
  );
}
