"use client";

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  MiniMap,
  BackgroundVariant,
  Panel,
  useReactFlow,
  ConnectionMode,
  Connection
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useLearningUniverseStore, LearningNodeType, EdgeSemanticType, LearningEdgeData } from '@/stores/learningUniverseStore';
import { LearningNode } from './LearningNode';
import { LearningEdge } from './LearningEdge';
import { LearningToolbar } from './LearningToolbar';
import { Inspector } from './Inspector';
import { mockGenerateLearningUniverseStream } from '@/lib/api/mockLearningUniverseGenerator';
import useAutoLayout from './useAutoLayout';
import { ContextMenuOverlay } from './ContextMenuOverlay';
import { FloatingSelectionToolbar } from './FloatingSelectionToolbar';
import { EdgeTypeSelector } from './EdgeTypeSelector';
import { ConnectionLine } from './ConnectionLine';
import { CustomControls } from './CustomControls';
import { toast } from 'react-hot-toast';

// Custom Node Types mapping
const nodeTypes = {
  learningNode: LearningNode,
};

// Custom Edge Types mapping
const edgeTypes = {
  semanticEdge: LearningEdge,
};

const proOptions = { hideAttribution: true };
const deleteKeyCode = ['Backspace', 'Delete'];

const LearningCanvasInner = ({ mentorId }: { mentorId: string }) => {
  const { setCenter } = useReactFlow();
  const nodes = useLearningUniverseStore(useShallow(s => s.nodes));
  const edges = useLearningUniverseStore(useShallow(s => s.edges));
  const onNodesChange = useLearningUniverseStore(s => s.onNodesChange);
  const onEdgesChange = useLearningUniverseStore(s => s.onEdgesChange);
  const onConnect = useLearningUniverseStore(s => s.onConnect);
  const addStreamedNodes = useLearningUniverseStore(s => s.addStreamedNodes);
  const addStreamedEdges = useLearningUniverseStore(s => s.addStreamedEdges);
  const setNodes = useLearningUniverseStore(s => s.setNodes);
  const setEdges = useLearningUniverseStore(s => s.setEdges);
  const layoutMode = useLearningUniverseStore(s => s.layoutMode);
  const setSelectedNodeId = useLearningUniverseStore(s => s.setSelectedNodeId);
  const onSelectionChange = useLearningUniverseStore(s => s.onSelectionChange);
  const undo = useLearningUniverseStore(s => s.undo);
  const redo = useLearningUniverseStore(s => s.redo);
  const addNode = useLearningUniverseStore(s => s.addNode);
  const removeNodes = useLearningUniverseStore(s => s.removeNodes);
  const removeEdges = useLearningUniverseStore(s => s.removeEdges);
  const selectedNodes = useLearningUniverseStore(s => s.selectedNodes);
  const selectedEdges = useLearningUniverseStore(s => s.selectedEdges);
  const setEditingEdgeId = useLearningUniverseStore(s => s.setEditingEdgeId);

  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<{
    connection: Connection;
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    type: 'canvas' | 'node';
    nodeId?: string;
  } | null>(null);

  const { getLayoutedElements } = useAutoLayout();

  // Auto-init for Phase 13 First-Time Experience
  useEffect(() => {
    if (nodes.length === 0 && !isGenerating) {
      handleGenerate();
    }
  }, [nodes.length, isGenerating]);

  // Keyboard Shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      
      // Shortcuts: Ctrl+Z, Ctrl+Shift+Z, Ctrl+N, Ctrl+D, Esc
      if (e.key === 'Escape') {
        setSelectedNodeId(null);
        return;
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        // Create new node in center
        const x = window.innerWidth / 2 - 100;
        const y = window.innerHeight / 2 - 50;
        addNode({
          id: `manual-node-${Date.now()}`,
          position: { x, y },
          type: 'learningNode',
          data: {
            title: 'New Topic',
            type: 'topic',
            status: 'in-progress',
            difficulty: 'beginner',
            metadata: { source: 'user', createdBy: 'user', manual: true, createdAt: new Date().toISOString() }
          }
        });
        setCenter(x + 130, y + 60, { zoom: 1.2, duration: 800 });
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        selectedNodes.forEach(node => {
          addNode({
            ...node,
            id: `manual-node-${Date.now()}-${Math.random()}`,
            position: { x: node.position.x + 50, y: node.position.y + 50 },
            selected: false,
            data: { ...node.data, metadata: { ...node.data.metadata, source: 'user', manual: true } }
          });
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, addNode, selectedNodes, setSelectedNodeId]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setNodes([]); setEdges([]);
    
    await mockGenerateLearningUniverseStream({
      mentorId,
      goal: "I want to become an expert in this field", // In reality, this comes from a modal or input
      onStatusUpdate: (status) => {
        toast.loading(status, { id: 'roadmap-gen' });
      },
      onChunk: async (chunk) => {
        try {
          const parsed = JSON.parse(chunk);
          if (parsed.type === 'node') {
            const newNode = parsed.data;
            addStreamedNodes([newNode]);
            // Layout on the fly
            const currentNodes = useLearningUniverseStore.getState().nodes;
            const currentEdges = useLearningUniverseStore.getState().edges;
            const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(currentNodes, currentEdges, layoutMode);
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
          } else if (parsed.type === 'edge') {
            const newEdge = parsed.data;
            addStreamedEdges([newEdge]);
            // Layout on the fly
            const currentNodes = useLearningUniverseStore.getState().nodes;
            const currentEdges = useLearningUniverseStore.getState().edges;
            const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(currentNodes, currentEdges, layoutMode);
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
          }
        } catch (e) {
          // Ignore parse errors from partial chunks in a real stream
        }
      },
      onError: (err) => {
        setIsGenerating(false);
        toast.error(`Generation failed: ${err}`, { id: 'roadmap-gen' });
      },
      onDone: async () => {
        setIsGenerating(false);
        toast.success("Generation complete!", { id: 'roadmap-gen' });
        
        // Final layout pass
        const currentNodes = useLearningUniverseStore.getState().nodes;
        const currentEdges = useLearningUniverseStore.getState().edges;
        const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(currentNodes, currentEdges, layoutMode);
        
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      }
    });
  };

  const handleNodeDoubleClick = React.useCallback((_: React.MouseEvent, node: any) => {
    useLearningUniverseStore.getState().setInspectorNodeId(node.id);
  }, []);

  const handleNodeClick = React.useCallback((_: React.MouseEvent, node: any) => {
    // Only select, don't open inspector on single click
  }, []);

  const handleConnectEnd = React.useCallback(
    (event: MouseEvent | TouchEvent, connectionState: any) => {
      // If it's a valid connection (target exists), handle it in onConnect instead.
      // But we use onConnectEnd to capture the mouse coordinates for the modal.
    },
    []
  );

  const handleConnectLocal = React.useCallback((connection: Connection) => {
    // We get the mouse position by getting the center of the window as fallback,
    // but ideally we'd track global mouse or just show it center screen.
    // Let's just show it in the center for now, or track mouse.
    setPendingConnection({ 
      connection, 
      mouseX: window.innerWidth / 2, 
      mouseY: window.innerHeight / 2 
    });
  }, []);

  const confirmConnection = (semanticType: EdgeSemanticType) => {
    if (!pendingConnection) return;
    const newEdge = {
      ...pendingConnection.connection,
      id: `e-${pendingConnection.connection.source}-${pendingConnection.connection.target}-${Date.now()}`,
      type: 'semanticEdge',
      data: { semanticType, metadata: { source: 'user' } }
    };
    useLearningUniverseStore.getState().addEdge(newEdge as any);
    setPendingConnection(null);
  };

  const isValidConnection = React.useCallback((connection: Connection) => {
    // Check for duplicate edges
    const isDuplicate = edges.some(e => e.source === connection.source && e.target === connection.target);
    if (isDuplicate) return false;
    
    // Cycle detection using BFS
    const hasCycle = (startNode: string, endNode: string) => {
      const queue = [endNode];
      const visited = new Set<string>();
      
      while (queue.length > 0) {
        const current = queue.shift()!;
        if (current === startNode) return true; // Cycle found
        
        if (!visited.has(current)) {
          visited.add(current);
          const children = edges.filter(e => e.source === current).map(e => e.target);
          queue.push(...children);
        }
      }
      return false;
    };
    
    return !hasCycle(connection.source, connection.target);
  }, [edges]);

  const handlePaneClick = React.useCallback(() => {
    setSelectedNodeId(null);
    setEditingEdgeId(null);
  }, [setSelectedNodeId, setEditingEdgeId]);

  const handlePaneContextMenu = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({ mouseX: event.clientX, mouseY: event.clientY, type: 'canvas' });
  }, []);

  const handleNodeContextMenu = React.useCallback((event: React.MouseEvent, node: any) => {
    event.preventDefault();
    setContextMenu({ mouseX: event.clientX, mouseY: event.clientY, type: 'node', nodeId: node.id });
  }, []);

  const getNodeColor = React.useCallback((node: any) => {
    switch (node.data?.status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#f59e0b';
      case 'unlocked': return '#3b82f6';
      default: return '#334155';
    }
  }, []);

  return (
    <div className="learning-universe-wrapper w-full h-full relative bg-[#020617] overflow-hidden outline-none" tabIndex={0}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-900/10 via-transparent to-transparent pointer-events-none" />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnectLocal}
        isValidConnection={isValidConnection}
        connectionLineComponent={ConnectionLine}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        className="learning-universe-canvas"
        proOptions={proOptions}
        nodesConnectable={true}
        nodesDraggable={true}
        connectionRadius={50} // Make it easier to snap connections to handles
        connectionMode={ConnectionMode.Loose} // Allow ANY handle to connect to ANY handle
        multiSelectionKeyCode="Shift"
        selectionKeyCode="Shift"
        deleteKeyCode={deleteKeyCode}
        onSelectionChange={onSelectionChange}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onEdgeClick={(_, edge) => setEditingEdgeId(edge.id)}
        onPaneClick={handlePaneClick}
        onPaneContextMenu={handlePaneContextMenu}
        onNodeContextMenu={handleNodeContextMenu}
        // Premium Interaction Props
        panOnScroll={true}
        zoomOnScroll={false}
        panOnDrag={true} // Restored to allow left-click empty canvas dragging
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
        nodeDragThreshold={4}
        elevateNodesOnSelect={true}
        onlyRenderVisibleElements={true}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="#334155" // Restored visible dotted grid
        />
        
        {/* We place custom toolbars using the Panel component or absolute positioning */}
        <Panel position="top-center" className="w-full pointer-events-none mt-4">
          <LearningToolbar onGenerate={handleGenerate} isGenerating={isGenerating} />
        </Panel>

        <MiniMap
          className="!bg-[#0f172a]/90 !backdrop-blur-xl !border !border-white/10 !rounded-2xl !shadow-2xl overflow-hidden !m-6"
          maskColor="rgba(2, 6, 23, 0.7)"
          nodeColor={getNodeColor}
          pannable
          zoomable
        />

        <CustomControls />
        
        <style>{`
          .react-flow__pane {
            cursor: grab !important;
          }
          .react-flow__pane:active {
            cursor: grabbing !important;
          }
        `}</style>
      </ReactFlow>
      
      <AnimatePresence>
        {contextMenu && (
          <ContextMenuOverlay 
            {...contextMenu} 
            onClose={() => setContextMenu(null)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingConnection && (
          <EdgeTypeSelector 
            connection={pendingConnection.connection}
            mouseX={pendingConnection.mouseX}
            mouseY={pendingConnection.mouseY}
            onSelect={confirmConnection}
            onCancel={() => setPendingConnection(null)}
          />
        )}
      </AnimatePresence>

      <FloatingSelectionToolbar />

      {/* Inspector Panel */}
      <Inspector />
    </div>
  );
};

export const LearningCanvas = ({ mentorId }: { mentorId: string }) => {
  return (
    <ReactFlowProvider>
      <LearningCanvasInner mentorId={mentorId} />
    </ReactFlowProvider>
  );
};
