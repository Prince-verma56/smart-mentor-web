"use client";

import React from 'react';
import { useReactFlow, useViewport, Panel } from '@xyflow/react';
import { useLearningUniverseStore } from '@/stores/learningUniverseStore';
import { Minus, Plus, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CustomControls = () => {
  const { zoomIn, zoomOut } = useReactFlow();
  const { zoom } = useViewport();
  
  const undo = useLearningUniverseStore(s => s.undo);
  const redo = useLearningUniverseStore(s => s.redo);
  const history = useLearningUniverseStore(s => s.history);
  
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return (
    <Panel position="bottom-left" className="flex items-center gap-2 m-6 pointer-events-auto">
      <div className="flex items-center bg-slate-100/10 dark:bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl h-10 px-1">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => zoomOut({ duration: 300 })} 
          className="h-8 w-8 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
        >
          <Minus className="w-4 h-4" />
        </Button>
        <div className="w-12 text-center text-xs font-medium text-slate-200 select-none">
          {Math.round(zoom * 100)}%
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => zoomIn({ duration: 300 })} 
          className="h-8 w-8 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center bg-slate-100/10 dark:bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl h-10 px-1 gap-0.5">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={undo}
          disabled={!canUndo}
          className="h-8 w-8 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={redo}
          disabled={!canRedo}
          className="h-8 w-8 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <Redo2 className="w-4 h-4" />
        </Button>
      </div>
    </Panel>
  );
};
