"use client";

import React, { useMemo, useState, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useLearningUniverseStore, LearningNodeType, EdgeSemanticType, LearningEdgeData } from '@/stores/learningUniverseStore';
import { LearningNode } from './LearningNode';
import { LearningEdge } from './LearningEdge';
import { LearningToolbar } from './LearningToolbar';
import { Inspector } from './Inspector';
import { generateLearningUniverseStream } from '@/lib/api/learningUniverseApi';
import useAutoLayout from './useAutoLayout';
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
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addStreamedNodes,
    addStreamedEdges,
    setNodes,
    setEdges,
    layoutMode
  } = useLearningUniverseStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const { getLayoutedElements } = useAutoLayout();
  const bufferRef = useRef('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Optional: Reset canvas before generation
    // setNodes([]); setEdges([]);
    
    await generateLearningUniverseStream({
      mentorId,
      goal: "I want to become an expert in this field", // In reality, this comes from a modal or input
      onStatusUpdate: (status) => {
        toast.loading(status, { id: 'roadmap-gen' });
      },
      onChunk: (chunk) => {
        bufferRef.current += chunk;
        try {
          // Attempt to parse the buffer as a JSON array of nodes/edges if possible.
          // Since it's streaming, we might get partial JSON. A more robust parser is needed for partial JSON,
          // but for now, we'll try to find complete objects if the backend sends them line by line or chunk by chunk.
          // Alternatively, we wait for 'done' to do a full parse, or use a streaming JSON parser.
          // For the sake of this phase, let's assume the LLM output is being accumulated.
        } catch (e) {
          // Wait for more chunks
        }
      },
      onError: (err) => {
        setIsGenerating(false);
        toast.error(`Generation failed: ${err}`, { id: 'roadmap-gen' });
      },
      onDone: async () => {
        setIsGenerating(false);
        toast.success("Generation complete!", { id: 'roadmap-gen' });
        
        try {
          const rawText = bufferRef.current;
          // Extract JSON from markdown code blocks if the LLM wrapped it
          const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/) || rawText.match(/```\n([\s\S]*?)\n```/);
          const cleanJson = jsonMatch ? jsonMatch[1] : rawText;
          
          const data = JSON.parse(cleanJson);
          
          let parsedNodes: LearningNodeType[] = [];
          if (data.nodes && Array.isArray(data.nodes)) {
            parsedNodes = data.nodes.map((n: any, i: number) => ({
              id: n.id,
              type: 'learningNode',
              position: { x: Math.random() * 500, y: Math.random() * 500 }, // Initial random, ELK will fix
              data: {
                title: n.title,
                description: n.description,
                type: n.type || 'topic',
                status: n.status || 'locked',
                difficulty: n.difficulty,
                xp: n.xp,
                estimated_time: n.estimated_time,
                tags: n.tags,
                prerequisites: n.prerequisites,
                ai_content: n.ai_content
              }
            }));
            addStreamedNodes(parsedNodes);
          }
          
          let parsedEdges: any[] = [];
          if (data.edges && Array.isArray(data.edges)) {
            parsedEdges = data.edges.map((e: any) => ({
              id: e.id,
              source: e.source,
              target: e.target,
              type: 'semanticEdge',
              animated: e.animated,
              data: {
                semanticType: e.type as EdgeSemanticType,
                label: e.data?.label
              }
            }));
            addStreamedEdges(parsedEdges);
          }
          
          // Run auto-layout after nodes and edges are populated
          const currentNodes = useLearningUniverseStore.getState().nodes;
          const currentEdges = useLearningUniverseStore.getState().edges;
          const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(currentNodes, currentEdges, layoutMode);
          
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
          bufferRef.current = ''; // clear buffer
        } catch (e) {
          console.error("Failed to parse full roadmap JSON", e);
          toast.error("Failed to parse roadmap data.");
        }
      }
    });
  };

  const handleSelectionChange = React.useCallback(({ nodes: selectedNodes }: { nodes: any[] }) => {
    if (selectedNodes.length === 1) {
      useLearningUniverseStore.getState().setSelectedNodeId(selectedNodes[0].id);
    } else if (selectedNodes.length === 0) {
      useLearningUniverseStore.getState().setSelectedNodeId(null);
    }
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
    <div className="w-full h-full relative bg-[#020617]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        className="learning-universe-canvas"
        proOptions={proOptions}
        nodesConnectable={true}
        nodesDraggable={true}
        multiSelectionKeyCode="Shift"
        selectionKeyCode="Shift"
        deleteKeyCode={deleteKeyCode}
        onSelectionChange={handleSelectionChange}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="#334155" // slate-700 for dark mode grid
        />
        
        {/* We place custom toolbars using the Panel component or absolute positioning */}
        <Panel position="top-center" className="w-full pointer-events-none mt-4">
          <LearningToolbar onGenerate={handleGenerate} isGenerating={isGenerating} />
        </Panel>

        <MiniMap
          className="!bg-background/80 !backdrop-blur-md !border-white/10 !rounded-xl !shadow-2xl overflow-hidden"
          maskColor="rgba(0,0,0,0.7)"
          nodeColor={getNodeColor}
        />

        {/* Existing React Flow Controls (Bottom Left by default) - Overridden by our custom styling if needed */}
        <Controls 
          className="!bg-background/80 !backdrop-blur-md !border-white/10 !rounded-xl !shadow-xl !overflow-hidden fill-foreground"
          showInteractive={false}
        />
      </ReactFlow>
      
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
