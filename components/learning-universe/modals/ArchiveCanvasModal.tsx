"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

interface ArchiveCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasTitle: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ArchiveCanvasModal({
  isOpen,
  onClose,
  canvasTitle,
  onConfirm,
  isLoading = false
}: ArchiveCanvasModalProps) {
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950/80 backdrop-blur-2xl border-amber-500/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-amber-400 flex items-center gap-2">
            <Archive className="w-5 h-5" />
            Archive Canvas
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Are you sure you want to archive <strong>{canvasTitle}</strong>? It will be removed from your active workspaces but can be restored later.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={onClose} disabled={isLoading} className="text-zinc-400 hover:text-white">
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading} className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 hover:text-amber-300">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full" />
                Archiving...
              </span>
            ) : (
              "Archive"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
