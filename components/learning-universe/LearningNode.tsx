"use client";

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { useSelectionStore, useCanvasStore } from '@/stores/learningUniverseStore';
import { 
  CheckCircle2, Lock, PlayCircle, BookOpen, 
  BrainCircuit, Code2, FlaskConical, Target, Flag,
  Bookmark, FileText, FileVideo, GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { LearningNodeType, NodeType } from '@/stores/learningUniverseStore';

interface LearningNodeProps extends NodeProps<LearningNodeType> {
  // dragging is injected by React Flow
}

const statusConfig = {
  locked: {
    color: 'text-muted-foreground',
    bg: 'bg-muted/10',
    border: 'border-white/5',
    ring: 'stroke-muted-foreground/20',
  },
  unlocked: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    ring: 'stroke-blue-500/20',
  },
  'in-progress': {
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    ring: 'stroke-amber-500',
  },
  completed: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    ring: 'stroke-emerald-500',
  },
  skipped: {
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    ring: 'stroke-slate-500',
  }
};

const getTypeIcon = (type: NodeType, status: string) => {
  if (status === 'locked') return Lock;
  if (status === 'completed') return CheckCircle2;
  
  switch (type) {
    case 'topic': return BookOpen;
    case 'concept': return BrainCircuit;
    case 'lesson': return FileText;
    case 'quiz': return Target;
    case 'flashcards': return Bookmark;
    case 'practice': return Code2;
    case 'project': return FlaskConical;
    case 'ai_challenge': return BrainCircuit;
    case 'interview': return Target;
    case 'revision': return CheckCircle2;
    case 'milestone': return Flag;
    case 'bookmark': return Bookmark;
    case 'notes': return FileText;
    case 'resource': return FileVideo;
    case 'certificate': return GraduationCap;
    default: return BookOpen;
  }
};

const LearningNodeComponent = ({ id, data, selected, dragging }: LearningNodeProps) => {
  const config = statusConfig[data.status] || statusConfig['locked'];
  const Icon = getTypeIcon(data.type, data.status);
  const progress = data.progress || 0;
  
  // Store state for smart fading
  const selectedNodeId = useSelectionStore(s => s.selectedNodeId);
  const edges = useCanvasStore(s => s.edges);
  const searchQuery = require('@/stores/learningUniverseStore').useToolbarStore((s: any) => s.searchQuery);
  
  // Determine if this node should be faded (another node is selected, and this one isn't connected to it, OR doesn't match search)
  const isFaded = React.useMemo(() => {
    if (searchQuery && !data.title?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return true;
    }
    if (!selectedNodeId || selectedNodeId === id) return false;
    // Check if connected
    const isConnected = edges.some(e => 
      (e.source === selectedNodeId && e.target === id) || 
      (e.target === selectedNodeId && e.source === id)
    );
    return !isConnected;
  }, [selectedNodeId, id, edges, searchQuery, data.title]);

  // Calculate SVG stroke dasharray for the progress ring
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Semantic Color Map based on type
  const getTypeColor = (type: NodeType) => {
    switch (type) {
      case 'topic': return 'text-blue-400';
      case 'lesson': return 'text-emerald-400';
      case 'project': return 'text-orange-400';
      case 'quiz': return 'text-purple-400';
      case 'interview': return 'text-pink-400';
      case 'milestone': return 'text-emerald-400';
      case 'ai_challenge': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };
  const semanticColor = getTypeColor(data.type);

  const isPractice = data.type === 'practice' || data.nodeCategory === 'PRACTICE';
  const isConcept = data.type === 'concept' || data.type === 'topic';

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 10 }}
      animate={{ 
        scale: dragging ? 1.05 : selected ? 1.02 : 1, 
        y: dragging ? -5 : selected ? -2 : 0,
        opacity: isFaded ? 0.3 : isPractice ? 0.85 : 1,
        boxShadow: dragging 
          ? '0 20px 40px -10px rgba(0,0,0,0.5), 0 0 40px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
          : selected 
          ? '0 0 0 2px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)' 
          : '0 8px 16px -4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255, 255, 255, 0.04)'
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      whileHover={dragging ? {} : { scale: 1.02, y: -3, opacity: isPractice ? 1 : 1, boxShadow: '0 12px 24px -4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 0 1px rgba(255,255,255,0.1)' }}
      className={cn(
        'relative group flex flex-col p-[5px] rounded-[22px] backdrop-blur-2xl transition-colors duration-200',
        isPractice ? 'min-w-[200px] max-w-[240px] bg-zinc-950/80 border-dashed border-2' : 
        isConcept ? 'min-w-[320px] max-w-[360px] bg-zinc-900/95 border' : 
        'min-w-[260px] max-w-[300px] bg-zinc-900/95 border',
        dragging ? 'cursor-grabbing' : 'cursor-grab',
        config.border,
        selected ? 'border-primary/50' : isPractice ? 'border-zinc-700/50 hover:bg-zinc-900/95' : 'border-zinc-700/50 hover:bg-zinc-800/95'
      )}
    >
        {/* Floating Node Numbering Badge */}
        {data.metadata?.hierarchyIndex && (
          <div className="absolute -top-[11px] left-1/2 -translate-x-1/2 flex items-center justify-center min-w-[40px] h-[22px] px-3 rounded-full bg-zinc-800/90 backdrop-blur-md border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.4)] text-[11px] font-bold text-slate-200 tracking-wider z-20 transition-transform duration-200 group-hover:scale-105 group-hover:-translate-y-[1px] pointer-events-none">
            {data.metadata.hierarchyIndex}
          </div>
        )}

        {/* 360 Dynamic Handles - Premium Magnetic Ports */}
        <div className="absolute inset-0 pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* TOP */}
          <Handle id="top-target" type="target" position={Position.Top} className="group/port w-8 h-8 !top-[-20px] border-0 bg-transparent pointer-events-auto flex items-center justify-center cursor-crosshair" >
            <div className="w-3 h-3 rounded-full border-2 border-slate-400/60 bg-zinc-800 shadow-sm group-hover/port:border-emerald-400 group-hover/port:bg-emerald-950 group-hover/port:scale-[1.4] transition-all duration-200 group-hover/port:shadow-[0_0_12px_rgba(52,211,153,0.8)] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-0 group-hover/port:opacity-100 transition-opacity duration-200" />
            </div>
          </Handle>
          <Handle id="top-source" type="source" position={Position.Top} className="w-8 h-8 !top-[-20px] border-0 bg-transparent pointer-events-auto opacity-0" />

          {/* LEFT */}
          <Handle id="left-target" type="target" position={Position.Left} className="group/port w-8 h-8 !left-[-16px] border-0 bg-transparent pointer-events-auto flex items-center justify-center cursor-crosshair" >
            <div className="w-3 h-3 rounded-full border-2 border-slate-400/60 bg-zinc-800 shadow-sm group-hover/port:border-emerald-400 group-hover/port:bg-emerald-950 group-hover/port:scale-[1.4] transition-all duration-200 group-hover/port:shadow-[0_0_12px_rgba(52,211,153,0.8)] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-0 group-hover/port:opacity-100 transition-opacity duration-200" />
            </div>
          </Handle>
          <Handle id="left-source" type="source" position={Position.Left} className="w-8 h-8 !left-[-16px] border-0 bg-transparent pointer-events-auto opacity-0" />

          {/* BOTTOM */}
          <Handle id="bottom-source" type="source" position={Position.Bottom} className="group/port w-8 h-8 !bottom-[-16px] border-0 bg-transparent pointer-events-auto flex items-center justify-center cursor-crosshair" >
            <div className="w-3 h-3 rounded-full border-2 border-slate-400/60 bg-zinc-800 shadow-sm group-hover/port:border-blue-400 group-hover/port:bg-blue-950 group-hover/port:scale-[1.4] transition-all duration-200 group-hover/port:shadow-[0_0_12px_rgba(59,130,246,0.8)] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 opacity-0 group-hover/port:opacity-100 transition-opacity duration-200" />
            </div>
          </Handle>
          <Handle id="bottom-target" type="target" position={Position.Bottom} className="w-8 h-8 !bottom-[-16px] border-0 bg-transparent pointer-events-auto opacity-0" />

          {/* RIGHT */}
          <Handle id="right-source" type="source" position={Position.Right} className="group/port w-8 h-8 !right-[-16px] border-0 bg-transparent pointer-events-auto flex items-center justify-center cursor-crosshair" >
            <div className="w-3 h-3 rounded-full border-2 border-slate-400/60 bg-zinc-800 shadow-sm group-hover/port:border-blue-400 group-hover/port:bg-blue-950 group-hover/port:scale-[1.4] transition-all duration-200 group-hover/port:shadow-[0_0_12px_rgba(59,130,246,0.8)] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 opacity-0 group-hover/port:opacity-100 transition-opacity duration-200" />
            </div>
          </Handle>
          <Handle id="right-target" type="target" position={Position.Right} className="w-8 h-8 !right-[-16px] border-0 bg-transparent pointer-events-auto opacity-0" />
        </div>

      <div className="flex flex-col p-4 rounded-[18px] bg-zinc-850/90 border border-white/5 h-full relative overflow-hidden backdrop-blur-md">
        {/* Soft background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start gap-4 w-full relative z-10">
          {/* Icon */}
          <div className="relative flex items-center justify-center shrink-0 w-9 h-9 mt-0.5">
            <div className={cn('relative z-10 w-full h-full rounded-full flex items-center justify-center border', config.bg, config.border)}>
              <Icon className={cn('w-4 h-4', config.color)} />
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn(isPractice ? "text-[9px]" : "text-[10px]", "uppercase font-bold tracking-widest", semanticColor)}>
                {data.type.replace('_', ' ')}
              </span>
              {data.difficulty && (
                <span className={cn("font-bold uppercase px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10", 
                  isPractice ? "text-[8px]" : "text-[9px]",
                  data.difficulty === 'beginner' ? 'text-emerald-400' :
                  data.difficulty === 'intermediate' ? 'text-amber-400' : 'text-red-400'
                )}>
                  {data.difficulty}
                </span>
              )}
            </div>
            <h3 className={cn("leading-snug font-bold text-slate-100 line-clamp-2 tracking-tight",
              isConcept ? "text-[16px]" : isPractice ? "text-[13px]" : "text-[15px]"
            )}>
              {data.title}
            </h3>
            {data.description && (
              <p className={cn("leading-relaxed text-slate-400 mt-1.5", 
                isConcept ? "text-[13px] line-clamp-3" : isPractice ? "text-[11px] line-clamp-1" : "text-[12px] line-clamp-2"
              )}>
                {data.description}
              </p>
            )}
          </div>
        </div>
        
        {/* Metadata Tags */}
        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-white/5 relative z-10">
            {data.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800/80 text-slate-400 border border-white/5 whitespace-nowrap">
                {tag}
              </span>
            ))}
            {data.tags.length > 3 && <span className="text-[10px] px-1 text-slate-500 font-medium self-center">+{data.tags.length - 3}</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Use deep comparison for complex objects to prevent unnecessary re-renders
export const LearningNode = memo(LearningNodeComponent, (prev, next) => {
  return prev.data.progress === next.data.progress &&
         prev.data.status === next.data.status &&
         prev.selected === next.selected &&
         prev.data.title === next.data.title &&
         prev.data.description === next.data.description;
});
