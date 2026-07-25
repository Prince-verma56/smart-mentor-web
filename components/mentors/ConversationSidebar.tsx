"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Plus,
  Search,
  Pin,
  PinOff,
  Star,
  StarOff,
  Archive,
  ArchiveRestore,
  Trash2,
  Pencil,
  Copy,
  Mic,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Check,
  X,
  Target,
  Command,
  Map,
  Sparkles,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ContextMenu, { type ContextMenuItemConfig } from "@/components/ui/smoothui/context-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useConversation } from "@/contexts/ConversationContext";
import type { ChatSession } from "@/types/session";
import { formatDistanceToNow, isToday, isYesterday, subDays, isAfter } from "date-fns";

// ─── Props ───────────────────────────────────────────────────────────────────

interface ConversationSidebarProps {
  collapsed?: boolean;
}

// ─── Time grouping ────────────────────────────────────────────────────────────

function getTimeGroup(session: ChatSession): string {
  const date = new Date(session.last_message_at || session.created_at);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  if (isAfter(date, subDays(new Date(), 7))) return "This Week";
  if (isAfter(date, subDays(new Date(), 30))) return "Earlier This Month";
  return "Older";
}

const TIME_GROUP_ORDER = ["Today", "Yesterday", "This Week", "Earlier This Month", "Older"];

// ─── Session Row ─────────────────────────────────────────────────────────────

interface SessionRowProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onRename: (id: string, title: string) => void;
  onPin: (id: string, pinned: boolean) => void;
  onFavorite: (id: string, fav: boolean) => void;
  onArchive: (id: string, archived: boolean) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string, title: string) => void;
}

function SessionRow({
  session,
  isActive,
  onSelect,
  onRename,
  onPin,
  onFavorite,
  onArchive,
  onDuplicate,
  onDelete,
}: SessionRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title || "");
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync title if it changes from outside (AI generation via realtime)
  useEffect(() => {
    if (!isEditing) {
      setEditTitle(session.title || "");
    }
  }, [session.title, isEditing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleRenameConfirm = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== session.title) {
      onRename(session.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleRenameCancel = () => {
    setEditTitle(session.title || "");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRenameConfirm();
    if (e.key === "Escape") handleRenameCancel();
  };

  const timeAgo = session.last_message_at || session.created_at
    ? formatDistanceToNow(new Date(session.last_message_at || session.created_at), { addSuffix: false })
        .replace("about ", "")
        .replace(" minutes", "m")
        .replace(" minute", "m")
        .replace(" hours", "h")
        .replace(" hour", "h")
        .replace(" days", "d")
        .replace(" day", "d")
    : "";

  // Extract a short preview from ai_summary or summary
  const preview = session.ai_summary
    ? session.ai_summary.replace(/\[Voice Session\]\n?/, "").split("\n")[0]?.replace(/^SUMMARY:\s*/i, "").slice(0, 55)
    : session.summary
    ? session.summary.slice(0, 55)
    : null;

  // Standardize the color for the icon instead of dynamic colors
  const colorClass = "text-primary bg-primary/10";

  // Construct ContextMenu items
  const menuItems: ContextMenuItemConfig[] = [
    {
      key: "rename",
      label: "Rename",
      icon: <Pencil className="h-3.5 w-3.5" />,
      onSelect: () => {
        setIsEditing(true);
      },
    },
    {
      key: "pin",
      label: session.is_pinned ? "Unpin" : "Pin",
      icon: session.is_pinned
        ? <PinOff className="h-3.5 w-3.5" />
        : <Pin className="h-3.5 w-3.5" />,
      onSelect: () => onPin(session.id, !session.is_pinned),
    },
    {
      key: "favorite",
      label: session.is_favorite ? "Unfavorite" : "Favorite",
      icon: session.is_favorite
        ? <StarOff className="h-3.5 w-3.5" />
        : <Star className="h-3.5 w-3.5" />,
      onSelect: () => onFavorite(session.id, !session.is_favorite),
    },
    {
      key: "archive",
      label: session.is_archived ? "Restore" : "Archive",
      icon: session.is_archived
        ? <ArchiveRestore className="h-3.5 w-3.5" />
        : <Archive className="h-3.5 w-3.5" />,
      onSelect: () => onArchive(session.id, !session.is_archived),
    },
    {
      key: "duplicate",
      label: "Duplicate",
      icon: <Copy className="h-3.5 w-3.5" />,
      onSelect: () => onDuplicate(session.id),
    },
    {
      key: "sep",
      label: "",
      separator: true,
    },
    {
      key: "delete",
      label: "Delete",
      icon: <Trash2 className="h-3.5 w-3.5" />,
      onSelect: () => onDelete(session.id, session.title || "Conversation"),
      variant: "destructive",
    },
  ];

  return (
    <ContextMenu items={menuItems}>
      <div
        className={cn(
          "group relative flex items-start gap-2.5 rounded-xl mx-2 my-1 transition-all duration-150 cursor-pointer border overflow-hidden",
          "min-h-[44px] p-2",
          isActive
            ? "bg-card/90 text-foreground border-border/50 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] scale-[1.01]"
            : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:shadow-sm"
        )}
        onClick={() => !isEditing && onSelect()}
      >
      {/* Left indicator bar (Active state) */}
      {isActive && (
        <motion.div 
          layoutId="active-indicator"
          className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-primary rounded-r-full shadow-[0_0_8px_rgba(var(--primary),0.6)]"
        />
      )}

      {/* Left icon */}
      <div className={cn(
        "flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg transition-colors mt-[2px] relative z-10",
        isActive ? "text-primary bg-primary/15 ring-1 ring-primary/20" : "text-muted-foreground/50 group-hover:text-muted-foreground/80 group-hover:bg-muted/80"
      )}>
        <MessageSquare className="h-[16px] w-[16px]" strokeWidth={isActive ? 2.5 : 2} />
      </div>

      {/* Title / Edit input */}
      <div className="flex flex-col flex-1 min-w-0 pt-0.5 relative z-10">
        {isEditing ? (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Input
              ref={inputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-6 text-[12px] px-1.5 py-0 bg-background border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/50 shadow-sm"
            />
            <button
              onClick={(e) => { e.stopPropagation(); handleRenameConfirm(); }}
              className="h-5 w-5 flex items-center justify-center rounded text-primary hover:bg-primary/10 shrink-0 transition-colors"
            >
              <Check className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleRenameCancel(); }}
              className="h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:bg-muted shrink-0 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <>
            <span className={cn(
              "text-[13px] leading-snug truncate",
              isActive ? "text-foreground font-semibold" : "text-foreground/90 font-medium group-hover:text-foreground"
            )}>
              {session.title || "New Conversation"}
            </span>
            {preview && (
              <span className="text-[11px] text-muted-foreground/60 truncate leading-tight mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                {preview}
              </span>
            )}
            
            {/* Compact Metadata Row */}
            <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-muted-foreground/50 font-medium">
              <span>{timeAgo}</span>
              {(session.is_pinned || session.is_favorite || (session.voice_count || 0) > 0) && (
                <span className="w-1 h-1 rounded-full bg-border/80" />
              )}
              {session.is_pinned && <Pin className="h-3 w-3 text-primary/80 shrink-0" />}
              {session.is_favorite && <Star className="h-3 w-3 fill-amber-500/50 text-amber-500 shrink-0" />}
              {(session.voice_count || 0) > 0 && <Mic className="h-3 w-3 text-blue-400/80 shrink-0" />}
            </div>
          </>
        )}
      </div>

      {/* Menu on hover */}
      {!isEditing && (
        <div className={cn(
          "flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all absolute right-2 top-1/2 -translate-y-1/2 z-20",
          isActive ? "bg-card/90" : "bg-card/60 backdrop-blur-sm rounded-md"
        )}>
          <button
            onClick={(e) => { 
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.dispatchEvent(
                new MouseEvent("contextmenu", {
                  bubbles: true,
                  clientX: rect.x,
                  clientY: rect.y + 10,
                })
              );
            }}
            className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-background hover:shadow-sm transition-all cursor-pointer"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
    </ContextMenu>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({
  label,
  count,
  collapsible = false,
  collapsed: sectionCollapsed = false,
  onToggle,
}: {
  label: string;
  count?: number;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-3 pt-5 pb-2 mt-2 border-t border-border/40 first:border-0 first:pt-2 first:mt-0",
        collapsible && "cursor-pointer hover:text-foreground"
      )}
      onClick={collapsible ? onToggle : undefined}
    >
      <div className="flex items-center gap-1">
        {collapsible && (
          sectionCollapsed
            ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 transition-transform hover:text-foreground" />
            : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 transition-transform hover:text-foreground" />
        )}
        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest pl-1">
          {label}
        </span>
      </div>
      {count !== undefined && count > 0 && (
        <span className="text-[10px] font-medium text-muted-foreground/40 bg-muted/80 px-2 py-0.5 rounded-full border border-border/50">
          {count}
        </span>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ConversationSidebar({ collapsed = false }: ConversationSidebarProps) {
  const {
    sessions,
    isLoadingSessions,
    activeSessionId,
    setActiveSession,
    createNewSession,
    deleteSession,
    renameSession,
    pinSession,
    archiveSession,
    favoriteSession,
    duplicateSession,
  } = useConversation();

  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [viewArchived, setViewArchived] = useState(false);

  // ── Filter sessions ────────────────────────────────────────────────────────
  const filtered = sessions.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (s.title || "").toLowerCase().includes(q) ||
      (s.ai_summary || "").toLowerCase().includes(q) ||
      (s.summary || "").toLowerCase().includes(q) ||
      (s.description || "").toLowerCase().includes(q)
    );
  });

  // ── Split into sections ────────────────────────────────────────────────────
  const pinned = filtered.filter((s) => s.is_pinned && !s.is_archived);
  const favorites = filtered.filter((s) => s.is_favorite && !s.is_pinned && !s.is_archived);
  const archived = filtered.filter((s) => s.is_archived);
  const regular = filtered.filter((s) => !s.is_pinned && !s.is_archived && !s.is_favorite);

  // Group regular by time
  const grouped = TIME_GROUP_ORDER.reduce((acc, group) => {
    const items = regular.filter((s) => getTimeGroup(s) === group);
    if (items.length > 0) acc[group] = items;
    return acc;
  }, {} as Record<string, ChatSession[]>);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSelect = useCallback(
    (id: string) => setActiveSession(id),
    [setActiveSession]
  );

  const handleRename = useCallback(
    async (id: string, title: string) => { await renameSession(id, title); },
    [renameSession]
  );

  const handlePin = useCallback(
    async (id: string, pinned: boolean) => { await pinSession(id, pinned); },
    [pinSession]
  );

  const handleFavorite = useCallback(
    async (id: string, fav: boolean) => { await favoriteSession(id, fav); },
    [favoriteSession]
  );

  const handleArchive = useCallback(
    async (id: string, archived: boolean) => { await archiveSession(id, archived); },
    [archiveSession]
  );

  const handleDuplicate = useCallback(
    async (id: string) => { await duplicateSession(id); },
    [duplicateSession]
  );

  const handleDeleteRequest = useCallback(
    (id: string, title: string) => { setDeleteTarget({ id, title }); },
    []
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteSession(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteSession]);

  // ── Collapsed mode: just a list of chat icons ─────────────────────────────
  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1 py-1 px-0">
        <button
          onClick={() => createNewSession()}
          className="h-9 w-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all"
          title="New Chat"
        >
          <Plus className="h-4 w-4" />
        </button>
        {sessions.slice(0, 8).map((session) => (
          <button
            key={session.id}
            onClick={() => handleSelect(session.id)}
            title={session.title || "Conversation"}
            className={cn(
              "h-9 w-9 flex items-center justify-center rounded-xl transition-all",
              activeSessionId === session.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground/50 hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <MessageSquare className="h-4 w-4" strokeWidth={activeSessionId === session.id ? 2.5 : 1.8} />
          </button>
        ))}
      </div>
    );
  }

  // ── Full sidebar ───────────────────────────────────────────────────────────
  return (
    <>
      {/* Universal Search (Command Palette Style) */}
      <div className="px-4 mb-4 mt-2">
        <div className="relative group/search cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl opacity-0 group-hover/search:opacity-100 transition-opacity blur-md" />
          <div className="relative flex items-center h-10 bg-card/60 border border-border/60 hover:border-primary/40 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-300">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-hover/search:text-primary transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full h-full pl-9 pr-12 text-[13px] bg-transparent text-foreground placeholder:text-muted-foreground/40 outline-none"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              <span className="flex items-center justify-center h-[22px] px-2 rounded-md bg-muted/80 text-[10px] font-semibold text-muted-foreground/70 border border-border/50 shadow-sm pointer-events-none select-none">
                ⌘K
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoadingSessions && (
        <div className="space-y-1 px-2 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 rounded-md bg-muted/20 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoadingSessions && sessions.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center px-4">
          <MessageSquare className="h-8 w-8 text-muted-foreground/20" />
          <p className="text-[11px] text-muted-foreground/50">
            No conversations yet.<br />Start chatting to begin learning.
          </p>
        </div>
      )}

      {/* View Toggle */}
      {!isLoadingSessions && sessions.length > 0 && !search && (
        <div className="px-5 mb-3">
          <div className="flex items-center border-b border-border/40 relative h-9">
            <button
              onClick={() => setViewArchived(false)}
              className={cn(
                "flex-1 text-[12px] font-semibold py-2 transition-all relative flex items-center justify-center gap-1.5",
                !viewArchived ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Active
            </button>
            <button
              onClick={() => setViewArchived(true)}
              className={cn(
                "flex-1 text-[12px] font-semibold py-2 transition-all relative flex items-center justify-center gap-1.5",
                viewArchived ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Archived {archived.length > 0 && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">{archived.length}</span>}
            </button>
            <motion.div
              layout
              className="absolute bottom-0 h-[2px] bg-primary w-1/2 rounded-t-full shadow-[0_-1px_6px_rgba(var(--primary),0.5)]"
              animate={{ x: viewArchived ? "100%" : "0%" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </div>
        </div>
      )}

      {/* Conversation Statistics */}
      {!isLoadingSessions && sessions.length > 0 && !search && !viewArchived && (
        <div className="px-3 mb-2">
          <div className="flex items-center justify-center gap-2 text-[10.5px] font-medium text-muted-foreground/70 py-1 bg-transparent">
            <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {sessions.length} Chats</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Pin className="h-3 w-3" /> {pinned.length} Pinned</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Archive className="h-3 w-3" /> {archived.length} Archived</span>
          </div>
        </div>
      )}

      {/* ── Active View ───────────────────────────────────────────────────────── */}
      <ScrollArea className="flex-1 overflow-y-auto" data-lenis-prevent="true">
        <div className="relative pb-12">
        <AnimatePresence mode="popLayout">
          {(!viewArchived || search) && (
            <motion.div
              key="active-view"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
          {/* ── Pinned ───────────────────────────────────────────────────────────── */}
          {pinned.length > 0 && (
            <div className="mb-2">
              <SectionHeader label="Pinned" count={pinned.length} />
              {pinned.map((s) => (
                <SessionRow
                  key={s.id}
                  session={s}
                  isActive={activeSessionId === s.id}
                  onSelect={() => handleSelect(s.id)}
                  onRename={handleRename}
                  onPin={handlePin}
                  onFavorite={handleFavorite}
                  onArchive={handleArchive}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDeleteRequest}
                />
              ))}
            </div>
          )}

          {/* ── Favorites ────────────────────────────────────────────────────────── */}
          {favorites.length > 0 && (
            <div>
              <SectionHeader label="Favorites" count={favorites.length} />
              {favorites.map((s) => (
                <SessionRow
                  key={s.id}
                  session={s}
                  isActive={activeSessionId === s.id}
                  onSelect={() => handleSelect(s.id)}
                  onRename={handleRename}
                  onPin={handlePin}
                  onFavorite={handleFavorite}
                  onArchive={handleArchive}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDeleteRequest}
                />
              ))}
            </div>
          )}

          {/* ── Time-grouped regular sessions ────────────────────────────────────── */}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              {(pinned.length > 0 || favorites.length > 0 || Object.keys(grouped).indexOf(group) > 0) && (
                <SectionHeader label={group} />
              )}
              {Object.keys(grouped).indexOf(group) === 0 && pinned.length === 0 && favorites.length === 0 && (
                <SectionHeader label={group} />
              )}
              {items.map((s) => (
                <SessionRow
                  key={s.id}
                  session={s}
                  isActive={activeSessionId === s.id}
                  onSelect={() => handleSelect(s.id)}
                  onRename={handleRename}
                  onPin={handlePin}
                  onFavorite={handleFavorite}
                  onArchive={handleArchive}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDeleteRequest}
                />
              ))}
            </div>
          ))}
            </motion.div>
          )}
          
          {/* ── Archived View ─────────────────────────────────────────────────────── */}
          {(viewArchived || search) && (
            <motion.div
              key="archived-view"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="mt-1"
            >
          {archived.length > 0 && (
            <div className="mb-2">
              <SectionHeader label={search ? "Archived" : "Archived Conversations"} count={archived.length} />
              {archived.map((s) => (
                <SessionRow
                  key={s.id}
                  session={s}
                  isActive={activeSessionId === s.id}
                  onSelect={() => handleSelect(s.id)}
                  onRename={handleRename}
                  onPin={handlePin}
                  onFavorite={handleFavorite}
                  onArchive={handleArchive}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDeleteRequest}
                />
              ))}
            </div>
          )}
          {!search && archived.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-center px-4">
              <Archive className="h-8 w-8 text-muted-foreground/20" />
              <p className="text-[11px] text-muted-foreground/50">
                No archived conversations.
              </p>
            </div>
          )}
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </ScrollArea>

      {/* No search results */}
      {!isLoadingSessions && search && filtered.length === 0 && (
        <div className="px-3 py-4 text-center">
          <p className="text-[11px] text-muted-foreground/50">
            No conversations match &ldquo;{search}&rdquo;
          </p>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ─────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.title}&rdquo; and all its messages will be permanently deleted.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
