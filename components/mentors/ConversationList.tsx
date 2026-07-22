"use client";

import { useEffect, useState } from "react";
import { getChatSessions, deleteChatSession } from "@/actions/chatActions";
import { Button } from "@/components/ui/button";
import { MessageSquare, MoreVertical, Trash, Edit2, Pin, Archive } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function ConversationList({ mentorId }: { mentorId: string }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentSessionId = searchParams.get("session");

  useEffect(() => {
    getChatSessions(mentorId).then(setSessions);
  }, [mentorId]);

  const switchSession = (id: string) => {
    // We update the URL to trigger the ConversationPanel to load this session
    // Or we rely on a shared context. Wait, ConversationPanel manages its own sessionId state right now.
    // If we update the URL with ?session=id, we need ConversationPanel to read it.
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("session", id);
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this conversation?")) {
      await deleteChatSession(id, mentorId);
      setSessions(s => s.filter(x => x.id !== id));
      if (currentSessionId === id) {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete("session");
        router.push(`${pathname}?${newParams.toString()}`);
      }
    }
  };

  if (sessions.length === 0) {
    return <div className="px-4 py-2 text-xs text-muted-foreground">No history yet.</div>;
  }

  return (
    <div className="space-y-0.5">
      {sessions.map((s) => (
        <div key={s.id} className="group relative">
          <Button
            variant="ghost"
            onClick={() => switchSession(s.id)}
            className={`w-full justify-start text-xs h-9 px-3 font-normal ${
              currentSessionId === s.id ? "bg-muted font-medium" : ""
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5 mr-2 shrink-0 opacity-50" />
            <span className="truncate flex-1 text-left">{s.title || "New Conversation"}</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-6 w-6 absolute right-1 top-1.5 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 focus:outline-none"
            >
              <MoreVertical className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleDelete(s.id)} className="text-destructive focus:text-destructive">
                <Trash className="h-3.5 w-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}
