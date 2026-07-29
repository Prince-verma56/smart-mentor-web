"use client";

import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, FileUp, ImageUp, Globe, Microscope, ImagePlus, Brain, BookOpen, Map, History, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ContextState {
  memory: boolean;
  knowledge: boolean;
  roadmap: boolean;
  files: boolean;
  webSearch: boolean;
}

interface PlusMenuProps {
  contextState: ContextState;
  setContextState: React.Dispatch<React.SetStateAction<ContextState>>;
  onAttachClick: () => void;
  disabled?: boolean;
}

export function PlusMenu({ contextState, setContextState, onAttachClick, disabled }: PlusMenuProps) {
  const [open, setOpen] = useState(false);

  const toggleContext = (key: keyof ContextState) => {
    setContextState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger 
        disabled={disabled}
        className={cn(
          "h-8 w-8 flex items-center justify-center rounded-full transition-colors",
          disabled && "pointer-events-none opacity-50",
          open ? "bg-muted/80 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
        title="Add tools and context"
      >
        <Plus className="h-5 w-5" />
      </PopoverTrigger>
      <PopoverContent 
        align="start" 
        sideOffset={8} 
        className="w-[300px] p-2 rounded-xl bg-card border border-border shadow-2xl flex flex-col gap-1"
      >
        
        {/* Upload Actions */}
        <MenuItem 
          icon={FileUp} title="Upload Files" subtitle="Documents, code, text" 
          onClick={() => { onAttachClick(); setOpen(false); }} 
        />
        <MenuItem 
          icon={ImageUp} title="Upload Images" subtitle="JPG, PNG, WebP" 
          onClick={() => { onAttachClick(); setOpen(false); }} 
        />
        
        <div className="h-px bg-border my-1 mx-2" />

        {/* Tools */}
        <MenuItemToggle
          icon={Globe} title="Web Search" subtitle="Enable internet search"
          active={contextState.webSearch} onClick={() => toggleContext("webSearch")}
        />
        <MenuItemToggle
          icon={Microscope} title="Deep Research" subtitle="Multi-step research mode"
          active={false} onClick={() => {}} disabled
        />
        <MenuItemToggle
          icon={ImagePlus} title="Generate Image" subtitle="Create AI images"
          active={false} onClick={() => {}} disabled
        />

        <div className="h-px bg-border my-1 mx-2" />

        {/* Workspace Context */}
        <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Workspace Context
        </div>
        <MenuItemToggle
          icon={Brain} title="Memory" subtitle="Remember past context"
          active={contextState.memory} onClick={() => toggleContext("memory")}
        />
        <MenuItemToggle
          icon={BookOpen} title="Knowledge Base" subtitle="Search workspace documents"
          active={contextState.knowledge} onClick={() => toggleContext("knowledge")}
        />
        <MenuItemToggle
          icon={Map} title="Roadmap" subtitle="Use Current Lesson"
          active={contextState.roadmap} onClick={() => toggleContext("roadmap")}
        />
        <MenuItemToggle
          icon={History} title="Conversation History" subtitle="Reference past chats"
          active={false} onClick={() => {}} disabled
        />
        <MenuItemToggle
          icon={Bookmark} title="Bookmarks" subtitle="Reference saved items"
          active={false} onClick={() => {}} disabled
        />

      </PopoverContent>
    </Popover>
  );
}

// ── Helper Components ────────────────────────────────────────────────────────

function MenuItem({ icon: Icon, title, subtitle, onClick, disabled }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-3 w-full p-2 rounded-lg text-left transition-colors hover:bg-muted/50 group",
        disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
      )}
    >
      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <div className="flex flex-col">
        <span className="text-[13px] font-medium leading-none mb-1">{title}</span>
        <span className="text-[11px] text-muted-foreground leading-none">{subtitle}</span>
      </div>
    </button>
  );
}

function MenuItemToggle({ icon: Icon, title, subtitle, active, onClick, disabled }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center justify-between w-full p-2 rounded-lg text-left transition-colors hover:bg-muted/50 group",
        disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "h-8 w-8 rounded-md flex items-center justify-center shrink-0 transition-colors",
          active ? "bg-primary/20" : "bg-muted"
        )}>
          <Icon className={cn("h-4 w-4 transition-colors", active ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-medium leading-none mb-1">{title}</span>
          <span className="text-[11px] text-muted-foreground leading-none">{subtitle}</span>
        </div>
      </div>
      <div className={cn(
        "w-8 h-4 rounded-full relative transition-colors duration-200 border",
        active ? "bg-primary border-primary" : "bg-muted border-border"
      )}>
        <div className={cn(
          "absolute top-[1px] left-[1px] w-3 h-3 rounded-full bg-white transition-transform duration-200 shadow-sm",
          active ? "translate-x-[14px]" : "translate-x-0 bg-muted-foreground"
        )} />
      </div>
    </button>
  );
}
