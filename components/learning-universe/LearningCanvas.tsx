import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useLearningUniverseStore } from '@/stores/learningUniverseStore';
import { LearningNode } from './LearningNode';
import { LearningEdge } from './LearningEdge';
import { LearningToolbar } from './LearningToolbar';
import { Inspector } from './Inspector';

// Custom Node Types mapping
const nodeTypes = {
  learningNode: LearningNode,
};

// Custom Edge Types mapping
const edgeTypes = {
  semanticEdge: LearningEdge,
};

export const LearningCanvas = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useLearningUniverseStore();

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
        proOptions={{ hideAttribution: true }}
        nodesConnectable={true}
        nodesDraggable={true}
        multiSelectionKeyCode="Shift"
        selectionKeyCode="Shift"
        deleteKeyCode={['Backspace', 'Delete']}
        onSelectionChange={({ nodes }) => {
          if (nodes.length === 1) {
            useLearningUniverseStore.getState().setSelectedNodeId(nodes[0].id);
          } else if (nodes.length === 0) {
            useLearningUniverseStore.getState().setSelectedNodeId(null);
          }
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="#334155" // slate-700 for dark mode grid
        />
        
        {/* We place custom toolbars using the Panel component or absolute positioning */}
        <Panel position="top-center" className="w-full pointer-events-none mt-4">
          <LearningToolbar />
        </Panel>

        <MiniMap
          className="!bg-background/80 !backdrop-blur-md !border-white/10 !rounded-xl !shadow-2xl overflow-hidden"
          maskColor="rgba(0,0,0,0.7)"
          nodeColor={(node) => {
            switch (node.data?.status) {
              case 'completed': return '#10b981';
              case 'in-progress': return '#f59e0b';
              case 'unlocked': return '#3b82f6';
              default: return '#334155';
            }
          }}
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
