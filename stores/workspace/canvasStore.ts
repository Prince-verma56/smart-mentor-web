import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Edge, Connection, NodeChange, EdgeChange, applyNodeChanges, applyEdgeChanges, addEdge, Viewport } from '@xyflow/react';
import { LearningNodeType, LearningEdgeData, LearningNodeData, calculateHierarchy, GraphHistoryState } from './types';

// Simple debounce function
function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function(this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  } as T;
}

let isDirty = false;
let isSaving = false;
let consecutiveFailures = 0;
const MAX_FAILURES = 3; // Circuit-breaker: stop autosave after 3 consecutive failures

// Robust Debounced saver that queues dirty state
const processSaveQueue = async () => {
  const store = require('./workspaceStore').useWorkspaceStore;
  const canvasStore = useCanvasStore.getState();
  
  if (!isDirty || isSaving || !canvasStore?.autosaveEnabled) return;
  // Circuit-breaker: stop hammering a broken backend
  if (consecutiveFailures >= MAX_FAILURES) return;
  
  isSaving = true;
  try {
    const wsStore = require('./workspaceStore').useWorkspaceStore;
    if (wsStore) {
      // Clear dirty flag immediately so any concurrent edits set it to true again
      isDirty = false;
      await wsStore.getState().saveCanvasState();
      consecutiveFailures = 0; // Reset on success
    }
  } catch (e) {
    // If saving fails, mark dirty again to retry
    isDirty = true;
    consecutiveFailures++;
    console.error(`Save pipeline error (failure #${consecutiveFailures}):`, e);
    if (consecutiveFailures >= MAX_FAILURES) {
      console.warn('[canvasStore] Autosave circuit-breaker opened: backend appears unavailable. Saves paused.');
    }
  } finally {
    isSaving = false;
    // If more changes happened during save, and circuit is not open, process again
    if (isDirty && consecutiveFailures < MAX_FAILURES) {
      setTimeout(processSaveQueue, 5000); // Longer backoff on retry
    }
  }
};

const triggerAutosave = debounce(() => {
  const store = useCanvasStore.getState();
  if (store && store.autosaveEnabled === false) return;
  // Reset circuit-breaker on user interaction (manual edit = backend might be back up)
  if (consecutiveFailures >= MAX_FAILURES) {
    consecutiveFailures = 0;
  }
  isDirty = true;
  processSaveQueue();
}, 5000); // Increased to 5s debounce to reduce PATCH storm frequency

interface CanvasState {
  nodes: LearningNodeType[];
  edges: Edge<LearningEdgeData>[];
  viewport: Viewport;
  history: { past: GraphHistoryState[]; future: GraphHistoryState[] };
  autosaveEnabled: boolean;
  
  onNodesChange: (changes: NodeChange<LearningNodeType>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  
  setNodes: (nodes: LearningNodeType[]) => void;
  setEdges: (edges: Edge<LearningEdgeData>[]) => void;
  setViewport: (viewport: Viewport) => void;
  setAutosaveEnabled: (enabled: boolean) => void;
  
  addStreamedNodes: (newNodes: LearningNodeType[]) => void;
  addStreamedEdges: (newEdges: Edge<LearningEdgeData>[]) => void;
  
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  
  addNode: (node: LearningNodeType) => void;
  addEdge: (edge: Edge<LearningEdgeData>) => void;
  removeNodes: (nodeIds: string[]) => void;
  updateNodeData: (id: string, data: Partial<LearningNodeData>) => void;
  removeEdges: (edgeIds: string[]) => void;
  updateEdge: (id: string, data: Partial<LearningEdgeData>) => void;
  resetUniverse: () => void;
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      history: { past: [], future: [] },
      autosaveEnabled: true,

      pushHistory: () => {
        const state = get();
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

      onNodesChange: (changes: NodeChange<LearningNodeType>[]) => {
        set({ nodes: applyNodeChanges(changes, get().nodes) });
        // Only trigger autosave for actual modifications, not selections/dimensions
        const isSignificant = changes.some(c => c.type === 'position' || c.type === 'remove' || c.type === 'add');
        if (isSignificant) triggerAutosave();
      },
      
      onEdgesChange: (changes: EdgeChange[]) => {
        set({ edges: applyEdgeChanges(changes, get().edges) as Edge<LearningEdgeData>[] });
        triggerAutosave();
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

      setNodes: (nodes) => { set({ nodes: calculateHierarchy(nodes, get().edges) }); triggerAutosave(); },
      setEdges: (edges) => { set({ edges, nodes: calculateHierarchy(get().nodes, edges) }); triggerAutosave(); },
      setViewport: (viewport) => { set({ viewport }); },
      setAutosaveEnabled: (enabled) => set({ autosaveEnabled: enabled }),
      
      addStreamedNodes: (newNodes: LearningNodeType[]) => set((state) => {
        const combined = [...state.nodes];
        newNodes.forEach(newNode => {
          const existingIndex = combined.findIndex(n => n.id === newNode.id);
          if (existingIndex >= 0) {
            // Merge AI generated fields with existing node state
            combined[existingIndex] = {
              ...combined[existingIndex],
              ...newNode,
              data: {
                ...combined[existingIndex].data,
                ...newNode.data,
                // Ensure critical properties from existing state aren't wiped
                status: combined[existingIndex].data.status || newNode.data.status,
                progress: combined[existingIndex].data.progress || newNode.data.progress,
                xp: combined[existingIndex].data.xp || newNode.data.xp,
              }
            };
          } else {
            combined.push(newNode);
          }
        });
        triggerAutosave();
        return { nodes: calculateHierarchy(combined, state.edges) };
      }),
      
      addStreamedEdges: (newEdges: Edge<LearningEdgeData>[]) => set((state) => {
        const combined = [...state.edges];
        newEdges.forEach(newEdge => {
          const existingIndex = combined.findIndex(e => e.id === newEdge.id);
          if (existingIndex >= 0) {
            combined[existingIndex] = {
              ...combined[existingIndex],
              ...newEdge,
              data: {
                ...combined[existingIndex].data,
                ...newEdge.data
              }
            };
          } else {
            combined.push(newEdge);
          }
        });
        triggerAutosave();
        return { edges: combined, nodes: calculateHierarchy(state.nodes, combined) };
      }),
      
      addNode: (node) => {
        get().pushHistory();
        set(state => ({ nodes: calculateHierarchy([...state.nodes, node], state.edges) }));
        triggerAutosave();
      },

      addEdge: (edge) => {
        get().pushHistory();
        const updatedEdges = [...get().edges, edge];
        set({ edges: updatedEdges, nodes: calculateHierarchy(get().nodes, updatedEdges) });
        triggerAutosave();
      },
      
      removeNodes: (nodeIds) => {
        get().pushHistory();
        const newNodes = get().nodes.filter(n => !nodeIds.includes(n.id));
        const newEdges = get().edges.filter(e => !nodeIds.includes(e.source) && !nodeIds.includes(e.target));
        set({ nodes: calculateHierarchy(newNodes, newEdges), edges: newEdges });
        triggerAutosave();
      },
      
      updateNodeData: (id, data) => {
        get().pushHistory();
        set(state => ({
          nodes: state.nodes.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n)
        }));
        triggerAutosave();
      },
      
      removeEdges: (edgeIds) => {
        get().pushHistory();
        const updatedEdges = get().edges.filter(e => !edgeIds.includes(e.id));
        set({ edges: updatedEdges, nodes: calculateHierarchy(get().nodes, updatedEdges) });
        triggerAutosave();
      },
      
      updateEdge: (id, data) => {
        get().pushHistory();
        set(state => ({
          edges: state.edges.map(e => e.id === id ? { ...e, data: { ...e.data, ...data } as LearningEdgeData } : e)
        }));
        triggerAutosave();
      },
      
      resetUniverse: () => { set({ nodes: [], edges: [], history: { past: [], future: [] }, viewport: { x: 0, y: 0, zoom: 1 } }); triggerAutosave(); }
    }),
    {
      name: 'canvas-storage',
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        viewport: state.viewport,
      })
    }
  )
);
