"use client";

import { useState, useMemo } from "react";
import { useConversation } from "@/contexts/ConversationContext";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  MessageSquare,
  MoreHorizontal,
  Trash2,
  Edit2,
  Pin,
  PinOff,
  Archive,
  Search,
  Check,
  X,
  Plus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import type { ChatSession } from "@/types/session";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SessionSkeleton() {
  return (
    <div className="space-y-1 px-1">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-10 rounded-lg bg-muted/30 animate-pulse" />
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 py-5 px-3 text-center">
      <MessageSquare className="h-5 w-5 text-muted-foreground/20" />
      <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
        No conversations yet.
      </p>
      <button
        onClick={onNew}
        className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
      >
        <Plus className="h-3 w-3" /> Start one
      </button>
    </div>
  );
}

// ─── Session Row ──────────────────────────────────────────────────────────────

function SessionRow({ session }: { session: ChatSession }) {
  const {
    activeSessionId,
    setActiveSession,
    deleteSession,
    renameSession,
    pinSession,
    archiveSession,
  } = useConversation();

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(session.title);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = activeSessionId === session.id;

  const handleRenameConfirm = async () => {
    if (!renameValue.trim() || renameValue === session.title) {
      setIsRenaming(false);
      return;
    }
    setIsPending(true);
    try {
      await renameSession(session.id, renameValue.trim());
      toast.success("Renamed.");
    } catch {
      toast.error("Failed to rename.");
    } finally {
      setIsPending(false);
      setIsRenaming(false);
    }
  };

  const handleDelete = async () => {
    setIsPending(true);
    try {
      await deleteSession(session.id);
      toast.success("Deleted.");
    } catch {
      toast.error("Failed to delete.");
    } finally {
      setIsPending(false);
    }
  };

  const handlePin = async () => {
    await pinSession(session.id, !session.is_pinned);
    toast.success(session.is_pinned ? "Unpinned." : "Pinned.");
  };

  const handleArchive = async () => {
    await archiveSession(session.id, !session.is_archived);
    toast.success(session.is_archived ? "Unarchived." : "Archived.");
  };

  const timeAgo = session.last_message_at
    ? formatDistanceToNow(new Date(session.last_message_at), { addSuffix: false })
        .replace("about ", "")
        .replace(" minutes", "m")
        .replace(" minute", "m")
        .replace(" hours", "h")
        .replace(" hour", "h")
        .replace(" days", "d")
        .replace(" day", "d")
        .replace(" seconds", "s")
    : null;

  const preview = session.summary
    ? session.summary.slice(0, 36)
    : null;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -4 }}
        transition={{ duration: 0.12 }}
        className="group relative"
      >
        {isRenaming ? (
          <div className="flex items-center gap-1 px-1 py-0.5">
            <Input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameConfirm();
                if (e.key === "Escape") {
                  setRenameValue(session.title);
                  setIsRenaming(false);
                }
              }}
              onBlur={handleRenameConfirm}
              className="h-6 text-[11px] px-2 flex-1"
              disabled={isPending}
            />
            <button
              onClick={handleRenameConfirm}
              className="text-primary hover:text-primary/90"
            >
              <Check className="h-3 w-3" />
            </button>
            <button
              onClick={() => {
                setRenameValue(session.title);
                setIsRenaming(false);
              }}
              className="text-muted-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setActiveSession(session.id)}
            className={cn(
              "w-full text-left flex items-start gap-2 rounded-lg px-2.5 py-1.5 transition-all duration-150",
              isActive
                ? "bg-primary/10 border-l-2 border-primary"
                : "hover:bg-muted border-l-2 border-transparent"
            )}
          >
            {/* Active dot / icon */}
            <div className="mt-1 shrink-0">
              {isActive ? (
                <span className="h-1.5 w-1.5 rounded-full bg-primary block" />
              ) : (
                <MessageSquare className="h-3 w-3 text-muted-foreground/30" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              {/* Title row */}
              <div className="flex items-center justify-between gap-1">
                <p
                  className={cn(
                    "text-[12px] font-medium leading-tight truncate",
                    isActive
                      ? "text-primary"
                      : "text-foreground/80 group-hover:text-foreground"
                  )}
                >
                  {session.title || "New Conversation"}
                </p>
                {timeAgo && (
                  <span className="text-[9px] text-muted-foreground/50 shrink-0 tabular-nums">
                    {timeAgo}
                  </span>
                )}
              </div>

              {/* Preview row */}
              {preview && (
                <p className="text-[10px] text-muted-foreground/50 truncate mt-0.5 leading-tight">
                  {preview}
                </p>
              )}

              {/* Pin indicator */}
              {session.is_pinned && (
                <Pin className="h-2 w-2 text-primary/40 mt-0.5 inline" />
              )}
            </div>
          </button>
        )}

        {/* Context menu — appears on hover */}
        {!isRenaming && (
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger
              className={cn(
                "absolute right-1 top-1.5 h-5 w-5 flex items-center justify-center rounded text-muted-foreground/40 hover:text-foreground hover:bg-muted transition-all",
                "opacity-0 group-hover:opacity-100",
                menuOpen && "opacity-100"
              )}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRenaming(true);
                  setRenameValue(session.title);
                  setMenuOpen(false);
                }}
              >
                <Edit2 className="h-3.5 w-3.5 mr-2" /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handlePin();
                  setMenuOpen(false);
                }}
              >
                {session.is_pinned ? (
                  <><PinOff className="h-3.5 w-3.5 mr-2" /> Unpin</>
                ) : (
                  <><Pin className="h-3.5 w-3.5 mr-2" /> Pin</>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleArchive();
                  setMenuOpen(false);
                }}
              >
                <Archive className="h-3.5 w-3.5 mr-2" />
                {session.is_archived ? "Unarchive" : "Archive"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                  setMenuOpen(false);
                }}
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </motion.div>

      {/* Delete dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{session.title || "This conversation"}&quot; and all its messages will be
              permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="px-2.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/40 mb-0.5">
      {label}
    </p>
  );
}

// ─── Main ConversationList ────────────────────────────────────────────────────

export function ConversationList() {
  const { sessions, isLoadingSessions, createNewSession } = useConversation();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return sessions.filter((s) => !s.is_archived);
    return sessions.filter(
      (s) => !s.is_archived && s.title?.toLowerCase().includes(q)
    );
  }, [sessions, search]);

  const pinned = filtered.filter((s) => s.is_pinned);
  const recent = filtered.filter((s) => !s.is_pinned);

  if (isLoadingSessions) return <SessionSkeleton />;

  return (
    <div className="flex flex-col gap-0.5">
      {/* Search — only show when there are sessions */}
      {sessions.length > 2 && (
        <div className="px-1 pb-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-muted-foreground/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="h-6 text-[11px] pl-6 bg-muted/20 border-0 focus-visible:ring-1"
          />
        </div>
      )}

      {/* Empty */}
      {filtered.length === 0 && <EmptyState onNew={createNewSession} />}

      {/* Pinned */}
      <AnimatePresence mode="popLayout">
        {pinned.length > 0 && (
          <div className="mb-1">
            <SectionLabel label="Pinned" />
            {pinned.map((s) => (
              <SessionRow key={s.id} session={s} />
            ))}
          </div>
        )}

        {recent.length > 0 && (
          <div>
            {pinned.length > 0 && <SectionLabel label="Recent" />}
            {recent.map((s) => (
              <SessionRow key={s.id} session={s} />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
