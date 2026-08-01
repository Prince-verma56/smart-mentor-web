import { create } from 'zustand';
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
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';

export type NodeStatus = 'locked' | 'unlocked' | 'in-progress' | 'completed' | 'skipped';

export type NodeType = 
  | 'topic' | 'lesson' | 'concept' | 'quiz' | 'flashcards' 
  | 'practice' | 'project' | 'ai_challenge' | 'interview' 
  | 'revision' | 'milestone' | 'bookmark' | 'notes' 
  | 'resource' | 'certificate';

export type EdgeSemanticType = 
  | 'prerequisite' | 'unlock' | 'recommendation' | 'dependency' 
  | 'optional' | 'review_loop' | 'ai_suggested' | 'alternative_path';

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

interface LearningUniverseState {
  // Graph Data
  nodes: LearningNodeType[];
  edges: Edge<LearningEdgeData>[];
  
  // Selection & UI State
  selectedNodeId: string | null;
  layoutMode: LayoutMode;
  theme: ThemeMode;
  isSaving: boolean;
  
  // React Flow handlers
  onNodesChange: OnNodesChange<LearningNodeType>;
  onEdgesChange: OnEdgesChange<Edge<LearningEdgeData>>;
  onConnect: OnConnect;
  
  // Custom Actions
  setNodes: (nodes: LearningNodeType[]) => void;
  setEdges: (edges: Edge<LearningEdgeData>[]) => void;
  setSelectedNodeId: (id: string | null) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setTheme: (theme: ThemeMode) => void;
  saveCanvasState: () => Promise<void>;
  resetUniverse: () => void;
}

const initialNodes: LearningNodeType[] = [
  {
    id: 'root',
    position: { x: 0, y: 0 },
    data: {
      title: 'Foundation',
      description: 'Start your journey here',
      type: 'milestone',
      status: 'completed',
      progress: 100,
    },
    type: 'learningNode',
  },
  {
    id: 'frontend',
    position: { x: 0, y: 150 },
    data: {
      title: 'Frontend Basics',
      description: 'HTML, CSS, JS',
      type: 'topic',
      status: 'in-progress',
      progress: 60,
    },
    type: 'learningNode',
  },
  {
    id: 'backend',
    position: { x: 250, y: 150 },
    data: {
      title: 'Backend Basics',
      description: 'Servers, DBs',
      type: 'topic',
      status: 'unlocked',
      progress: 0,
    },
    type: 'learningNode',
  },
  {
    id: 'ai',
    position: { x: 125, y: 300 },
    data: {
      title: 'AI Integration',
      description: 'LLMs, Vectors',
      type: 'ai_challenge',
      status: 'locked',
      progress: 0,
    },
    type: 'learningNode',
  },
];

const initialEdges: Edge<LearningEdgeData>[] = [
  { id: 'e1-2', source: 'root', target: 'frontend', type: 'semanticEdge', animated: true, data: { semanticType: 'prerequisite' } },
  { id: 'e1-3', source: 'root', target: 'backend', type: 'semanticEdge', data: { semanticType: 'prerequisite' } },
  { id: 'e2-4', source: 'frontend', target: 'ai', type: 'semanticEdge', data: { semanticType: 'unlock' } },
  { id: 'e3-4', source: 'backend', target: 'ai', type: 'semanticEdge', data: { semanticType: 'recommendation' } },
];

export const useLearningUniverseStore = create<LearningUniverseState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNodeId: null,
  layoutMode: 'free',
  theme: 'dark',
  isSaving: false,

  onNodesChange: (changes: NodeChange<LearningNodeType>[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
    // Trigger auto-save debounce here in real implementation
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges) as Edge<LearningEdgeData>[],
    });
  },
  onConnect: (connection: Connection) => {
    const newEdge: Edge<LearningEdgeData> = {
      ...connection,
      id: `e-${connection.source}-${connection.target}`,
      type: 'semanticEdge',
      data: { semanticType: 'dependency' }
    };
    set({
      edges: addEdge(newEdge, get().edges),
    });
  },
  
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setLayoutMode: (mode) => set({ layoutMode: mode }),
  setTheme: (theme) => set({ theme }),
  
  saveCanvasState: async () => {
    set({ isSaving: true });
    // TODO: Connect to backend Supabase API to save node positions and layouts
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ isSaving: false });
  },
  
  resetUniverse: () => set({ nodes: initialNodes, edges: initialEdges, selectedNodeId: null }),
}));
