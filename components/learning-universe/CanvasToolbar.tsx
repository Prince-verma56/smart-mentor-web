"use client";

import React from 'react';
import { useWorkspaceStore, useLayoutStore, useCanvasStore } from '@/stores/learningUniverseStore';
import { Network, Search, Filter, Share2, Upload, Download, FileDown, Workflow, Maximize2, MoreHorizontal, Settings2, Save, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'react-hot-toast';

export const CanvasToolbar = ({ onGenerate, isGenerating }: { onGenerate?: () => void, isGenerating?: boolean }) => {
  const layoutMode = useLayoutStore(s => s.layoutMode);
  const setLayoutMode = useLayoutStore(s => s.setLayoutMode);
  const isSaving = useWorkspaceStore(s => s.isSaving);
  const saveCanvasState = useWorkspaceStore(s => s.saveCanvasState);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1.5 bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl pointer-events-auto">
      <TooltipProvider delay={100}>
        {onGenerate && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 rounded-xl hover:bg-white/5 text-primary gap-2"
                  onClick={onGenerate}
                  disabled={isGenerating}
                >
                  <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-pulse' : ''}`} />
                  <span className="text-xs font-medium capitalize hidden sm:inline-block">
                    {isGenerating ? 'Generating...' : 'AI Generate'}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Generate Roadmap with AI</TooltipContent>
            </Tooltip>
            <div className="w-px h-6 bg-white/10 mx-1" />
          </>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-xl hover:bg-white/5"
                onClick={() => {
                  const input = document.getElementById('canvas-search');
                  if (input) {
                    input.style.width = input.style.width === '150px' ? '0px' : '150px';
                    input.style.opacity = input.style.opacity === '1' ? '0' : '1';
                    if (input.style.width === '150px') input.focus();
                  }
                }}
              >
                <Search className="w-4 h-4 text-muted-foreground" />
              </Button>
              <input
                id="canvas-search"
                type="text"
                placeholder="Search nodes..."
                className="bg-transparent text-sm text-white focus:outline-none transition-all duration-200 overflow-hidden"
                style={{ width: '0px', opacity: 0, paddingLeft: '4px' }}
                onChange={(e) => {
                  const store = require('@/stores/learningUniverseStore').useToolbarStore;
                  store.getState().setSearchQuery(e.target.value);
                }}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Search Nodes</TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-white/10 mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 rounded-xl hover:bg-white/5 text-muted-foreground gap-2">
              <Network className="w-4 h-4" />
              <span className="text-xs font-medium capitalize hidden sm:inline-block">{layoutMode} Layout</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-48 bg-background/95 backdrop-blur-xl border-white/10 rounded-xl">
            <DropdownMenuItem onClick={() => setLayoutMode('free')} className="text-xs gap-2">
              Free Canvas
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLayoutMode('hierarchy')} className="text-xs gap-2">
              Hierarchical Tree
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLayoutMode('mindmap')} className="text-xs gap-2">
              Mind Map
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLayoutMode('timeline')} className="text-xs gap-2">
              Timeline
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/5">
              <Filter className="w-4 h-4 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Filter Map</TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-white/10 mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 rounded-xl hover:bg-white/5 text-muted-foreground gap-2"
              onClick={saveCanvasState}
              disabled={isSaving}
            >
              <Save className={`w-4 h-4 ${isSaving ? 'animate-pulse text-primary' : ''}`} />
              <span className="text-xs hidden sm:inline-block">{isSaving ? 'Saving...' : 'Saved'}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Sync state to Cloud</TooltipContent>
        </Tooltip>

      </TooltipProvider>
    </div>
  );
};
