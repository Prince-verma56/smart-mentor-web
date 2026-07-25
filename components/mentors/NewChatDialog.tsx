"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, MessageSquarePlus } from "lucide-react";
import { useConversation } from "@/contexts/ConversationContext";
import type { MentorStats } from "@/types/mentor";

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats?: MentorStats;
}

export function NewChatDialog({ open, onOpenChange, stats }: NewChatDialogProps) {
  const { createNewSession } = useConversation();
  const [title, setTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  // Suggest the next topic from the roadmap if available
  const suggestedTopic = stats?.currentTopic || "General Chat";

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const finalTitle = title.trim() || suggestedTopic;
      await createNewSession(finalTitle);
      onOpenChange(false);
      setTitle(""); // Reset for next time
    } catch (e) {
      console.error("Failed to create chat", e);
    } finally {
      setIsCreating(false);
    }
  };

  const handleAutoSuggest = () => {
    setTitle(suggestedTopic);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5 text-primary" />
            Start a New Chat
          </DialogTitle>
          <DialogDescription>
            Give this conversation a name or topic so you can easily find it later.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Chat Topic</Label>
            <Input
              id="title"
              placeholder="e.g. Learning React Hooks"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreate();
                }
              }}
              autoFocus
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="text-xs h-8"
              onClick={handleAutoSuggest}
            >
              <Sparkles className="h-3 w-3 mr-1.5 text-primary" />
              Suggest from Roadmap
            </Button>
            <span className="text-[10px] text-muted-foreground truncate">
              ({suggestedTopic})
            </span>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
