"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

interface DuplicateCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasTitle: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DuplicateCanvasModal({
  isOpen,
  onClose,
  canvasTitle,
  onConfirm,
  isLoading = false
}: DuplicateCanvasModalProps) {
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950/80 backdrop-blur-2xl border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Copy className="w-5 h-5 text-blue-400" />
            Duplicate Canvas
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Are you sure you want to duplicate <strong>{canvasTitle}</strong>? This will create an exact copy of the nodes, edges, and settings.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={onClose} disabled={isLoading} className="text-zinc-400 hover:text-white">
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading} className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full" />
                Duplicating...
              </span>
            ) : (
              "Duplicate"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
