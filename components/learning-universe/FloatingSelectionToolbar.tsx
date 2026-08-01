"use client";

import React from 'react';
import { useLearningUniverseStore } from '@/stores/learningUniverseStore';
import { Trash2, Copy, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FloatingSelectionToolbar = () => {
  const selectedNodes = useLearningUniverseStore(s => s.selectedNodes);
  const selectedEdges = useLearningUniverseStore(s => s.selectedEdges);
  const removeNodes = useLearningUniverseStore(s => s.removeNodes);
  const removeEdges = useLearningUniverseStore(s => s.removeEdges);
  const addNode = useLearningUniverseStore(s => s.addNode);

  const edges = useLearningUniverseStore(s => s.edges);

  if (selectedNodes.length === 0 && selectedEdges.length === 0) return null;

  const handleDelete = () => {
    if (selectedNodes.length > 0) removeNodes(selectedNodes.map(n => n.id));
    if (selectedEdges.length > 0) removeEdges(selectedEdges.map(e => e.id));
  };

  const handleDuplicate = () => {
    selectedNodes.forEach(node => {
      addNode({
        ...node,
        id: `manual-node-${Date.now()}-${Math.random()}`,
        position: { x: node.position.x + 50, y: node.position.y + 50 },
        selected: false,
        data: { ...node.data, metadata: { source: 'user' } }
      });
    });
  };

  const getSelectionText = () => {
    if (selectedNodes.length === 1 && selectedEdges.length === 0) {
      const connections = edges.filter(e => e.source === selectedNodes[0].id || e.target === selectedNodes[0].id).length;
      return `1 Node Selected • ${connections} Connection${connections !== 1 ? 's' : ''}`;
    }
    if (selectedEdges.length === 1 && selectedNodes.length === 0) {
      return `1 Relationship Selected`;
    }
    
    const parts = [];
    if (selectedNodes.length > 0) parts.push(`${selectedNodes.length} Node${selectedNodes.length > 1 ? 's' : ''}`);
    if (selectedEdges.length > 0) parts.push(`${selectedEdges.length} Edge${selectedEdges.length > 1 ? 's' : ''}`);
    return `${parts.join(', ')} Selected`;
  };

  return (
    <AnimatePresence>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="flex items-center gap-1 bg-zinc-900/95 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl shadow-2xl"
        >
          <span className="text-xs text-muted-foreground px-3 font-medium tracking-wide">
            {getSelectionText()}
          </span>
          <div className="w-px h-5 bg-white/10 mx-1" />
          
          {selectedNodes.length > 0 && (
            <button onClick={handleDuplicate} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-slate-200" title="Duplicate">
              <Copy className="w-4 h-4" />
            </button>
          )}
          <button onClick={handleDelete} className="p-2.5 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
