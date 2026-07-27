"use client";

import * as React from "react";
import { Search, Command as CommandIcon } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export interface PremiumCommandPaletteItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface PremiumCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: PremiumCommandPaletteItem[];
  onSelect: (item: PremiumCommandPaletteItem) => void;
  placeholder?: string;
  emptyMessage?: string;
  title?: string;
  description?: string;
}

export function PremiumCommandPalette({
  open,
  onOpenChange,
  items,
  onSelect,
  placeholder = "Search...",
  emptyMessage = "No results found.",
  title,
  description,
}: PremiumCommandPaletteProps) {
  return (
    <CommandDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      className="bg-black/60 backdrop-blur-3xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-2xl sm:max-w-[650px] overflow-hidden"
    >
      <CommandInput 
        placeholder={placeholder} 
        className="h-16 text-lg placeholder:text-muted-foreground/50 border-0 focus:ring-0 bg-transparent text-white pl-4"
      />
      <CommandList className="max-h-[350px] p-3 no-scrollbar">
        <CommandEmpty className="py-12 text-center text-muted-foreground/60 text-sm">
          {emptyMessage}
        </CommandEmpty>
        <CommandGroup>
          {items.map((item) => (
            <CommandItem
              key={item.id}
              value={item.label}
              onSelect={() => {
                onSelect(item);
                onOpenChange(false);
              }}
              className={cn(
                "group relative flex cursor-pointer items-center gap-4 rounded-xl px-4 py-3 my-1",
                "transition-all duration-300 ease-out",
                "data-[selected=true]:bg-white/[0.08] data-[selected=true]:text-white",
                "hover:bg-white/[0.08] hover:text-white"
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-muted-foreground/70 group-hover:text-emerald-400 group-hover:bg-emerald-400/10 transition-colors">
                {item.icon || <CommandIcon className="h-4 w-4" />}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate font-medium text-[15px]">{item.label}</span>
                {item.description && (
                  <span className="truncate text-xs text-muted-foreground/60 group-hover:text-muted-foreground/80 mt-0.5">
                    {item.description}
                  </span>
                )}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

// Reusable trigger button for sidebar and mentor grid
export function CommandTrigger({
  onClick,
  placeholder = "Search... ⌘K",
  className,
  isCollapsed = false,
}: {
  onClick: () => void;
  placeholder?: string;
  className?: string;
  isCollapsed?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex items-center transition-all duration-300 ease-out",
        "bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10",
        "text-muted-foreground hover:text-foreground shadow-sm",
        isCollapsed ? "justify-center h-10 w-10 rounded-xl" : "h-10 w-full rounded-xl px-3 gap-3",
        className
      )}
    >
      <Search className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
      {!isCollapsed && (
        <>
          <span className="text-sm truncate flex-1 text-left opacity-70 group-hover:opacity-100 transition-opacity">
            {placeholder}
          </span>
          <div className="flex shrink-0 items-center gap-1 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            <span>⌘</span>
            <span>K</span>
          </div>
        </>
      )}
    </button>
  );
}
