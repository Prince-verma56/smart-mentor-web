"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

interface RenameCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
  onSave: (newTitle: string) => void;
  isLoading?: boolean;
}

export function RenameCanvasModal({
  isOpen,
  onClose,
  currentTitle,
  onSave,
  isLoading = false
}: RenameCanvasModalProps) {
  const [title, setTitle] = useState(currentTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(currentTitle);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
    }
  }, [isOpen, currentTitle]);

  const handleSave = () => {
    if (title.trim() === '') return;
    if (title === currentTitle) {
      onClose();
      return;
    }
    onSave(title.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950/80 backdrop-blur-2xl border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Rename Canvas</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Enter a new name for your workspace canvas.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Input
            ref={inputRef}
            id="name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="col-span-3 bg-white/5 border-white/10 text-white focus-visible:ring-emerald-500/50"
            placeholder="E.g., System Design Interview Prep"
          />
        </div>
        
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isLoading} className="text-zinc-400 hover:text-white">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || title.trim() === ''} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" /> Save
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
