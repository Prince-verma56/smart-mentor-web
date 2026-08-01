"use client";

import React, { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useLearningUniverseStore } from '@/stores/learningUniverseStore';
import { 
  X, ExternalLink, BookOpen, Clock, Activity, Zap, Layers, 
  Code2, Brain, FileText, CheckCircle2, Bookmark, Flame, Target, ListChecks,
  History, Settings, Lightbulb, Link2, Sparkles, Folder, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRouter, useParams } from 'next/navigation';

export const Inspector = () => {
  const inspectorNodeId = useLearningUniverseStore(s => s.inspectorNodeId);
  const data = useLearningUniverseStore(s => s.nodes.find(n => n.id === s.inspectorNodeId)?.data);
  const setInspectorNodeId = useLearningUniverseStore(s => s.setInspectorNodeId);
  const updateNodeData = useLearningUniverseStore(s => s.updateNodeData);
  
  const prerequisites = useLearningUniverseStore(useShallow(s => 
    s.edges.filter(e => e.target === s.inspectorNodeId)
      .map(e => s.nodes.find(n => n.id === e.source)?.data.title).filter(Boolean)
  ));

  const nextNodes = useLearningUniverseStore(useShallow(s => 
    s.edges.filter(e => e.source === s.inspectorNodeId)
      .map(e => s.nodes.find(n => n.id === e.target)?.data.title).filter(Boolean)
  ));

  const router = useRouter();
  const params = useParams();
  const mentorId = params.mentorId as string;

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && inspectorNodeId) {
        setInspectorNodeId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectorNodeId, setInspectorNodeId]);

  if (!inspectorNodeId || !data) return null;

  const handleEnterWorkspace = () => {
    router.push(`/dashboard/mentors/${mentorId}/learning-universe/node/${inspectorNodeId}`);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="absolute right-4 top-4 bottom-4 w-96 bg-background/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col z-50 pointer-events-auto overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-muted/20">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-foreground text-sm">Inspector</h3>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-white/10" onClick={() => setInspectorNodeId(null)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1" data-lenis-prevent="true">
          <div className="p-5 space-y-6">
            
            {/* 1. Overview */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <select 
                  className="bg-primary/10 text-primary border-primary/20 uppercase text-[10px] font-semibold px-2 py-1 rounded-md outline-none"
                  value={data.type}
                  onChange={(e) => updateNodeData(inspectorNodeId, { type: e.target.value as any })}
                >
                  {['topic', 'lesson', 'concept', 'quiz', 'project', 'ai_challenge', 'interview', 'milestone'].map(t => (
                    <option key={t} value={t} className="bg-zinc-900">{t.replace('_', ' ')}</option>
                  ))}
                </select>

                <select 
                  className={cn(
                    "uppercase text-[10px] font-semibold px-2 py-1 rounded-md outline-none",
                    data.difficulty === 'beginner' ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20' :
                    data.difficulty === 'intermediate' ? 'text-amber-400 bg-amber-400/10 border border-amber-400/20' : 
                    'text-red-400 bg-red-400/10 border border-red-400/20'
                  )}
                  value={data.difficulty || 'beginner'}
                  onChange={(e) => updateNodeData(inspectorNodeId, { difficulty: e.target.value as any })}
                >
                  {['beginner', 'intermediate', 'advanced'].map(t => (
                    <option key={t} value={t} className="bg-zinc-900">{t}</option>
                  ))}
                </select>

                <select 
                  className="bg-white/5 text-muted-foreground border-white/10 uppercase text-[10px] font-semibold px-2 py-1 rounded-md outline-none"
                  value={data.status}
                  onChange={(e) => updateNodeData(inspectorNodeId, { status: e.target.value as any })}
                >
                  {['locked', 'unlocked', 'in-progress', 'completed', 'skipped'].map(t => (
                    <option key={t} value={t} className="bg-zinc-900">{t}</option>
                  ))}
                </select>
              </div>
              
              <input 
                className="w-full text-xl font-bold text-foreground leading-tight bg-transparent border-b border-transparent hover:border-white/10 focus:border-primary outline-none transition-colors px-1 py-1"
                value={data.title}
                onChange={(e) => updateNodeData(inspectorNodeId, { title: e.target.value })}
                placeholder="Node Title..."
              />
              
              <textarea 
                className="w-full text-sm text-muted-foreground mt-2 leading-relaxed bg-white/5 border border-transparent hover:border-white/10 focus:border-primary/50 outline-none rounded-lg p-2 resize-none transition-colors"
                value={data.description || ''}
                onChange={(e) => updateNodeData(inspectorNodeId, { description: e.target.value })}
                placeholder="Node Description..."
                rows={3}
              />
            </div>

            {/* 2. Stats Grid */}
            <div className="flex gap-4 p-4 border-b border-white/5 bg-zinc-900/50">
              <div className="flex-1 bg-zinc-800/40 rounded-xl p-3 border border-white/5 shadow-inner">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  REWARD (XP)
                </div>
                <input 
                  type="number"
                  className="bg-transparent border-none text-white text-lg font-bold p-0 focus:ring-0 focus:outline-none w-full"
                  defaultValue={data.xp || 50}
                  onBlur={(e) => updateNodeData(inspectorNodeId, { xp: parseInt(e.target.value) || 50 })}
                />
              </div>
              <div className="flex-1 bg-zinc-800/40 rounded-xl p-3 border border-white/5 shadow-inner">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  EST. TIME (MIN)
                </div>
                <input 
                  type="number"
                  className="bg-transparent border-none text-white text-lg font-bold p-0 focus:ring-0 focus:outline-none w-full"
                  defaultValue={data.estimated_time || 30}
                  onBlur={(e) => updateNodeData(inspectorNodeId, { estimated_time: parseInt(e.target.value) || 30 })}
                />
              </div>
            </div>

            {/* 3. Progress */}
            {data.progress !== undefined && (
              <div>
                <div className="flex justify-between text-[11px] font-medium text-muted-foreground mb-2">
                  <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Progress</span>
                  <span>{data.progress}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-1000"
                    style={{ width: `${data.progress}%` }}
                  />
                </div>
              </div>
            )}

            <Separator className="bg-white/5" />

            {/* 4. Dependencies */}
            <div className="space-y-4">
              <div>
                <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5" /> Prerequisites
                </h4>
                {prerequisites.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {prerequisites.map((p, i) => (
                      <div key={i} className="text-sm bg-white/5 border border-white/5 px-2 py-1.5 rounded-md flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {p}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No prerequisites.</p>
                )}
              </div>

              <div>
                <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> Unlocks
                </h4>
                {nextNodes.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {nextNodes.map((n, i) => (
                      <div key={i} className="text-sm bg-white/5 border border-white/5 px-2 py-1.5 rounded-md flex items-center gap-2">
                        <Lock className="w-3 h-3 text-amber-500" /> {n}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">End of path.</p>
                )}
              </div>
            </div>

            <Separator className="bg-white/5" />

            {/* 5. AI Actions */}
            <div>
              <h4 className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI Actions
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="bg-primary/5 hover:bg-primary/10 border-primary/20 text-xs h-8 justify-start" disabled>
                  <FileText className="w-3 h-3 mr-2" /> Generate Summary
                </Button>
                <Button variant="outline" size="sm" className="bg-primary/5 hover:bg-primary/10 border-primary/20 text-xs h-8 justify-start" disabled>
                  <Lightbulb className="w-3 h-3 mr-2" /> Generate Quiz
                </Button>
                <Button variant="outline" size="sm" className="bg-primary/5 hover:bg-primary/10 border-primary/20 text-xs h-8 justify-start" disabled>
                  <Brain className="w-3 h-3 mr-2" /> Flashcards
                </Button>
                <Button variant="outline" size="sm" className="bg-primary/5 hover:bg-primary/10 border-primary/20 text-xs h-8 justify-start" disabled>
                  <Code2 className="w-3 h-3 mr-2" /> Code Examples
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 italic text-center">AI actions will be available in the Node Workspace.</p>
            </div>

            <Separator className="bg-white/5" />

            {/* 6. Learning Materials (Placeholders) */}
            <div>
              <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5" /> Learning Materials
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors cursor-not-allowed opacity-50">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span>Resources</span>
                  </div>
                  <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded">0</span>
                </div>
                <div className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors cursor-not-allowed opacity-50">
                  <div className="flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-emerald-400" />
                    <span>Practice Exercises</span>
                  </div>
                  <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded">0</span>
                </div>
                <div className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors cursor-not-allowed opacity-50">
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-rose-400" />
                    <span>Bookmarks & Notes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 7. Metadata */}
            <div className="pt-4 mt-4 border-t border-white/5">
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Settings className="w-3 h-3" /> Metadata
              </h4>
              <div className="text-[11px] text-muted-foreground/70 font-mono space-y-1">
                <div>ID: {inspectorNodeId}</div>
                <div>Status: {data.status}</div>
                <div className="flex gap-1 flex-wrap mt-1">
                  Tags: {data.tags?.map((t: string) => <span key={t} className="bg-white/5 px-1 rounded">#{t}</span>) || 'none'}
                </div>
              </div>
            </div>

          </div>
        </ScrollArea>

        {/* Footer Action */}
        <div className="p-4 border-t border-white/5 bg-background/50">
          <Button 
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl shadow-lg shadow-primary/20"
            onClick={handleEnterWorkspace}
          >
            Enter Node Workspace <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
