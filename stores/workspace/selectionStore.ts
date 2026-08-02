import { create } from 'zustand';
import { Edge, OnSelectionChangeFunc } from '@xyflow/react';
import { LearningNodeType, LearningEdgeData } from './types';

interface SelectionState {
  selectedNodeId: string | null;
  inspectorNodeId: string | null;
  selectedNodes: LearningNodeType[];
  selectedEdges: Edge<LearningEdgeData>[];
  editingEdgeId: string | null;
  
  onSelectionChange: OnSelectionChangeFunc;
  setSelectedNodeId: (id: string | null) => void;
  setInspectorNodeId: (id: string | null) => void;
  setEditingEdgeId: (id: string | null) => void;
  clearSelection: () => void;
}

export const useSelectionStore = create<SelectionState>()((set) => ({
  selectedNodeId: null,
  inspectorNodeId: null,
  selectedNodes: [],
  selectedEdges: [],
  editingEdgeId: null,
  
  onSelectionChange: ({ nodes, edges }) => set({ 
    selectedNodes: nodes as LearningNodeType[], 
    selectedEdges: edges as Edge<LearningEdgeData>[],
    selectedNodeId: nodes.length === 1 ? nodes[0].id : null
  }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setInspectorNodeId: (id) => set({ inspectorNodeId: id }),
  setEditingEdgeId: (id) => set({ editingEdgeId: id }),
  clearSelection: () => set({ selectedNodeId: null, inspectorNodeId: null, selectedNodes: [], selectedEdges: [], editingEdgeId: null })
}));
