import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  OnSelectionChangeFunc,
  applyNodeChanges,
  applyEdgeChanges,
  Viewport,
} from '@xyflow/react';

export type NodeStatus = 'locked' | 'unlocked' | 'in-progress' | 'completed' | 'skipped';

export type NodeType = 
  | 'topic' | 'lesson' | 'concept' | 'quiz' | 'flashcards' 
  | 'practice' | 'project' | 'ai_challenge' | 'interview' 
  | 'revision' | 'milestone' | 'bookmark' | 'notes' 
  | 'resource' | 'certificate';

export type EdgeSemanticType = 
  | 'prerequisite' | 'unlock' | 'recommendation' | 'dependency' 
  | 'optional' | 'review_loop' | 'ai_suggested' | 'alternative_path' | 'related';

export interface NodeResource {
  id: string;
  title: string;
  url?: string;
  type: string;
  description?: string;
}

export interface NodeAIContent {
  summary?: string;
  explanation?: string;
  examples?: string[];
  code_snippets?: string[];
  memory_references?: string[];
}

export type LearningNodeData = {
  title: string;
  description?: string;
  type: NodeType;
  status: NodeStatus;
  progress?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  xp?: number;
  estimated_time?: number;
  tags?: string[];
  prerequisites?: string[];
  resources?: NodeResource[];
  ai_content?: NodeAIContent;
  metadata?: Record<string, any>;
};

export type LearningNodeType = Node<LearningNodeData>;

export type LearningEdgeData = {
  semanticType: EdgeSemanticType;
  label?: string;
  metadata?: Record<string, any>;
};

export type LayoutMode = 'free' | 'hierarchy' | 'mindmap' | 'timeline';
export type ThemeMode = 'cyber' | 'minimal' | 'education' | 'glass' | 'dark' | 'professional';

export interface GraphHistoryState {
  nodes: LearningNodeType[];
  edges: Edge<LearningEdgeData>[];
}

interface LearningUniverseState {
  // Graph Data
  nodes: LearningNodeType[];
  edges: Edge<LearningEdgeData>[];
  
  // Selection & UI State
  selectedNodeId: string | null;
  inspectorNodeId: string | null;
  selectedNodes: LearningNodeType[];
  selectedEdges: Edge<LearningEdgeData>[];
  layoutMode: LayoutMode;
  theme: ThemeMode;
  isSaving: boolean;
  viewport: Viewport;
  editingEdgeId: string | null;
  
  // History for Undo/Redo
  history: {
    past: GraphHistoryState[];
    future: GraphHistoryState[];
  };
  
  // React Flow handlers
  onNodesChange: OnNodesChange<LearningNodeType>;
  onEdgesChange: OnEdgesChange<Edge<LearningEdgeData>>;
  onConnect: OnConnect;
  onSelectionChange: OnSelectionChangeFunc;
  
  // Custom Actions
  setNodes: (nodes: LearningNodeType[]) => void;
  setEdges: (edges: Edge<LearningEdgeData>[]) => void;
  setViewport: (viewport: Viewport) => void;
  addStreamedNodes: (newNodes: LearningNodeType[]) => void;
  addStreamedEdges: (newEdges: Edge<LearningEdgeData>[]) => void;
  setSelectedNodeId: (id: string | null) => void;
  setInspectorNodeId: (id: string | null) => void;
  setEditingEdgeId: (id: string | null) => void;
  setLayoutMode: (mode: 'hierarchy' | 'force' | 'mindmap' | 'timeline' | 'free') => void;
  setTheme: (theme: ThemeMode) => void;
  saveCanvasState: () => Promise<void>;
  resetUniverse: () => void;

  // Manual Editing Actions
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  addNode: (node: LearningNodeType) => void;
  addEdge: (edge: Edge<LearningEdgeData>) => void;
  removeNodes: (nodeIds: string[]) => void;
  updateNodeData: (id: string, data: Partial<LearningNodeData>) => void;
  removeEdges: (edgeIds: string[]) => void;
  updateEdge: (id: string, data: Partial<LearningEdgeData>) => void;
}

const calculateHierarchy = (nodes: LearningNodeType[], edges: Edge<LearningEdgeData>[]): LearningNodeType[] => {
  const adj: Record<string, string[]> = {};
  const inDegree: Record<string, number> = {};
  
  nodes.forEach(n => {
    adj[n.id] = [];
    inDegree[n.id] = 0;
  });
  
  edges.forEach(e => {
    if (adj[e.source]) adj[e.source].push(e.target);
    if (inDegree[e.target] !== undefined) inDegree[e.target]++;
  });
  
  const roots = nodes.filter(n => inDegree[n.id] === 0);
  roots.sort((a, b) => (a.position.y - b.position.y) || (a.position.x - b.position.x));
  
  const hierarchyMap: Record<string, string> = {};
  
  let standardCounter = 1;
  let projectCounter = 1;
  let challengeCounter = 1;
  let optionalCounter = 1;

  const getPrefix = (node: LearningNodeType) => {
    if (node.data.status === 'optional' || node.data.metadata?.optional) return `O${optionalCounter++}`;
    if (node.data.type === 'project') return `P${projectCounter++}`;
    if (node.data.type === 'ai_challenge') return `C${challengeCounter++}`;
    return String(standardCounter++).padStart(2, '0');
  };
  
  roots.forEach(r => {
    hierarchyMap[r.id] = getPrefix(r);
  });
  
  const queue = [...roots];
  const visited = new Set<string>();
  
  while(queue.length > 0) {
    const curr = queue.shift()!;
    if (visited.has(curr.id)) continue;
    visited.add(curr.id);
    
    const children = adj[curr.id] || [];
    const childNodes = children.map(cid => nodes.find(n => n.id === cid)).filter(Boolean) as LearningNodeType[];
    childNodes.sort((a, b) => (a.position.y - b.position.y) || (a.position.x - b.position.x));
    
    let childIndex = 1;
    for (const child of childNodes) {
      if (!hierarchyMap[child.id]) {
        if (child.data.type === 'project') hierarchyMap[child.id] = `P${projectCounter++}`;
        else if (child.data.type === 'ai_challenge') hierarchyMap[child.id] = `C${challengeCounter++}`;
        else if (child.data.status === 'optional' || child.data.metadata?.optional) hierarchyMap[child.id] = `O${optionalCounter++}`;
        else hierarchyMap[child.id] = `${hierarchyMap[curr.id]}.${childIndex++}`;
        
        queue.push(child);
      }
    }
  }
  
  for (const n of nodes) {
    if (!hierarchyMap[n.id]) {
      hierarchyMap[n.id] = getPrefix(n);
    }
  }
  
  return nodes.map(n => ({
    ...n,
    data: {
      ...n.data,
      metadata: {
        ...n.data.metadata,
        hierarchyIndex: hierarchyMap[n.id]
      }
    }
  }));
};

export const useLearningUniverseStore = create<LearningUniverseState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      inspectorNodeId: null,
      selectedNodes: [],
      selectedEdges: [],
      layoutMode: 'hierarchy',
      theme: 'cyber',
      isSaving: false,
      viewport: { x: 0, y: 0, zoom: 1 },
      history: { past: [], future: [] },
      editingEdgeId: null,

      onNodesChange: (changes: NodeChange<LearningNodeType>[]) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes),
        });
      },
      onEdgesChange: (changes: EdgeChange[]) => {
        set({
          edges: applyEdgeChanges(changes, get().edges) as Edge<LearningEdgeData>[],
        });
      },
      onConnect: (connection: Connection) => {
        get().pushHistory();
        const newEdge: Edge<LearningEdgeData> = {
          ...connection,
          id: `e-${connection.source}-${connection.target}-${Date.now()}`,
          type: 'semanticEdge',
          data: { semanticType: 'dependency', metadata: { source: 'user', createdBy: 'user', manual: true, createdAt: new Date().toISOString() } }
        };
        const updatedEdges = addEdge(newEdge, get().edges);
        set({
          edges: updatedEdges,
          nodes: calculateHierarchy(get().nodes, updatedEdges as Edge<LearningEdgeData>[])
        });
      },
      onSelectionChange: ({ nodes, edges }) => {
        set({ 
          selectedNodes: nodes as LearningNodeType[], 
          selectedEdges: edges as Edge<LearningEdgeData>[],
          selectedNodeId: nodes.length === 1 ? nodes[0].id : null
        });
      },
      
      setNodes: (nodes) => set({ nodes: calculateHierarchy(nodes, get().edges) }),
      setEdges: (edges) => set({ edges, nodes: calculateHierarchy(get().nodes, edges) }),
      setViewport: (viewport) => set({ viewport }),
      addStreamedNodes: (newNodes: LearningNodeType[]) => set((state) => {
        const combined = [...state.nodes, ...newNodes.filter(n => !state.nodes.some(existing => existing.id === n.id))];
        return { nodes: calculateHierarchy(combined, state.edges) };
      }),
      addStreamedEdges: (newEdges: Edge<LearningEdgeData>[]) => set((state) => {
        const combined = [...state.edges, ...newEdges.filter(e => !state.edges.some(existing => existing.id === e.id))];
        return { edges: combined, nodes: calculateHierarchy(state.nodes, combined) };
      }),
      setSelectedNodeId: (id) => set({ selectedNodeId: id }),
      setInspectorNodeId: (id) => set({ inspectorNodeId: id }),
      setEditingEdgeId: (id) => set({ editingEdgeId: id }),
      setLayoutMode: (mode) => set({ layoutMode: mode }),
      setTheme: (theme) => set({ theme }),
      
      saveCanvasState: async () => {
        set({ isSaving: true });
        // TODO: Connect to backend Supabase API to save node positions and layouts
        await new Promise(resolve => setTimeout(resolve, 500));
        set({ isSaving: false });
      },
      
      resetUniverse: () => set({ nodes: [], edges: [], selectedNodeId: null, selectedNodes: [], selectedEdges: [], history: { past: [], future: [] }, viewport: { x: 0, y: 0, zoom: 1 } }),

      // Manual Editing Actions
      pushHistory: () => {
        const state = get();
        // Keep max 50 history steps
        const newPast = [...state.history.past, { nodes: state.nodes, edges: state.edges }].slice(-50);
        set({ history: { past: newPast, future: [] } });
      },
      
      undo: () => {
        const state = get();
        if (state.history.past.length === 0) return;
        const previous = state.history.past[state.history.past.length - 1];
        const newPast = state.history.past.slice(0, -1);
        const newFuture = [{ nodes: state.nodes, edges: state.edges }, ...state.history.future];
        set({ nodes: previous.nodes, edges: previous.edges, history: { past: newPast, future: newFuture } });
      },
      
      redo: () => {
        const state = get();
        if (state.history.future.length === 0) return;
        const next = state.history.future[0];
        const newFuture = state.history.future.slice(1);
        const newPast = [...state.history.past, { nodes: state.nodes, edges: state.edges }];
        set({ nodes: next.nodes, edges: next.edges, history: { past: newPast, future: newFuture } });
      },

      addNode: (node) => {
        get().pushHistory();
        set(state => ({ nodes: calculateHierarchy([...state.nodes, node], state.edges) }));
      },

      addEdge: (edge) => {
        get().pushHistory();
        const updatedEdges = [...get().edges, edge];
        set({ edges: updatedEdges, nodes: calculateHierarchy(get().nodes, updatedEdges) });
      },
      
      removeNodes: (nodeIds) => {
        get().pushHistory();
        const newNodes = get().nodes.filter(n => !nodeIds.includes(n.id));
        const newEdges = get().edges.filter(e => !nodeIds.includes(e.source) && !nodeIds.includes(e.target));
        set({ 
          nodes: calculateHierarchy(newNodes, newEdges), 
          edges: newEdges,
          selectedNodeId: get().selectedNodeId && nodeIds.includes(get().selectedNodeId!) ? null : get().selectedNodeId
        });
      },
      
      updateNodeData: (id, data) => {
        get().pushHistory();
        set(state => ({
          nodes: state.nodes.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n)
        }));
      },
      
      removeEdges: (edgeIds) => {
        get().pushHistory();
        const updatedEdges = get().edges.filter(e => !edgeIds.includes(e.id));
        set({ edges: updatedEdges, nodes: calculateHierarchy(get().nodes, updatedEdges) });
      },
      
      updateEdge: (id, data) => {
        get().pushHistory();
        set(state => ({
          edges: state.edges.map(e => e.id === id ? { ...e, data: { ...e.data, ...data } } : e)
        }));
      },
    }),
    {
      name: 'learning-universe-storage', // Key in local storage
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        layoutMode: state.layoutMode,
        theme: state.theme,
        viewport: state.viewport,
      }), // only persist these fields
    }
  )
);
