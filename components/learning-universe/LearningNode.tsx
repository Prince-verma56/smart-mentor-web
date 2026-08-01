"use client";

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  CheckCircle2, Lock, PlayCircle, BookOpen, 
  BrainCircuit, Code2, FlaskConical, Target, Flag,
  Bookmark, FileText, FileVideo, GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { LearningNodeType, NodeType } from '@/stores/learningUniverseStore';

interface LearningNodeProps {
  data: LearningNodeType['data'];
  selected?: boolean;
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

const LearningNodeComponent = ({ data, selected }: LearningNodeProps) => {
  const config = statusConfig[data.status] || statusConfig['locked'];
  const Icon = getTypeIcon(data.type, data.status);
  const progress = data.progress || 0;
  
  // Calculate SVG stroke dasharray for the progress ring
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'relative group flex flex-col p-3 rounded-2xl min-w-[240px] max-w-[280px] bg-background/80 backdrop-blur-xl border-2 transition-all duration-300 shadow-xl',
        config.border,
        selected ? 'ring-2 ring-primary/50 border-primary' : 'hover:border-primary/30'
      )}
    >
      {/* Dynamic Handles for layout directions. Eventually we can place these dynamically based on layoutMode */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 border-2 border-background bg-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 border-2 border-background bg-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center gap-4 w-full">
        {/* Progress Ring & Icon */}
        <div className="relative flex items-center justify-center shrink-0 w-12 h-12">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r={radius} className="fill-none stroke-white/5" strokeWidth="3" />
            {data.status !== 'locked' && (
              <circle
                cx="22" cy="22" r={radius}
                className={cn('fill-none transition-all duration-1000 ease-out', config.ring)}
                strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
              />
            )}
          </svg>
          <div className={cn('relative z-10 p-2 rounded-full', config.bg)}>
            <Icon className={cn('w-4 h-4', config.color)} />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground/70">
              {data.type.replace('_', ' ')}
            </span>
            {data.difficulty && (
              <span className={cn("text-[9px] font-bold uppercase", 
                data.difficulty === 'beginner' ? 'text-emerald-400' :
                data.difficulty === 'intermediate' ? 'text-amber-400' : 'text-red-400'
              )}>
                {data.difficulty}
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-foreground line-clamp-1">
            {data.title}
          </h3>
          {data.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
              {data.description}
            </p>
          )}
        </div>
      </div>
      
      {/* Metadata Tags Placeholder */}
      {data.tags && data.tags.length > 0 && (
        <div className="flex gap-1 mt-3 pt-3 border-t border-white/5 overflow-hidden">
          {data.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-muted-foreground whitespace-nowrap">
              {tag}
            </span>
          ))}
          {data.tags.length > 3 && <span className="text-[9px] px-1 text-muted-foreground">+{data.tags.length - 3}</span>}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 border-2 border-background bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 border-2 border-background bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
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
