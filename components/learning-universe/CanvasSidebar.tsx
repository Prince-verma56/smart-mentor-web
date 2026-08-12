"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Sparkles, ChevronRight, Search, Clock, Zap, Target,
  PanelRightClose, PanelRightOpen, GitBranch, BookOpen, FileText,
  Terminal, FolderKanban, Milestone, Layers, Network, GraduationCap, ClipboardCheck, Wrench, Database
} from 'lucide-react';
import SmoothTab from '@/components/kokonutui/smooth-tab';
import { useCanvasStore, useWorkspaceStore, useSelectionStore } from '@/stores/learningUniverseStore';
import { calculateGraphStats } from '@/stores/workspace/types';
import { motion, AnimatePresence } from 'framer-motion';

// ── Outline Tree (unchanged data logic) ───────────────────────────────────────

interface OutlineNode {
  id: string;
  title: string;
  type: string;
  status: string;
  difficulty?: string;
  hierarchyIndex?: string;
  children: OutlineNode[];
  depth: number;
  isPractice: boolean;
}

const STATUS_COLOR: Record<string, string> = {
  completed:     'bg-emerald-400',
  'in-progress': 'bg-amber-400',
  unlocked:      'bg-blue-400',
  locked:        'bg-slate-500',
  skipped:       'bg-slate-400',
};

const STATUS_GLOW: Record<string, string> = {
  completed:     'shadow-[0_0_6px_rgba(52,211,153,0.6)]',
  'in-progress': 'shadow-[0_0_6px_rgba(251,191,36,0.6)]',
  unlocked:      'shadow-[0_0_6px_rgba(96,165,250,0.5)]',
  locked:        '',
  skipped:       '',
};

const TYPE_ICON: Record<string, React.ElementType> = {
  milestone:    Milestone,
  topic:        GitBranch,
  subtopic:     Layers,
  lesson:       GraduationCap,
  concept:      BookOpen,
  project:      FolderKanban,
  mini_project: FolderKanban,
  practice:     Target,
  assessment:   ClipboardCheck,
  tool:         Wrench,
  framework:    Layers,
  database:     Database,
  api:          Network,
  default:      BookOpen,
};

const TYPE_COLOR: Record<string, string> = {
  milestone:    'text-purple-400',
  topic:        'text-emerald-400',
  subtopic:     'text-teal-400',
  lesson:       'text-sky-400',
  concept:      'text-indigo-400',
  project:      'text-amber-400',
  mini_project: 'text-amber-400',
  practice:     'text-rose-400',
  default:      'text-slate-400',
};

const TYPE_RING: Record<string, string> = {
  milestone:    'ring-purple-500/40',
  topic:        'ring-emerald-500/40',
  subtopic:     'ring-teal-500/30',
  lesson:       'ring-sky-500/30',
  concept:      'ring-indigo-500/30',
  project:      'ring-amber-500/30',
  mini_project: 'ring-amber-500/30',
  practice:     'ring-rose-500/30',
  default:      'ring-white/10',
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
  let roots = nodes
    .filter(n => inDegree[n.id] === 0)
    .sort((a, b) => (a.data.learning_order ?? 99) - (b.data.learning_order ?? 99));

  const globalVisited = new Set<string>();

  const buildChildren = (id: string, depth: number): OutlineNode | null => {
    if (globalVisited.has(id)) return null;
    globalVisited.add(id);

    const node = nodeMap.get(id)!;
    const childIds = (adj[id] || []).filter(cid => nodeMap.has(cid) && !globalVisited.has(cid));
    const childNodes = childIds
      .map(cid => nodeMap.get(cid)!)
      .sort((a, b) => {
        const aCat = a.data.nodeCategory;
        const bCat = b.data.nodeCategory;
        const aIsSide = ['PRACTICE', 'PROJECT', 'ASSESSMENT'].includes(aCat || '') || ['practice', 'quiz', 'project'].includes(a.data.type || '');
        const bIsSide = ['PRACTICE', 'PROJECT', 'ASSESSMENT'].includes(bCat || '') || ['practice', 'quiz', 'project'].includes(b.data.type || '');
        if (aIsSide && !bIsSide) return 1;
        if (!aIsSide && bIsSide) return -1;
        return (a.data.learning_order ?? 99) - (b.data.learning_order ?? 99);
      });

    const nodeCat = node.data.nodeCategory;
    const isPracticeNode = ['PRACTICE', 'PROJECT', 'ASSESSMENT'].includes(nodeCat || '') || ['practice', 'quiz', 'project'].includes(node.data.type || '');

    return {
      id,
      title: node.data.title,
      type: node.data.type,
      status: node.data.status,
      difficulty: node.data.difficulty,
      hierarchyIndex: node.id.includes('-') ? node.id.split('-')[1] : node.id,
      depth,
      isPractice: isPracticeNode,
      children: childNodes.map(cn => buildChildren(cn.id, depth + 1)).filter(Boolean) as OutlineNode[],
    };
  };

  const outline: OutlineNode[] = [];
  
  // 1. Process natural roots
  for (const root of roots) {
    const built = buildChildren(root.id, 0);
    if (built) outline.push(built);
  }

  // 2. Process disconnected graphs
  const remaining = nodes.filter(n => !globalVisited.has(n.id));
  for (const r of remaining) {
    const built = buildChildren(r.id, 0);
    if (built) outline.push(built);
  }

  return outline;
}

// ── Mind Map Child Node ────────────────────────────────────────────────────────

interface MindMapNodeProps {
  node: OutlineNode;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onJump: (id: string) => void;
  searchQuery: string;
  selectedNodes: string[];
  isLast?: boolean;
}

const hasMatchingDescendant = (n: OutlineNode, q: string): boolean => {
  if (n.title.toLowerCase().includes(q.toLowerCase())) return true;
  return n.children.some(c => hasMatchingDescendant(c, q));
};

const MindMapNode = React.memo(({
  node, expanded, onToggle, onJump, searchQuery, selectedNodes, isLast = false
}: MindMapNodeProps) => {
  const isExpanded = expanded.has(node.id);
  const hasChildren = node.children.length > 0;
  const Icon = TYPE_ICON[node.type] || TYPE_ICON.default;
  const iconColor = TYPE_COLOR[node.type] || TYPE_COLOR.default;
  const ringColor = TYPE_RING[node.type] || TYPE_RING.default;
  const statusDotColor = STATUS_COLOR[node.status] || 'bg-white/20';
  const statusGlow = STATUS_GLOW[node.status] || '';
  const isSelected = selectedNodes?.includes(node.id) ?? false;
  const isHighlighted = (searchQuery
    ? node.title.toLowerCase().includes(searchQuery.toLowerCase())
    : false) || isSelected;

  if (searchQuery && !isHighlighted && !hasMatchingDescendant(node, searchQuery)) return null;

  return (
    <div className="relative">
      {/* Connector: vertical stem */}
      <div
        className="absolute left-[-1px] top-0 w-[1px] bg-gradient-to-b from-white/[0.1] to-white/[0.03]"
        style={{ height: isLast ? '22px' : '100%' }}
      />
      {/* Connector: horizontal elbow */}
      <div className="absolute left-[-1px] top-[22px] w-3 h-[1px] bg-white/[0.1]" />

      {/* Node pill */}
      <motion.button
        className={`
          relative flex items-center gap-2 w-full text-left
          px-2 py-1.5 rounded-xl transition-all duration-150 ring-1 
          ${node.isPractice ? 'ring-white/5 border-dashed bg-white/[0.01]' : ringColor}
          ${isSelected ? 'bg-primary/20 ring-primary/60 shadow-[0_0_12px_rgba(var(--primary),0.2)]' : ''}
          ${isHighlighted && !isSelected
            ? 'bg-white/[0.08] ring-emerald-500/50'
            : node.isPractice && !isSelected
            ? 'hover:bg-white/[0.04]'
            : !isSelected ? 'bg-white/[0.02] hover:bg-white/[0.06]' : ''
          }
        `}
        style={{ marginLeft: node.isPractice ? '22px' : '11px', width: node.isPractice ? 'calc(100% - 11px)' : '100%' }}
        onClick={() => onJump(node.id)}
        title={node.title}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
      >
        {/* Collapse chevron */}
        <div
          role="button"
          tabIndex={-1}
          className={`shrink-0 w-4 h-4 flex items-center justify-center rounded-md transition-colors ${
            hasChildren ? 'hover:bg-white/10 text-muted-foreground hover:text-white' : 'opacity-0 pointer-events-none'
          }`}
          onClick={e => { e.stopPropagation(); if (hasChildren) onToggle(node.id); }}
        >
          <motion.span animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.15 }} className="flex">
            <ChevronRight className="w-3 h-3" />
          </motion.span>
        </div>

        <Icon className={`w-3.5 h-3.5 shrink-0 ${node.isPractice ? 'text-slate-500' : iconColor}`} />

        <span className={`flex-1 truncate font-medium ${isHighlighted ? 'text-white' : node.isPractice ? 'text-white/40 text-[11px]' : 'text-white/75 text-xs'}`}>
          {node.title}
        </span>

        <span className={`shrink-0 w-2 h-2 rounded-full ${statusDotColor} ${statusGlow}`} />
      </motion.button>

      {/* Children */}
      <AnimatePresence initial={false}>
        {(isExpanded || (searchQuery && hasMatchingDescendant(node, searchQuery))) && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="relative ml-4 mt-1 space-y-1 pl-3">
              <div className="absolute left-0 top-0 bottom-3 w-[1px] bg-gradient-to-b from-white/[0.1] via-white/[0.05] to-transparent" />
              {node.children.map((child, idx) => (
                <MindMapNode
                  key={child.id}
                  node={child}
                  expanded={expanded}
                  onToggle={onToggle}
                  onJump={onJump}
                  searchQuery={searchQuery}
                  selectedNodes={selectedNodes}
                  isLast={idx === node.children.length - 1}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
MindMapNode.displayName = 'MindMapNode';

// ── Root Node (larger, visually distinct) ─────────────────────────────────────

interface RootMindMapNodeProps {
  node: OutlineNode;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onJump: (id: string) => void;
  searchQuery: string;
  selectedNodes: string[];
  index: number;
}

const RootMindMapNode = React.memo(({
  node, expanded, onToggle, onJump, searchQuery, selectedNodes, index
}: RootMindMapNodeProps) => {
  const isExpanded = expanded.has(node.id);
  const hasChildren = node.children.length > 0;
  const Icon = TYPE_ICON[node.type] || TYPE_ICON.default;
  const iconColor = TYPE_COLOR[node.type] || TYPE_COLOR.default;
  const statusDotColor = STATUS_COLOR[node.status] || 'bg-white/20';
  const statusGlow = STATUS_GLOW[node.status] || '';
  const isSelected = selectedNodes?.includes(node.id) ?? false;
  const isHighlighted = (searchQuery
    ? node.title.toLowerCase().includes(searchQuery.toLowerCase())
    : false) || isSelected;

  if (searchQuery && !isHighlighted && !hasMatchingDescendant(node, searchQuery)) return null;

  return (
    <div className="relative">
      {index > 0 && <div className="h-[1px] bg-white/[0.04] mx-1 mb-2 mt-1" />}

      {/* Root pill — bolder */}
      <motion.button
        className={`
          relative flex items-center gap-2.5 w-full text-left
          px-3 py-2 rounded-xl transition-all duration-150 ring-1
          ${isSelected ? 'bg-primary/20 ring-primary/60 shadow-[0_0_12px_rgba(var(--primary),0.2)]' : ''}
          ${isHighlighted && !isSelected
            ? 'bg-white/[0.10] ring-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
            : !isSelected ? 'bg-white/[0.04] ring-white/[0.08] hover:bg-white/[0.08] hover:ring-white/[0.15]' : ''
          }
        `}
        onClick={() => onJump(node.id)}
        title={node.title}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
      >
        {/* Collapse chevron */}
        <div
          role="button"
          tabIndex={-1}
          className={`shrink-0 w-4 h-4 flex items-center justify-center rounded-md transition-colors ${
            hasChildren ? 'hover:bg-white/10 text-muted-foreground hover:text-white' : 'opacity-0 pointer-events-none'
          }`}
          onClick={e => { e.stopPropagation(); if (hasChildren) onToggle(node.id); }}
        >
          <motion.span animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.15 }} className="flex">
            <ChevronRight className="w-3 h-3" />
          </motion.span>
        </div>

        {/* Icon box */}
        <div className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center bg-white/[0.04] ring-1 ring-white/[0.08]">
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>

        <span className={`flex-1 truncate text-xs font-semibold ${isHighlighted ? 'text-white' : 'text-white/90'}`}>
          {node.title}
        </span>

        {hasChildren && (
          <span className="shrink-0 text-[10px] text-muted-foreground/50 tabular-nums">
            {node.children.length}
          </span>
        )}

        <span className={`shrink-0 w-2 h-2 rounded-full ${statusDotColor} ${statusGlow}`} />
      </motion.button>

      {/* Children branch */}
      <AnimatePresence initial={false}>
        {(isExpanded || (searchQuery && hasMatchingDescendant(node, searchQuery))) && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="relative ml-5 mt-1.5 mb-1 pl-3 space-y-1">
              {/* Vertical spine */}
              <div className="absolute left-0 top-0 bottom-3 w-[1px] bg-gradient-to-b from-white/[0.14] via-white/[0.07] to-transparent" />
              {node.children.map((child, idx) => (
                <MindMapNode
                  key={child.id}
                  node={child}
                  expanded={expanded}
                  onToggle={onToggle}
                  onJump={onJump}
                  searchQuery={searchQuery}
                  selectedNodes={selectedNodes}
                  isLast={idx === node.children.length - 1}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
RootMindMapNode.displayName = 'RootMindMapNode';

// ── Stats Bar (unchanged) ──────────────────────────────────────────────────────

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

// ── Legend ─────────────────────────────────────────────────────────────────────

const MindMapLegend = () => (
  <div className="flex flex-wrap gap-x-3 gap-y-1 px-3 py-2 bg-white/[0.015] border-t border-white/[0.04]">
    {[
      { color: 'bg-emerald-400', label: 'Done'     },
      { color: 'bg-amber-400',   label: 'Active'   },
      { color: 'bg-blue-400',    label: 'Unlocked' },
      { color: 'bg-slate-500',   label: 'Locked'   },
    ].map(({ color, label }) => (
      <div key={label} className="flex items-center gap-1">
        <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
        <span className="text-[10px] text-muted-foreground/60">{label}</span>
      </div>
    ))}
  </div>
);

// ── Main Sidebar Component ─────────────────────────────────────────────────────

export const CanvasSidebar = () => {
  const nodes = useCanvasStore(s => s.nodes);
  const edges = useCanvasStore(s => s.edges);
  const canvases = useWorkspaceStore(s => s.canvases);
  const activeCanvasId = useWorkspaceStore(s => s.activeCanvasId);
  const selectedNodeId = useSelectionStore(s => s.selectedNodeId);
  const setSelectedNodeId = useSelectionStore(s => s.setSelectedNodeId);

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
    
    // Select the node
    setSelectedNodeId(id);
    
    const x = node.position.x + 150;
    const y = node.position.y + 80;
    window.dispatchEvent(new CustomEvent('canvas-jump-to-node', {
      detail: { x, y, zoom: 1.2, duration: 600, id: node.id }
    }));
  }, [nodes, setSelectedNodeId]);

  const handleExpandAll = () => setExpanded(new Set(nodes.map(n => n.id)));
  const handleCollapseAll = () => setExpanded(new Set());

  return (
    <div className={`relative h-full shrink-0 transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-0 border-l-0' : 'w-80 lg:w-96 border-l border-white/5'
    }`}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-4 -left-10 z-50 p-2 rounded-xl bg-white/[0.05] border border-white/[0.1] backdrop-blur-md text-muted-foreground hover:text-white hover:bg-white/[0.1] shadow-lg transition-all"
        title={isCollapsed ? 'Open sidebar' : 'Close sidebar'}
      >
        {isCollapsed ? <PanelRightOpen className="w-4 h-4" /> : <PanelRightClose className="w-4 h-4" />}
      </button>

      <div className={`flex flex-col h-full w-full overflow-hidden bg-black/20 transition-opacity duration-200 ${
        isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
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
                  {/* Search + controls */}
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
                        {nodes.length} Nodes
                      </span>
                      <div className="flex gap-1">
                        <button onClick={handleExpandAll} className="text-[10px] text-muted-foreground hover:text-white transition-colors">
                          Expand all
                        </button>
                        <span className="text-muted-foreground/40">·</span>
                        <button onClick={handleCollapseAll} className="text-[10px] text-muted-foreground hover:text-white transition-colors">
                          Collapse
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mind Map Tree */}
                  <ScrollArea className="flex-1 min-h-0" data-lenis-prevent="true">
                    <div className="px-2 pb-4 space-y-1">
                      {nodes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
                            <Network className="w-6 h-6 opacity-20" />
                          </div>
                          <p className="text-sm text-muted-foreground">Canvas is empty.</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">Generate or add nodes to see the hierarchy.</p>
                        </div>
                      ) : (
                        outlineTree.map((root, idx) => (
                          <RootMindMapNode
                            key={root.id}
                            node={root}
                            expanded={expanded}
                            onToggle={handleToggle}
                            onJump={handleJumpToNode}
                            searchQuery={outlineSearch}
                            selectedNodes={selectedNodeId ? [selectedNodeId] : []}
                            index={idx}
                          />
                        ))
                      )}
                    </div>
                  </ScrollArea>

                  {/* Legend */}
                  {nodes.length > 0 && <MindMapLegend />}
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
                    <div>
                      <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Canvas Details</h3>
                      <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02] space-y-2.5">
                        {[
                          { label: 'Name',        value: activeCanvas?.title || activeCanvas?.name || 'Official Roadmap' },
                          { label: 'Total Nodes', value: stats.totalNodes },
                          { label: 'Total Edges', value: stats.totalEdges },
                          { label: 'Branches',    value: stats.branchCount },
                          { label: 'Milestones',  value: stats.milestoneCount },
                          { label: 'Projects',    value: stats.projectCount },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-semibold text-white/90">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Learning Metrics</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'Est. Hours', value: `~${stats.totalHours}h`, icon: Clock  },
                          { label: 'Total XP',   value: `${stats.totalXP}`,      icon: Zap    },
                          { label: 'Earned XP',  value: `${stats.earnedXP}`,     icon: Zap    },
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
                    <div>
                      <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Progress</h3>
                      <div className="space-y-3">
                        <StatsBar label="Completed"   value={stats.completedNodes}  max={stats.totalNodes} color="bg-emerald-500" />
                        <StatsBar label="In Progress" value={stats.inProgressNodes} max={stats.totalNodes} color="bg-amber-500" />
                        <StatsBar label="Locked"      value={stats.lockedNodes}     max={stats.totalNodes} color="bg-slate-500" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Difficulty</h3>
                      <div className="space-y-3">
                        <StatsBar label="Beginner"     value={stats.difficultyBreakdown.beginner}     max={stats.totalNodes} color="bg-emerald-500" />
                        <StatsBar label="Intermediate" value={stats.difficultyBreakdown.intermediate} max={stats.totalNodes} color="bg-amber-500" />
                        <StatsBar label="Advanced"     value={stats.difficultyBreakdown.advanced}     max={stats.totalNodes} color="bg-rose-500" />
                      </div>
                    </div>
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

