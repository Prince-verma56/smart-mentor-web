"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Copy, Maximize, Target } from 'lucide-react';
import { useCanvasStore, useSelectionStore } from '@/stores/learningUniverseStore';
import { useReactFlow } from '@xyflow/react';

interface ContextMenuProps {
  mouseX: number;
  mouseY: number;
  type: 'canvas' | 'node';
  nodeId?: string;
  onClose: () => void;
}

export const ContextMenuOverlay = ({ mouseX, mouseY, type, nodeId, onClose }: ContextMenuProps) => {
  const addNode = useCanvasStore(s => s.addNode);
  const removeNodes = useCanvasStore(s => s.removeNodes);
  const nodes = useCanvasStore(s => s.nodes);
  const setSelectedNodeId = useSelectionStore(s => s.setSelectedNodeId);
  const { screenToFlowPosition, fitView } = useReactFlow();

  const handleCreateNode = () => {
    const position = screenToFlowPosition({ x: mouseX, y: mouseY });
    addNode({
      id: `manual-node-${Date.now()}`,
      position,
      type: 'learningNode',
      data: {
        title: 'New Topic',
        description: 'Double click or use inspector to edit',
        type: 'topic',
        status: 'in-progress',
        difficulty: 'beginner',
        metadata: { source: 'user' }
      }
    });
    onClose();
  };

  const handleDeleteNode = () => {
    if (nodeId) removeNodes([nodeId]);
    onClose();
  };

  const handleDuplicateNode = () => {
    if (!nodeId) return;
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    addNode({
      ...node,
      id: `manual-node-${Date.now()}`,
      position: { x: node.position.x + 50, y: node.position.y + 50 },
      selected: false,
      data: { ...node.data, metadata: { source: 'user' } }
    });
    onClose();
  };

  const handleEditNode = () => {
    if (nodeId) setSelectedNodeId(nodeId);
    onClose();
  };

  const handleFitView = () => {
    fitView({ duration: 800 });
    onClose();
  };

  return (
    <>
      {/* Invisible backdrop to catch clicks */}
      <div className="fixed inset-0 z-[100]" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        style={{ left: mouseX, top: mouseY }}
        className="fixed z-[101] flex flex-col w-48 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1 overflow-hidden"
      >
        {type === 'canvas' ? (
          <>
            <MenuItem icon={<Plus className="w-4 h-4" />} label="Create Node" onClick={handleCreateNode} />
            <div className="h-px w-full bg-white/10 my-1" />
            <MenuItem icon={<Maximize className="w-4 h-4" />} label="Center View" onClick={handleFitView} />
          </>
        ) : (
          <>
            <MenuItem icon={<Target className="w-4 h-4" />} label="Edit Node" onClick={handleEditNode} />
            <MenuItem icon={<Copy className="w-4 h-4" />} label="Duplicate" onClick={handleDuplicateNode} />
            <div className="h-px w-full bg-white/10 my-1" />
            <MenuItem icon={<Trash2 className="w-4 h-4" />} label="Delete" onClick={handleDeleteNode} destructive />
          </>
        )}
      </motion.div>
    </>
  );
};

const MenuItem = ({ icon, label, onClick, destructive = false }: { icon: React.ReactNode, label: string, onClick: () => void, destructive?: boolean }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`flex items-center gap-2 px-3 py-2 w-full text-left text-sm rounded-lg transition-colors
      ${destructive 
        ? 'text-red-400 hover:bg-red-500/20' 
        : 'text-slate-200 hover:bg-white/10 hover:text-white'
      }`}
  >
    {icon}
    {label}
  </button>
);
