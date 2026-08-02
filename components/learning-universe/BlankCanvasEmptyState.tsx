"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, PenLine, FolderOpen, LayoutTemplate, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BlankCanvasEmptyStateProps {
  onGenerate: () => void;
  onStartBuilding: () => void;
  onImport: () => void;
  onTemplate: () => void;
  isGenerating?: boolean;
}

const options = [
  {
    id: 'generate',
    icon: Sparkles,
    title: 'Generate with AI',
    description: 'Let your mentor create a personalized learning roadmap for you.',
    gradient: 'from-violet-600 to-indigo-600',
    glow: 'shadow-violet-500/20',
    border: 'border-violet-500/30',
    primary: true,
  },
  {
    id: 'build',
    icon: PenLine,
    title: 'Start Building Manually',
    description: 'Design your own learning graph from scratch, your way.',
    gradient: 'from-emerald-600 to-teal-600',
    glow: 'shadow-emerald-500/20',
    border: 'border-emerald-500/30',
    primary: false,
  },
  {
    id: 'import',
    icon: FolderOpen,
    title: 'Import a .luv File',
    description: 'Restore a previously exported Learning Universe canvas.',
    gradient: 'from-amber-600 to-orange-600',
    glow: 'shadow-amber-500/20',
    border: 'border-amber-500/30',
    primary: false,
  },
  {
    id: 'template',
    icon: LayoutTemplate,
    title: 'Choose a Template',
    description: 'Start from a curated template for your learning goal.',
    gradient: 'from-blue-600 to-cyan-600',
    glow: 'shadow-blue-500/20',
    border: 'border-blue-500/30',
    primary: false,
  },
];

export const BlankCanvasEmptyState = ({
  onGenerate,
  onStartBuilding,
  onImport,
  onTemplate,
  isGenerating,
}: BlankCanvasEmptyStateProps) => {
  const handlers: Record<string, () => void> = {
    generate: onGenerate,
    build: onStartBuilding,
    import: onImport,
    template: onTemplate,
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
      {/* Subtle background grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center max-w-2xl w-full px-6"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center mb-4 mx-auto shadow-xl">
            <Sparkles className="w-8 h-8 text-white/60" />
          </div>
          <h2 className="text-2xl font-bold text-white/90 tracking-tight mb-2">
            Empty Canvas
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            This is your blank slate. Choose how you want to start building your knowledge graph.
          </p>
        </motion.div>

        {/* Option Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {options.map((opt, i) => {
            const Icon = opt.icon;
            return (
              <motion.button
                key={opt.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                onClick={handlers[opt.id]}
                className={`group relative flex items-start gap-4 p-4 rounded-2xl border bg-white/[0.03] backdrop-blur-xl transition-all duration-300 text-left hover:bg-white/[0.07] hover:-translate-y-1 hover:shadow-xl ${opt.border} ${opt.primary ? `shadow-lg ${opt.glow}` : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${opt.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white/90">{opt.title}</h3>
                    {opt.primary && (
                      <span className="text-[10px] font-bold text-violet-300 bg-violet-500/20 px-1.5 py-0.5 rounded-full">
                        AI
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{opt.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0 mt-0.5" />
              </motion.button>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-muted-foreground/50 mt-6"
        >
          You can also drag nodes from the toolbar to start building manually.
        </motion.p>
      </motion.div>
    </div>
  );
};
