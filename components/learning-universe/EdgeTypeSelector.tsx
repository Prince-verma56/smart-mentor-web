"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Connection } from '@xyflow/react';
import { EdgeSemanticType } from '@/stores/learningUniverseStore';
import { Link2, CheckCircle2, Lock, Sparkles, BrainCircuit, AlertCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EdgeTypeSelectorProps {
  connection?: Connection;
  mouseX?: number;
  mouseY?: number;
  isRelative?: boolean;
  onSelect: (type: EdgeSemanticType) => void;
  onCancel: () => void;
}

export const EdgeTypeSelector = ({ connection, mouseX, mouseY, isRelative = false, onSelect, onCancel }: EdgeTypeSelectorProps) => {
  const types: { type: EdgeSemanticType; label: string; icon: any; color: string }[] = [
    { type: 'prerequisite', label: 'Prerequisite', icon: CheckCircle2, color: 'text-primary' },
    { type: 'dependency', label: 'Dependency', icon: Link2, color: 'text-slate-400' },
    { type: 'unlock', label: 'Unlock', icon: Lock, color: 'text-blue-400' },
    { type: 'recommended', label: 'Recommended', icon: Sparkles, color: 'text-amber-400' },
    { type: 'optional', label: 'Optional', icon: ExternalLink, color: 'text-muted-foreground' },
    { type: 'reference', label: 'Reference', icon: BrainCircuit, color: 'text-emerald-400' },
  ];

  return (
    <>
      {!isRelative && (
        <div className="fixed inset-0 z-[110]" onClick={onCancel} onContextMenu={(e) => { e.preventDefault(); onCancel(); }} />
      )}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={isRelative ? {} : { left: mouseX, top: mouseY }}
        className={cn(
          "z-[111] w-56 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1 overflow-hidden",
          isRelative ? "absolute top-full left-1/2 -translate-x-1/2 mt-2" : "fixed"
        )}
      >
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          Select Relationship
        </div>
        <div className="flex flex-col gap-0.5">
          {types.map(({ type, label, icon: Icon, color }) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm rounded-lg transition-colors text-slate-200 hover:bg-white/10 hover:text-white"
            >
              <Icon className={`w-4 h-4 ${color}`} />
              {label}
            </button>
          ))}
        </div>
      </motion.div>
    </>
  );
};
