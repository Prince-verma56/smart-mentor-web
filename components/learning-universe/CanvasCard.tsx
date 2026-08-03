import React from 'react';
import { motion } from 'framer-motion';
import { Map, FileText, MoreHorizontal, Edit2, Copy, Trash2, Pin, Archive, Share2, Download, Settings } from 'lucide-react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator } from '@/components/ui/context-menu';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

interface CanvasCardProps {
  canvas: any;
  isActive: boolean;
  onOpen: (id: string) => void;
  onRename: (id: string, currentTitle: string) => void;
  onDuplicate: (canvas: any) => void;
  onDelete: (id: string) => void;
  onPin?: () => void;
  onArchive?: () => void;
  onShare?: () => void;
  onExport?: () => void;
  onSettings?: () => void;
}

export const CanvasCard = ({ canvas, isActive, onOpen, onRename, onDuplicate, onDelete, onPin, onArchive, onShare, onExport, onSettings }: CanvasCardProps) => {
  const isOfficial = canvas.is_official_roadmap;
  
  const nodeCount = canvas.nodes?.length || 0;
  const edgeCount = canvas.edges?.length || 0;
  const studyTime = Math.floor(nodeCount * 1.5) + 'h';
  const progress = isOfficial ? 45 : 0;

  const Icon = isOfficial ? Map : FileText;
  const gradient = isOfficial ? 'from-emerald-500/20 to-emerald-500/5 text-emerald-400' : 'from-zinc-500/20 to-zinc-500/5 text-zinc-400';
  const border = isActive ? (isOfficial ? 'border-emerald-500/50 bg-emerald-500/[0.03]' : 'border-zinc-500/50 bg-zinc-500/[0.03]') : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20';

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={() => onOpen(canvas.id)}
          className={`group relative flex flex-col justify-between p-5 rounded-2xl border backdrop-blur-md transition-all cursor-pointer overflow-hidden shadow-black/20 hover:shadow-black/40 hover:shadow-2xl ${border}`}
        >
          {/* Top section */}
          <div className="flex items-start justify-between relative z-10">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-inner ${gradient}`}>
              <Icon className="w-6 h-6" />
            </div>
            
            <div className="flex items-center gap-2">
              {isActive && (
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${isOfficial ? 'text-emerald-400 bg-emerald-400/10' : 'text-zinc-400 bg-zinc-400/10'}`}>
                  Active
                </span>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity data-[state=open]:opacity-100" onClick={e => e.stopPropagation()}>
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-zinc-950/90 backdrop-blur-xl border-white/10">
                  <DropdownMenuItem onClick={(e) => handleAction(e as any, () => onOpen(canvas.id))}>
                    <Map className="w-4 h-4 mr-2" /> Open Canvas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => handleAction(e as any, () => onRename(canvas.id, canvas.name))}>
                    <Edit2 className="w-4 h-4 mr-2" /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => handleAction(e as any, () => onDuplicate(canvas))}>
                    <Copy className="w-4 h-4 mr-2" /> Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={(e) => handleAction(e as any, () => onPin && onPin())}>
                    <Pin className="w-4 h-4 mr-2" /> {canvas.is_pinned ? 'Unpin from Sidebar' : 'Pin to Sidebar'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => handleAction(e as any, () => onArchive && onArchive())}>
                    <Archive className="w-4 h-4 mr-2" /> {canvas.is_archived ? 'Unarchive' : 'Archive'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={(e) => handleAction(e as any, () => onShare && onShare())}>
                    <Share2 className="w-4 h-4 mr-2" /> Share
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => handleAction(e as any, () => onExport && onExport())}>
                    <Download className="w-4 h-4 mr-2" /> Export
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => handleAction(e as any, () => onSettings && onSettings())}>
                    <Settings className="w-4 h-4 mr-2" /> Settings
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-red-950/30" onClick={(e) => handleAction(e as any, () => onDelete(canvas.id))}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Middle section - Title */}
          <div className="mt-4 mb-6">
            <h4 className="font-semibold text-white/90 truncate text-base">{canvas.name}</h4>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {isOfficial ? 'Auto-generated by AI Mentor' : 'Personal Workspace'}
            </p>
          </div>

          {/* Bottom section - Stats */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
              <span>{nodeCount} Nodes</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>{edgeCount} Edges</span>
            </div>
            {progress > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-12 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className={`h-full rounded-full ${isOfficial ? 'bg-emerald-400' : 'bg-zinc-400'}`} style={{ width: `${progress}%` }} />
                </div>
                <span className="text-[10px] font-bold text-white/70">{progress}%</span>
              </div>
            )}
          </div>
        </motion.div>
      </ContextMenuTrigger>
      
      <ContextMenuContent className="w-48 bg-zinc-950/90 backdrop-blur-xl border-white/10">
        <ContextMenuItem onClick={() => onOpen(canvas.id)}>
          <Map className="w-4 h-4 mr-2" /> Open Canvas
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onRename(canvas.id, canvas.name)}>
          <Edit2 className="w-4 h-4 mr-2" /> Rename
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onDuplicate(canvas)}>
          <Copy className="w-4 h-4 mr-2" /> Duplicate
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-white/10" />
        <ContextMenuItem onClick={() => onPin && onPin()}>
          <Pin className="w-4 h-4 mr-2" /> {canvas.is_pinned ? 'Unpin from Sidebar' : 'Pin to Sidebar'}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onArchive && onArchive()}>
          <Archive className="w-4 h-4 mr-2" /> {canvas.is_archived ? 'Unarchive' : 'Archive'}
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-white/10" />
        <ContextMenuItem onClick={() => onShare && onShare()}>
          <Share2 className="w-4 h-4 mr-2" /> Share
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onExport && onExport()}>
          <Download className="w-4 h-4 mr-2" /> Export
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onSettings && onSettings()}>
          <Settings className="w-4 h-4 mr-2" /> Settings
        </ContextMenuItem>
        
        <ContextMenuSeparator className="bg-white/10" />
        <ContextMenuItem className="text-red-400 focus:text-red-300 focus:bg-red-500/10" onClick={() => onDelete(canvas.id)}>
          <Trash2 className="w-4 h-4 mr-2" /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
