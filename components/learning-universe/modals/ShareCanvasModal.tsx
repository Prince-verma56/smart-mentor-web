"use client";

import React from 'react';
import { Share2, Link as LinkIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface ShareCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasTitle: string;
  canvasId: string;
}

export function ShareCanvasModal({
  isOpen,
  onClose,
  canvasTitle,
  canvasId
}: ShareCanvasModalProps) {
  const [copied, setCopied] = React.useState(false);
  const [shareToken, setShareToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && canvasId) {
      const generateToken = async () => {
        setIsLoading(true);
        try {
          const tokenStr = localStorage.getItem('token') || '';
          const res = await fetch(`http://127.0.0.1:8000/api/v1/canvas/canvas/${canvasId}/share`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${tokenStr}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.share_token) setShareToken(data.share_token);
          }
        } catch (e) {
          console.error(e);
        }
        setIsLoading(false);
      };
      generateToken();
    } else {
      setShareToken(null);
    }
  }, [isOpen, canvasId]);

  // In a real app this would be a specific public URL or share token route
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/share/${shareToken || canvasId}`
    : `https://app.example.com/share/${shareToken || canvasId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950/80 backdrop-blur-2xl border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-400" />
            Share Canvas
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Share <strong>{canvasTitle}</strong> with others. Anyone with the link will be able to view this canvas.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-2 mt-2">
          <Input 
            value={shareUrl} 
            readOnly 
            className="bg-white/5 border-white/10 focus-visible:ring-blue-500/50"
          />
          <Button 
            variant="secondary" 
            className="shrink-0 bg-white/10 hover:bg-white/20" 
            onClick={handleCopy}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <LinkIcon className="w-4 h-4" />}
          </Button>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={onClose} className="w-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
