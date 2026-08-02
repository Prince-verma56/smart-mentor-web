"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

interface DeleteCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasTitle: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteCanvasModal({
  isOpen,
  onClose,
  canvasTitle,
  onConfirm,
  isLoading = false
}: DeleteCanvasModalProps) {
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950/80 backdrop-blur-2xl border-red-500/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-red-400 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Delete Canvas
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Are you sure you want to permanently delete <strong>{canvasTitle}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={onClose} disabled={isLoading} className="text-zinc-400 hover:text-white">
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading} variant="destructive" className="bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full" />
                Deleting...
              </span>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
