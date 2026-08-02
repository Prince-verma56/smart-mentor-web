import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Connection,
  Edge,
  EdgeChange,
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

// Re-export types from our separated types file
export * from './workspace/types';

// Export all the modular slices
export { useWorkspaceStore } from './workspace/workspaceStore';
export { useCanvasStore } from './workspace/canvasStore';
export { useSelectionStore } from './workspace/selectionStore';
export { useLayoutStore } from './workspace/layoutStore';
export { useInspectorStore } from './workspace/inspectorStore';
export { useSidebarStore } from './workspace/sidebarStore';
export { useToolbarStore } from './workspace/toolbarStore';
