import React from 'react';
import { useLearningUniverseStore } from '@/stores/learningUniverseStore';
import { Network, Search, Filter, Share2, Workflow, Maximize2, MoreHorizontal, Settings2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export const LearningToolbar = () => {
  const { layoutMode, setLayoutMode, isSaving, saveCanvasState } = useLearningUniverseStore();

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1.5 bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/5">
              <Search className="w-4 h-4 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Search Nodes (Ctrl+F)</TooltipContent>
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

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/5">
              <Share2 className="w-4 h-4 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Share Roadmap</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
