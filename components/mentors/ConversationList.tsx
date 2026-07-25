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
import { AppButton } from "@/components/ui/app-button";
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
import { formatDistanceToNow, isToday, isYesterday, isThisWeek, subDays } from "date-fns";
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
        initial={{ opacity: 0, height: 0, x: -10, backgroundColor: "hsl(var(--primary) / 0.15)" }}
        animate={{ 
          opacity: 1, 
          height: "auto", 
          x: 0, 
          backgroundColor: "hsl(var(--primary) / 0)",
          transition: {
            height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: 0.3, delay: 0.1 },
            x: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
            backgroundColor: { duration: 1.5, delay: 0.5 } // highlight fades out slowly
          }
        }}
        exit={{ 
          opacity: 0, 
          height: 0, 
          x: -10, 
          transition: { duration: 0.2, ease: "easeInOut" } 
        }}
        className="group relative overflow-hidden rounded-lg mb-[2px]"
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
      <AlertDialog open={showDeleteDialog} onOpenChange={(v) => !isPending && setShowDeleteDialog(v)}>
        <AlertDialogContent className="sm:max-w-[420px] p-6 gap-6" size="default">
          <AlertDialogHeader className="gap-3">
            <div className="h-10 w-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-1">
              <Trash2 className="h-5 w-5 text-destructive/80" />
            </div>
            <div className="space-y-1.5">
              <AlertDialogTitle className="text-xl">Delete conversation?</AlertDialogTitle>
              <AlertDialogDescription className="text-[14px]">
                This action cannot be undone. This conversation and all its messages will be permanently deleted from your history.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          
          <div className="bg-background/50 border border-border/40 rounded-xl p-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <MessageSquare className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {session.title || "New Conversation"}
              </p>
              {preview && (
                <p className="text-xs text-muted-foreground truncate">
                  {preview}
                </p>
              )}
            </div>
          </div>

          <AlertDialogFooter className="mt-2 sm:justify-between items-center w-full">
            <AlertDialogCancel 
              disabled={isPending}
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl px-5 transition-all duration-150 border-0 bg-transparent"
            >
              Cancel
            </AlertDialogCancel>
            <AppButton
              variant="destructive"
              size="lg"
              disabled={isPending}
              isLoading={isPending}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="rounded-xl px-6 bg-destructive/90 hover:bg-destructive text-destructive-foreground shadow-sm"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AppButton>
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
            
            {/* Grouping Logic */}
            {(() => {
              const today = recent.filter(s => s.last_message_at && isToday(new Date(s.last_message_at)));
              const yesterday = recent.filter(s => s.last_message_at && isYesterday(new Date(s.last_message_at)));
              const last7Days = recent.filter(s => s.last_message_at && !isToday(new Date(s.last_message_at)) && !isYesterday(new Date(s.last_message_at)) && new Date(s.last_message_at) > subDays(new Date(), 7));
              const older = recent.filter(s => !s.last_message_at || new Date(s.last_message_at) <= subDays(new Date(), 7));
              
              return (
                <>
                  {today.length > 0 && (
                    <div className="mb-2">
                      <SectionLabel label="Today" />
                      {today.map(s => <SessionRow key={s.id} session={s} />)}
                    </div>
                  )}
                  {yesterday.length > 0 && (
                    <div className="mb-2">
                      <SectionLabel label="Yesterday" />
                      {yesterday.map(s => <SessionRow key={s.id} session={s} />)}
                    </div>
                  )}
                  {last7Days.length > 0 && (
                    <div className="mb-2">
                      <SectionLabel label="Previous 7 Days" />
                      {last7Days.map(s => <SessionRow key={s.id} session={s} />)}
                    </div>
                  )}
                  {older.length > 0 && (
                    <div className="mb-2">
                      <SectionLabel label="Older" />
                      {older.map(s => <SessionRow key={s.id} session={s} />)}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
