"use client";

import React from 'react';
import { useLearningUniverseStore } from '@/stores/learningUniverseStore';
import { X, ExternalLink, BookOpen, Clock, Activity, Zap, Layers, Code2, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export const Inspector = () => {
  const { selectedNodeId, nodes, setSelectedNodeId } = useLearningUniverseStore();
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <AnimatePresence>
      {selectedNode && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute right-4 top-4 bottom-4 w-96 bg-background/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-50 pointer-events-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5 bg-muted/20">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-foreground text-sm">Inspector</h3>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-white/10"
              onClick={() => setSelectedNodeId(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1" data-lenis-prevent="true">
            <div className="p-5 space-y-6">
              
              {/* Overview Section */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 uppercase text-[10px]">
                    {selectedNode.data.type.replace('_', ' ')}
                  </Badge>
                  {selectedNode.data.difficulty && (
                    <Badge variant="outline" className={cn(
                      "uppercase text-[10px] bg-background",
                      selectedNode.data.difficulty === 'beginner' ? 'text-emerald-400 border-emerald-400/20' :
                      selectedNode.data.difficulty === 'intermediate' ? 'text-amber-400 border-amber-400/20' : 
                      'text-red-400 border-red-400/20'
                    )}>
                      {selectedNode.data.difficulty}
                    </Badge>
                  )}
                  {selectedNode.data.xp && (
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px]">
                      {selectedNode.data.xp} XP
                    </Badge>
                  )}
                </div>
                
                <h2 className="text-xl font-bold text-foreground leading-tight">
                  {selectedNode.data.title}
                </h2>
                
                {selectedNode.data.description && (
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                    {selectedNode.data.description}
                  </p>
                )}

                {/* Progress Bar (if applicable) */}
                {selectedNode.data.progress !== undefined && (
                  <div className="mt-4">
                    <div className="flex justify-between text-[11px] font-medium text-muted-foreground mb-1.5">
                      <span>Progress</span>
                      <span>{selectedNode.data.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-1000"
                        style={{ width: `${selectedNode.data.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator className="bg-white/5" />

              {/* Tags Section */}
              {selectedNode.data.tags && selectedNode.data.tags.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Bookmark className="w-3 h-3" />
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedNode.data.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 rounded-md bg-white/5 text-muted-foreground text-xs border border-white/5">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Content Slots (Phase 12 Preview) */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Brain className="w-3 h-3 text-emerald-400" />
                  AI Generation Slots
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col p-3 rounded-xl bg-white/5 border border-white/5 opacity-60">
                    <span className="text-[10px] font-medium text-muted-foreground mb-1">Summary</span>
                    <span className="text-xs text-foreground/50 italic">Waiting for AI...</span>
                  </div>
                  <div className="flex flex-col p-3 rounded-xl bg-white/5 border border-white/5 opacity-60">
                    <span className="text-[10px] font-medium text-muted-foreground mb-1">Flashcards</span>
                    <span className="text-xs text-foreground/50 italic">Waiting for AI...</span>
                  </div>
                </div>
              </div>

              {/* Action Triggers */}
              <div className="space-y-3 pb-4">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Quick Actions
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="bg-white/[0.02] border-white/5 justify-start text-xs text-muted-foreground" disabled>
                    <Brain className="w-3.5 h-3.5 mr-2" /> Explain Node
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white/[0.02] border-white/5 justify-start text-xs text-muted-foreground" disabled>
                    <Code2 className="w-3.5 h-3.5 mr-2" /> Practice
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white/[0.02] border-white/5 justify-start text-xs text-muted-foreground" disabled>
                    <BookOpen className="w-3.5 h-3.5 mr-2" /> Resources
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white/[0.02] border-white/5 justify-start text-xs text-muted-foreground" disabled>
                    <Zap className="w-3.5 h-3.5 mr-2" /> Generate Quiz
                  </Button>
                </div>
              </div>

            </div>
          </ScrollArea>

          {/* Footer Action */}
          <div className="p-4 border-t border-white/5 bg-white/[0.02]">
            <Button className="w-full gap-2 rounded-xl h-12 shadow-lg hover:shadow-primary/25 transition-all" disabled>
              <span className="font-semibold tracking-wide">Enter Node Workspace</span>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
