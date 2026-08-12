"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Network, Info, BarChart2, Sparkles, ChevronRight, ChevronLeft, ChevronDown, Search, MapPin, Clock, Zap, Target, Layers, BookOpen, Code2, PanelRightClose, PanelRightOpen } from 'lucide-react';
import SmoothTab from '@/components/kokonutui/smooth-tab';
import { useCanvasStore, useWorkspaceStore } from '@/stores/learningUniverseStore';
import { calculateGraphStats } from '@/stores/workspace/types';
import { useReactFlow } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Outline Tree ───────────────────────────────────────────────────────────────

interface OutlineNode {
  id: string;
  title: string;
  type: string;
  status: string;
  difficulty?: string;
  hierarchyIndex?: string;
  children: OutlineNode[];
  depth: number;
}

const STATUS_COLOR: Record<string, string> = {
  completed: 'bg-emerald-400',
  'in-progress': 'bg-amber-400',
  unlocked: 'bg-blue-400',
  locked: 'bg-slate-500',
  skipped: 'bg-slate-400',
};

const TYPE_ICON: Record<string, React.ElementType> = {
  milestone: Target,
  topic: Layers,
  subtopic: BookOpen,
  lesson: BookOpen,
  concept: Sparkles,
  project: Code2,
  mini_project: Code2,
  default: BookOpen,
};

function buildOutlineTree(nodes: any[], edges: any[]): OutlineNode[] {
  const adj: Record<string, string[]> = {};
  const inDegree: Record<string, number> = {};
  nodes.forEach(n => { adj[n.id] = []; inDegree[n.id] = 0; });
  edges.forEach(e => {
    if (adj[e.source]) adj[e.source].push(e.target);
    if (inDegree[e.target] !== undefined) inDegree[e.target]++;
  });

  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const roots = nodes.filter(n => inDegree[n.id] === 0)
    .sort((a, b) => (a.data.learning_order ?? 99) - (b.data.learning_order ?? 99));

  const buildChildren = (id: string, depth: number): OutlineNode => {
    const node = nodeMap.get(id)!;
    const childIds = (adj[id] || []).filter(cid => nodeMap.has(cid));
    const childNodes = childIds
      .map(cid => nodeMap.get(cid)!)
      .sort((a, b) => (a.data.learning_order ?? 99) - (b.data.learning_order ?? 99));
    return {
      id,
      title: node.data.title,
      type: node.data.type,
      status: node.data.status,
      difficulty: node.data.difficulty,
      hierarchyIndex: node.data.metadata?.hierarchyIndex,
      depth,
      children: childNodes.map(cn => buildChildren(cn.id, depth + 1)),
    };
  };

  return roots.map(r => buildChildren(r.id, 0));
}

interface OutlineItemProps {
  node: OutlineNode;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onJump: (id: string) => void;
  searchQuery: string;
}

const OutlineItem = React.memo(({ node, expanded, onToggle, onJump, searchQuery }: OutlineItemProps) => {
  const isExpanded = expanded.has(node.id);
  const hasChildren = node.children.length > 0;
  const Icon = TYPE_ICON[node.type] || TYPE_ICON.default;

  const matchesSearch = searchQuery
    ? node.title.toLowerCase().includes(searchQuery.toLowerCase())
    : true;

  if (searchQuery && !matchesSearch && node.children.length === 0) return null;

  return (
    <div className="relative group/item">
      {/* Connection Guide Line (Left) */}
      {node.depth > 0 && (
        <div 
          className="absolute left-[-10px] top-0 bottom-0 w-[1px] bg-white/[0.05] group-hover/item:bg-white/[0.2] transition-colors" 
        />
      )}
      
      <motion.div
        className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer text-sm transition-colors relative z-10 ${
          isExpanded ? 'bg-white/[0.03]' : 'hover:bg-white/[0.02]'
        }`}
        onClick={() => onJump(node.id)}
      >
        <button
          className={`w-4 h-4 flex items-center justify-center rounded-sm hover:bg-white/10 transition-colors shrink-0 ${
            hasChildren ? 'text-muted-foreground hover:text-white' : 'opacity-0 cursor-default'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggle(node.id);
          }}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-3 h-3" />
          </motion.div>
        </button>

        <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        
        <span className="flex-1 truncate font-medium text-white/80">{node.title}</span>
        
        {/* Status Dot */}
        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_COLOR[node.status] || 'bg-white/20'}`} />
      </motion.div>

      <AnimatePresence initial={false}>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="ml-5 mt-0.5 space-y-0.5 relative">
              {/* Vertical line connecting children */}
              <div className="absolute left-[-10px] top-0 bottom-2 w-[1px] bg-white/[0.05]" />
              {node.children.map(child => (
                <OutlineItem 
                  key={child.id} 
                  node={child} 
                  expanded={expanded} 
                  onToggle={onToggle} 
                  onJump={onJump}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
OutlineItem.displayName = 'OutlineItem';

// ── Stats Bar ──────────────────────────────────────────────────────────────────

const StatsBar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-white/80">{value} <span className="text-muted-foreground/60">({pct}%)</span></span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

export const CanvasSidebar = () => {
  const nodes = useCanvasStore(s => s.nodes);
  const edges = useCanvasStore(s => s.edges);
  const canvases = useWorkspaceStore(s => s.canvases);
  const activeCanvasId = useWorkspaceStore(s => s.activeCanvasId);

  const [outlineSearch, setOutlineSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeCanvas = canvases.find(c => c.id === activeCanvasId);
  const stats = useMemo(() => calculateGraphStats(nodes, edges), [nodes, edges]);
  const outlineTree = useMemo(() => buildOutlineTree(nodes, edges), [nodes, edges]);

  const handleToggle = useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleJumpToNode = useCallback((id: string) => {
    const node = nodes.find(n => n.id === id);
    if (!node) return;
    const x = node.position.x + 150;
    const y = node.position.y + 80;
    
    // Dispatch a custom event since we are outside ReactFlowProvider
    window.dispatchEvent(new CustomEvent('canvas-jump-to-node', { 
      detail: { x, y, zoom: 1.2, duration: 600, id: node.id } 
    }));
  }, [nodes]);

  const handleExpandAll = () => {
    setExpanded(new Set(nodes.map(n => n.id)));
  };
  const handleCollapseAll = () => setExpanded(new Set());

  return (
    <div className={`relative h-full shrink-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-0 border-l-0' : 'w-80 lg:w-96 border-l border-white/5'}`}>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-4 -left-10 z-50 p-2 rounded-xl bg-white/[0.05] border border-white/[0.1] backdrop-blur-md text-muted-foreground hover:text-white hover:bg-white/[0.1] shadow-lg transition-all"
        title={isCollapsed ? "Open sidebar" : "Close sidebar"}
      >
        {isCollapsed ? <PanelRightOpen className="w-4 h-4" /> : <PanelRightClose className="w-4 h-4" />}
      </button>

      <div className={`flex flex-col h-full w-full overflow-hidden bg-black/20 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <SmoothTab
        defaultTabId="outline"
        wrapperClassName="h-full gap-0 overflow-hidden"
        className="mx-3 mt-3 mb-2 shrink-0 flex bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] rounded-[20px] p-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
        activeColor="bg-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] ring-1 ring-white/10 rounded-2xl"
        selectedTextColor="text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
        items={[
          {
            id: 'outline',
            title: 'Explorer',
            color: 'bg-emerald-500/10',
            cardContent: (
              <div className="flex flex-col h-full min-h-0">
                {/* Search + actions */}
                <div className="px-3 pt-2 pb-2 space-y-2 flex-shrink-0">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      value={outlineSearch}
                      onChange={e => setOutlineSearch(e.target.value)}
                      placeholder="Search nodes..."
                      className="h-7 pl-8 text-xs bg-white/[0.03] border-white/10 focus:border-indigo-500/50 rounded-lg"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      {nodes.length} nodes
                    </span>
                    <div className="flex gap-1">
                      <button onClick={handleExpandAll} className="text-[10px] text-muted-foreground hover:text-white transition-colors">Expand all</button>
                      <span className="text-muted-foreground/40">·</span>
                      <button onClick={handleCollapseAll} className="text-[10px] text-muted-foreground hover:text-white transition-colors">Collapse</button>
                    </div>
                  </div>
                </div>

                <ScrollArea className="flex-1 min-h-0" data-lenis-prevent="true">
                  <div className="px-2 pb-4">
                    {nodes.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <Network className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm text-muted-foreground">Canvas is empty.</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Generate or add nodes to see the hierarchy.</p>
                      </div>
                    ) : (
                      outlineTree.map(root => (
                        <OutlineItem
                          key={root.id}
                          node={root}
                          expanded={expanded}
                          onToggle={handleToggle}
                          onJump={handleJumpToNode}
                          searchQuery={outlineSearch}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            ),
          },
          {
            id: 'info',
            title: 'Info',
            color: 'bg-primary/10',
            cardContent: (
              <ScrollArea className="h-full min-h-0" data-lenis-prevent="true">
                <div className="p-4 space-y-5">
                  {/* Canvas details */}
                  <div>
                    <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Canvas Details</h3>
                    <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02] space-y-2.5">
                      {[
                        { label: 'Name', value: activeCanvas?.title || activeCanvas?.name || 'Official Roadmap' },
                        { label: 'Total Nodes', value: stats.totalNodes },
                        { label: 'Total Edges', value: stats.totalEdges },
                        { label: 'Branches', value: stats.branchCount },
                        { label: 'Milestones', value: stats.milestoneCount },
                        { label: 'Projects', value: stats.projectCount },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-semibold text-white/90">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Learning metrics */}
                  <div>
                    <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Learning Metrics</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Est. Hours', value: `~${stats.totalHours}h`, icon: Clock },
                        { label: 'Total XP', value: `${stats.totalXP}`, icon: Zap },
                        { label: 'Earned XP', value: `${stats.earnedXP}`, icon: Zap },
                        { label: 'Completion', value: `${stats.completionPercentage}%`, icon: Target },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02]">
                          <Icon className="w-3.5 h-3.5 text-indigo-400 mb-1" />
                          <div className="text-sm font-bold text-white/90">{value}</div>
                          <div className="text-[10px] text-muted-foreground">{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ),
          },
          {
            id: 'stats',
            title: 'Stats',
            color: 'bg-primary/10',
            cardContent: (
              <ScrollArea className="h-full min-h-0" data-lenis-prevent="true">
                <div className="p-4 space-y-5">
                  {/* Progress */}
                  <div>
                    <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Progress</h3>
                    <div className="space-y-3">
                      <StatsBar label="Completed" value={stats.completedNodes} max={stats.totalNodes} color="bg-emerald-500" />
                      <StatsBar label="In Progress" value={stats.inProgressNodes} max={stats.totalNodes} color="bg-amber-500" />
                      <StatsBar label="Locked" value={stats.lockedNodes} max={stats.totalNodes} color="bg-slate-500" />
                    </div>
                  </div>

                  {/* Difficulty breakdown */}
                  <div>
                    <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Difficulty</h3>
                    <div className="space-y-3">
                      <StatsBar label="Beginner" value={stats.difficultyBreakdown.beginner} max={stats.totalNodes} color="bg-emerald-500" />
                      <StatsBar label="Intermediate" value={stats.difficultyBreakdown.intermediate} max={stats.totalNodes} color="bg-amber-500" />
                      <StatsBar label="Advanced" value={stats.difficultyBreakdown.advanced} max={stats.totalNodes} color="bg-rose-500" />
                    </div>
                  </div>

                  {/* Node type distribution */}
                  <div>
                    <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">By Type</h3>
                    <div className="space-y-2">
                      {Object.entries(stats.typeBreakdown)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 8)
                        .map(([type, count]) => (
                          <div key={type} className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground capitalize min-w-[80px]">{type.replace('_', ' ')}</span>
                            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-emerald-500/70"
                                style={{ width: `${stats.totalNodes > 0 ? (count / stats.totalNodes) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="text-white/70 w-4 text-right">{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ),
          },
          {
            id: 'ai',
            title: 'AI Agent',
            color: 'bg-primary/10',
            cardContent: (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/20 flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-sm font-semibold text-white/90 mb-2">AI Learning Agent</h3>
                <p className="text-xs text-muted-foreground max-w-[180px] leading-relaxed mb-4">
                  Ask AI to generate paths, expand topics, find knowledge gaps, or create flashcards from your graph.
                </p>
                <div className="px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-medium">
                  Coming in Phase 15
                </div>
              </div>
            ),
          },
        ]}
      />
      </div>
    </div>
  );
};
