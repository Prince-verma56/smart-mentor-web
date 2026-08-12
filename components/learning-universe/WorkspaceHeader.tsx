"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useWorkspaceStore } from '@/stores/learningUniverseStore';
import Breadcrumb from '@/components/ui/smoothui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Search, Cloud, Download, Settings, Share2, Folders, ChevronDown, Check, Folder, Map as MapIcon, Edit2 } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export const WorkspaceHeader = ({ mentorId }: { mentorId: string }) => {
  const activeCanvasId = useWorkspaceStore(s => s.activeCanvasId);
  const setActiveCanvasId = useWorkspaceStore(s => s.setActiveCanvasId);
  const canvases = useWorkspaceStore(s => s.canvases);
  const isSaving = useWorkspaceStore(s => s.isSaving);
  const updateCanvas = useWorkspaceStore(s => s.updateCanvas);
  
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [editTitleValue, setEditTitleValue] = React.useState('');
  const titleInputRef = React.useRef<HTMLInputElement>(null);
  
  const router = useRouter();
  const pathname = usePathname();

  // Derive the current canvas ID from the URL as the ultimate source of truth for the header
  const isCanvasView = pathname.includes('/canvas/') && !pathname.endsWith('/canvas');
  const slugFromUrl = isCanvasView ? pathname.split('/').pop() : null;
  const isOfficialRoadmapView = pathname.endsWith('/learning-universe');
  
  // Filter canvases to ONLY this mentor — the store holds all mentors' canvases together
  const mentorCanvases = canvases.filter(c => c.mentor_id === mentorId);

  // Find active canvas by slug first, then by ID, fallback to official
  let activeCanvas = null;
  if (slugFromUrl) {
    activeCanvas = mentorCanvases.find(c => c.slug === slugFromUrl || c.id === slugFromUrl);
  } else if (isOfficialRoadmapView) {
    activeCanvas = mentorCanvases.find(c => c.is_official_roadmap);
  } else {
    activeCanvas = mentorCanvases.find(c => c.id === activeCanvasId);
  }
  
  // Derive fallback canvas name from route if the canvas object isn't loaded yet
  const canvasDisplayName = activeCanvas?.name
    || (isOfficialRoadmapView ? 'Official Roadmap' : (slugFromUrl ? 'Canvas' : 'Loading...'));
  const currentCanvasId = activeCanvas?.id || null;
  const isDashboard = pathname.endsWith('/workspaces');
  
  const basePath = `/dashboard/mentors/${mentorId}/learning-universe`;
  const workspacesPath = `${basePath}/workspaces`;
  const canvasPath = `${basePath}/canvas`;

  // Start Editing Title
  const handleStartEdit = () => {
    if (activeCanvas?.is_official_roadmap) return;
    setEditTitleValue(activeCanvas?.name || '');
    setIsEditingTitle(true);
    setTimeout(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }, 0);
  };

  // Save Edit
  const handleSaveEdit = async () => {
    if (!isEditingTitle) return;
    if (editTitleValue.trim() !== '' && activeCanvas) {
      // Optimistically update
      const newSlug = await updateCanvas(activeCanvas.id, { name: editTitleValue.trim() });
      if (newSlug && isCanvasView) {
        // If the backend generated a new slug and we are on the canvas page, replace URL
        router.replace(`${canvasPath}/${newSlug}`);
      }
    }
    setIsEditingTitle(false);
  };

  // Key handlers for Edit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveEdit();
    if (e.key === 'Escape') setIsEditingTitle(false);
  };

  // Switch canvas
  const handleSwitchCanvas = (targetCanvas: any) => {
    setActiveCanvasId(targetCanvas.id);
    if (targetCanvas.is_official_roadmap) {
      router.push(basePath);
    } else {
      router.push(`${canvasPath}/${targetCanvas.slug || targetCanvas.id}`);
    }
  };

  return (
    <header className="border-b border-white/[0.05] bg-background/80 backdrop-blur-2xl shrink-0 flex items-center justify-between px-5 py-2 min-h-[52px]">
      
      {/* ── Left: Breadcrumbs & Manager Toggle ──────────────────── */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <TooltipProvider delay={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={pathname.includes('/workspaces') && !activeCanvas ? "secondary" : "ghost"} 
                size="sm" 
                className="h-8 gap-2 px-3 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors rounded-lg"
                onClick={() => router.push(workspacesPath)}
              >
                <Folders className="w-4 h-4" />
                <span className="hidden sm:inline-block font-medium">Workspaces</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open Workspace Manager</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Separator orientation="vertical" className="h-4 bg-white/[0.1]" />
        
        {/* Canvas Identity */}
        <div className="flex items-center text-sm">
          <span className="text-muted-foreground hidden md:inline-block">Learning Universe</span>
          <span className="text-muted-foreground hidden md:inline-block mx-2">/</span>
          
          {pathname.includes('/settings') ? (
            <span className="font-medium text-white/90">Settings</span>
          ) : pathname.includes('/export') ? (
            <span className="font-medium text-white/90">Export</span>
          ) : pathname.includes('/workspaces') ? (
            <span className="font-medium text-white/90">Workspace Manager</span>
          ) : (
            <div className="flex items-center group">
              {isEditingTitle ? (
                <Input
                  ref={titleInputRef}
                  value={editTitleValue}
                  onChange={(e) => setEditTitleValue(e.target.value)}
                  onBlur={handleSaveEdit}
                  onKeyDown={handleKeyDown}
                  className="h-7 py-0 px-2 text-sm font-medium w-48 bg-white/5 border-emerald-500/30 focus-visible:ring-emerald-500/50"
                />
              ) : (
                <div 
                  className={`flex items-center gap-2 px-2 py-1 rounded-md transition-colors ${activeCanvas?.is_official_roadmap ? '' : 'cursor-text hover:bg-white/5'}`}
                  onClick={handleStartEdit}
                >
                  <span className="font-medium text-white/90 max-w-[200px] truncate">
                    {canvasDisplayName}
                  </span>
                  {!activeCanvas?.is_official_roadmap && (
                    <Edit2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              )}

              {/* Canvas Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-6 h-6 ml-1 text-muted-foreground hover:text-white rounded-md hover:bg-white/10">
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 bg-zinc-950 border-white/10">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Switch Canvas</div>
                  <DropdownMenuSeparator className="bg-white/5" />
                  {mentorCanvases.map(c => (
                    <DropdownMenuItem 
                      key={c.id} 
                      onClick={() => handleSwitchCanvas(c)}
                      className={`gap-2 cursor-pointer ${c.id === activeCanvasId ? 'bg-white/5' : ''}`}
                    >
                      {c.is_official_roadmap ? (
                        <MapIcon className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Folder className="w-4 h-4 text-blue-400" />
                      )}
                      <span className="flex-1 truncate">{c.name}</span>
                      {c.id === activeCanvasId && <Check className="w-4 h-4 text-emerald-400" />}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem onClick={() => router.push(workspacesPath)} className="text-muted-foreground cursor-pointer justify-center">
                    View all workspaces
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      {/* ── Center: Search (only on canvas view) ──────────────────────── */}
      {!isDashboard && (
        <div className="hidden md:flex items-center justify-center flex-1 min-w-0 px-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input 
              placeholder="Search nodes, tags, or content..." 
              className="w-full h-8 pl-9 bg-white/[0.02] border-white/5 hover:bg-white/[0.04] focus:bg-white/[0.05] rounded-full text-xs transition-colors shadow-inner"
            />
          </div>
        </div>
      )}
      {/* Spacer when no search shown */}
      {isDashboard && <div className="flex-1" />}

      {/* ── Right: Actions & Status (only on canvas/export/settings pages) ─── */}
      <div className="flex items-center justify-end gap-2 flex-shrink-0">
        {!isDashboard && (
          <>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 mr-2 rounded-full bg-white/[0.02] border border-white/[0.05]">
              <Cloud className={`w-3.5 h-3.5 ${isSaving ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                {isSaving ? 'Saving...' : 'Saved'}
              </span>
            </div>

            <TooltipProvider delay={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share Canvas</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={pathname.includes('/export') ? "secondary" : "ghost"} 
                    size="icon" 
                    className="w-8 h-8 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white"
                    onClick={() => router.push(`${basePath}/export`)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export Options</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={pathname.includes('/settings') ? "secondary" : "ghost"} 
                    size="icon" 
                    className="w-8 h-8 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white"
                    onClick={() => router.push(`${basePath}/settings`)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Workspace Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Separator orientation="vertical" className="h-4 mx-1 bg-white/[0.05]" />
          </>
        )}
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "w-7 h-7 ring-2 ring-emerald-500/20"
            }
          }}
        />
      </div>
    </header>
  );
};
