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
import { useCanvasStore, useWorkspaceStore, useLayoutStore, useSelectionStore, LearningNodeType, EdgeSemanticType, LearningEdgeData } from '@/stores/learningUniverseStore';
import { LearningNode } from './LearningNode';
import { LearningEdge } from './LearningEdge';
import { CanvasToolbar } from './CanvasToolbar';
import { Inspector } from './Inspector';
import { generateLearningUniverseStream } from '@/lib/api/learningUniverseApi';
import useAutoLayout from './useAutoLayout';
import { ContextMenuOverlay } from './ContextMenuOverlay';
import { FloatingSelectionToolbar } from './FloatingSelectionToolbar';
import { EdgeTypeSelector } from './EdgeTypeSelector';
import { ConnectionLine } from './ConnectionLine';
import { CustomControls } from './CustomControls';
import { BlankCanvasEmptyState } from './BlankCanvasEmptyState';
import { ImmersiveGenerationOverlay } from './ImmersiveGenerationOverlay';
import { toast } from 'react-hot-toast';

const proOptions = { hideAttribution: true };
const deleteKeyCode = ['Backspace', 'Delete'];

const LearningCanvasInner = ({ mentorId, isOfficialRoadmap = false }: { mentorId: string; isOfficialRoadmap?: boolean }) => {
  // Memoize types inside the component to prevent HMR warnings
  const nodeTypes = useMemo(() => ({ learningNode: LearningNode }), []);
  const edgeTypes = useMemo(() => ({ semanticEdge: LearningEdge }), []);

  const { setCenter } = useReactFlow();
  const nodes = useCanvasStore(useShallow(s => s.nodes));
  const edges = useCanvasStore(useShallow(s => s.edges));
  const onNodesChange = useCanvasStore(s => s.onNodesChange);
  const onEdgesChange = useCanvasStore(s => s.onEdgesChange);
  const onConnect = useCanvasStore(s => s.onConnect);
  const addStreamedNodes = useCanvasStore(s => s.addStreamedNodes);
  const addStreamedEdges = useCanvasStore(s => s.addStreamedEdges);
  const setNodes = useCanvasStore(s => s.setNodes);
  const setEdges = useCanvasStore(s => s.setEdges);
  const layoutMode = useLayoutStore(s => s.layoutMode);
  const setSelectedNodeId = useSelectionStore(s => s.setSelectedNodeId);
  const onSelectionChange = useSelectionStore(s => s.onSelectionChange);
  const undo = useCanvasStore(s => s.undo);
  const redo = useCanvasStore(s => s.redo);
  const addNode = useCanvasStore(s => s.addNode);
  const removeNodes = useCanvasStore(s => s.removeNodes);
  const removeEdges = useCanvasStore(s => s.removeEdges);
  const selectedNodes = useSelectionStore(s => s.selectedNodes);
  const selectedEdges = useSelectionStore(s => s.selectedEdges);
  const setEditingEdgeId = useSelectionStore(s => s.setEditingEdgeId);


  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState("Preparing roadmap...");
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
  const isWorkspaceInitializing = useWorkspaceStore(s => s.isInitializing);
  const activeCanvasId = useWorkspaceStore(s => s.activeCanvasId);

  // Keep track of which canvases we've attempted to auto-generate for in this session
  const attemptedCanvasIdsRef = useRef<Set<string>>(new Set());

  // Auto-generate for the Official Roadmap canvas when it is empty
  useEffect(() => {
    // Wait until workspace has fully initialised (or given up)
    if (isWorkspaceInitializing || !activeCanvasId) return;
    
    // Only trigger once per canvas ID in a session — guards against double-fire
    if (attemptedCanvasIdsRef.current.has(activeCanvasId)) return;
    
    if (isOfficialRoadmap && nodes.length === 0 && !isGenerating) {
      attemptedCanvasIdsRef.current.add(activeCanvasId);
      handleGenerate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWorkspaceInitializing, isOfficialRoadmap, nodes.length, isGenerating, activeCanvasId]);

  // Listen for sidebar jump events
  useEffect(() => {
    const handleJump = (e: CustomEvent) => {
      const { x, y, zoom, duration, id } = e.detail;
      setCenter(x, y, { zoom, duration });
      if (id) {
        useSelectionStore.getState().setSelectedNodeId(id);
        useCanvasStore.getState().setNodes(
          useCanvasStore.getState().nodes.map(n => ({
            ...n,
            selected: n.id === id
          }))
        );
      }
    };
    window.addEventListener('canvas-jump-to-node', handleJump as EventListener);
    return () => window.removeEventListener('canvas-jump-to-node', handleJump as EventListener);
  }, [setCenter]);

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
    
    // Backup previous nodes in case of failure
    const prevNodes = [...useCanvasStore.getState().nodes];
    const prevEdges = [...useCanvasStore.getState().edges];
    
    useCanvasStore.getState().setAutosaveEnabled(false);
    setNodes([]); setEdges([]);
    
    const currentCanvasId = useWorkspaceStore.getState().activeCanvasId;
    
    await generateLearningUniverseStream({
      mentorId,
      canvasId: currentCanvasId || undefined,
      goal: "Generate a complete learning roadmap covering fundamental to advanced concepts for this topic.",
      onStatusUpdate: (status) => {
        setGenerationStatus(status);
        // Only toast if we want, but overlay handles the UI now. We can keep toast for background updates if closed.
      },
      onChunk: async (chunk) => {
        try {
          const parsed = JSON.parse(chunk);
          if (parsed.type === 'node') {
            const newNode = parsed.data;
            addStreamedNodes([newNode]);
          } else if (parsed.type === 'edge') {
            const newEdge = parsed.data;
            addStreamedEdges([newEdge]);
          }
        } catch (e) {
          console.error('Error processing chunk:', e, chunk);
        }
      },
      onError: (err) => {
        setIsGenerating(false);
        toast.error(`Generation failed: ${err}`, { id: 'roadmap-gen' });
        // Restore previous state and re-enable autosave
        setNodes(prevNodes);
        setEdges(prevEdges);
        useCanvasStore.getState().setAutosaveEnabled(true);
      },
      onDone: async () => {
        setIsGenerating(false);
        toast.success("Generation complete!", { id: 'roadmap-gen' });
        
        // Final layout pass
        const currentNodes = useCanvasStore.getState().nodes;
        const currentEdges = useCanvasStore.getState().edges;
        
        if (currentNodes.length > 0) {
          const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(currentNodes as any, currentEdges as any, layoutMode);
          
          setNodes(layoutedNodes as LearningNodeType[]);
          setEdges(layoutedEdges as any[]);
        } else {
          // If no nodes were generated, revert to previous state
          setNodes(prevNodes);
          setEdges(prevEdges);
        }
        
        // Re-enable autosave
        useCanvasStore.getState().setAutosaveEnabled(true);

        // Flush the generated content to the server in the background after a delay.
        // We delay 3s so the canvas rendering settles and the autosave debounce from
        // setNodes/setEdges doesn't stack up with this explicit save, creating a PATCH storm.
        // We do NOT await this — if the backend is slow, the local state is already correct.
        setTimeout(() => {
          useWorkspaceStore.getState().saveCanvasState().catch(saveErr => {
            console.warn('[LearningCanvas] Post-generation save failed:', saveErr);
          });
        }, 3000);
      }
    });
  };

  const handleNodeDoubleClick = React.useCallback((_: React.MouseEvent, node: any) => {
    useSelectionStore.getState().setInspectorNodeId(node.id);
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
    useCanvasStore.getState().addEdge(newEdge as any);
    setPendingConnection(null);
  };

  // Apply layout when layoutMode changes
  useEffect(() => {
    if (layoutMode === 'free') return;
    
    let isMounted = true;
    const applyLayout = async () => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(nodes as any, edges as any, layoutMode);
      if (isMounted) {
        setNodes(layoutedNodes as LearningNodeType[]);
        setEdges(layoutedEdges as any[]);
        setTimeout(() => {
          setCenter(0, 0, { zoom: 1, duration: 800 });
        }, 100);
      }
    };
    
    if (nodes.length > 0) {
      applyLayout();
    }
    
    return () => { isMounted = false; };
  }, [layoutMode, getLayoutedElements]); // intentionally excluding nodes/edges to prevent infinite loops on structural changes

  const isValidConnection = React.useCallback((connection: Connection | import('@xyflow/react').Edge) => {
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

  const handlePaneClick = React.useCallback((event: React.MouseEvent | MouseEvent) => {
    setSelectedNodeId(null);
    setEditingEdgeId(null);
  }, [setSelectedNodeId, setEditingEdgeId]);

  const handlePaneContextMenu = React.useCallback((event: React.MouseEvent | MouseEvent) => {
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

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    // Only intercept if we're dragging a file
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const handleDrop = React.useCallback(async (e: React.DragEvent) => {
    // Check if it's a file drop
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.luv') || file.name.endsWith('.json')) {
        e.preventDefault();
        e.stopPropagation();
        
        try {
          // Import engine dynamic load to avoid blocking render
          const { LuvExportEngine } = await import('@/lib/export/LuvExportEngine');
          const data = await LuvExportEngine.parseFile(file);
          setNodes(data.graph.nodes as any);
          setEdges(data.graph.edges as any);
          toast.success(`Imported canvas: ${data.metadata.canvasName}`);
        } catch (err: any) {
          toast.error(`Import failed: ${err.message}`);
        }
      }
    }
  }, [setNodes, setEdges]);

  return (
    <div 
      className="learning-universe-wrapper w-full h-full relative bg-transparent overflow-hidden outline-none" 
      tabIndex={0}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
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
        onNodeDragStart={() => useCanvasStore.getState().pushHistory()}
        onNodesDelete={() => useCanvasStore.getState().pushHistory()}
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
          <CanvasToolbar 
            onGenerate={nodes.length === 0 ? handleGenerate : undefined} 
            isGenerating={isGenerating} 
          />
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
      
      {/* Immersive Generation Overlay */}
      <ImmersiveGenerationOverlay isGenerating={isGenerating} status={generationStatus} />

      {/* Blank Canvas Empty State */}
      {!isOfficialRoadmap && nodes.length === 0 && !isGenerating && (
        <BlankCanvasEmptyState
          onGenerate={handleGenerate}
          onStartBuilding={() => {
            // Add a starter node in the center of the viewport
            const x = window.innerWidth / 2 - 140;
            const y = window.innerHeight / 2 - 75;
            addNode({
              id: `manual-node-${Date.now()}`,
              position: { x, y },
              type: 'learningNode',
              data: {
                title: 'My First Topic',
                type: 'topic',
                status: 'in-progress',
                difficulty: 'beginner',
                metadata: { source: 'user', createdBy: 'user', manual: true, createdAt: new Date().toISOString() }
              }
            });
            setCenter(x + 140, y + 75, { zoom: 1.2, duration: 600 });
          }}
          onImport={() => {
            import('@/lib/export/LuvExportEngine').then(({ LuvExportEngine }) => {
              LuvExportEngine.importFromFile().then((data) => {
                setNodes(data.graph.nodes as any);
                setEdges(data.graph.edges as any);
              }).catch((err) => {
                import('react-hot-toast').then(({ default: toast }) => toast.error(`Import failed: ${err.message}`));
              });
            });
          }}
          onTemplate={() => {
            import('@/lib/templates/learningTemplates').then(({ builtInTemplates }) => {
              const tpl = builtInTemplates[0]; // Load the first template (Interview Prep)
              setNodes(tpl.nodes as any);
              setEdges(tpl.edges as any);
              toast.success(`Loaded template: ${tpl.name}`);
            });
          }}
          isGenerating={isGenerating}
        />
      )}
    </div>
  );
};

export const LearningCanvas = ({ mentorId, isOfficialRoadmap = false }: { mentorId: string; isOfficialRoadmap?: boolean }) => {
  return (
    <ReactFlowProvider>
      <LearningCanvasInner mentorId={mentorId} isOfficialRoadmap={isOfficialRoadmap} />
    </ReactFlowProvider>
  );
};
