"use client";

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceStore } from '@/stores/learningUniverseStore';
import { createCanvas } from '@/lib/api/canvasApi';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder, Map, FileText, Settings, Trash2, Copy, Edit2, Archive, Pin, Search, Plus, Layout, Import, Activity, HardDrive } from 'lucide-react';
import { CanvasCard } from '@/components/learning-universe/CanvasCard';
import { RenameCanvasModal } from '@/components/learning-universe/modals/RenameCanvasModal';
import { DeleteCanvasModal } from '@/components/learning-universe/modals/DeleteCanvasModal';
import { ArchiveCanvasModal } from '@/components/learning-universe/modals/ArchiveCanvasModal';
import { DuplicateCanvasModal } from '@/components/learning-universe/modals/DuplicateCanvasModal';
import { ShareCanvasModal } from '@/components/learning-universe/modals/ShareCanvasModal';
import { ActivityFeed } from '@/components/learning-universe/ActivityFeed';

export default function WorkspaceDashboard({ params }: { params: Promise<{ mentorId: string }> }) {
  const { mentorId } = use(params);
  const router = useRouter();

  const activeCanvasId = useWorkspaceStore(s => s.activeCanvasId);
  const setActiveCanvasId = useWorkspaceStore(s => s.setActiveCanvasId);
  const canvases = useWorkspaceStore(s => s.canvases);
  const addCanvas = useWorkspaceStore(s => s.addCanvas);
  const removeCanvas = useWorkspaceStore(s => s.removeCanvas);
  const updateCanvas = useWorkspaceStore(s => s.updateCanvas);

  const duplicateCanvas = useWorkspaceStore(s => s.duplicateCanvas);
  const archiveCanvas = useWorkspaceStore(s => s.archiveCanvas);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pinned' | 'archived' | 'recent'>('all');
  
  // Modal state
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const [renameCurrentTitle, setRenameCurrentTitle] = useState('');
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetTitle, setDeleteTargetTitle] = useState('');
  
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [archiveTargetId, setArchiveTargetId] = useState<string | null>(null);
  const [archiveTargetTitle, setArchiveTargetTitle] = useState('');
  
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);
  const [duplicateTarget, setDuplicateTarget] = useState<any | null>(null);

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareTargetId, setShareTargetId] = useState<string | null>(null);
  const [shareTargetTitle, setShareTargetTitle] = useState('');

  const officialRoadmap = canvases.find(c => c.is_official_roadmap);

  const [activities, setActivities] = useState<any[]>([]);

  React.useEffect(() => {
    if (filterType !== 'recent') return;
    let cancelled = false;
    (async () => {
      try {
        const api = await import('@/lib/api/canvasApi');
        const data = await api.fetchWorkspaceActivities();
        if (!cancelled) setActivities(Array.isArray(data) ? data : []);
      } catch {
        // fetchWorkspaceActivities already returns [] on error — belt & suspenders
        if (!cancelled) setActivities([]);
      }
    })();
    return () => { cancelled = true; };
  }, [filterType]);

  let personalCanvases = canvases.filter(c => !c.is_official_roadmap && (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
  
  if (filterType === 'pinned') {
    personalCanvases = personalCanvases.filter(c => c.is_pinned);
  } else if (filterType === 'archived') {
    personalCanvases = personalCanvases.filter(c => c.is_archived);
  } else {
    // hide archived from 'all' and 'recent'
    personalCanvases = personalCanvases.filter(c => !c.is_archived);
  }

  if (filterType === 'recent') {
    personalCanvases = [...personalCanvases].sort((a, b) => {
      const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return bTime - aTime;
    });
  } else if (filterType === 'all') {
    personalCanvases = [...personalCanvases].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } else if (filterType === 'pinned') {
    personalCanvases = [...personalCanvases].sort((a, b) => (a.pinned_order || 0) - (b.pinned_order || 0));
  }

  const reorderPinned = useWorkspaceStore(s => s.reorderPinned);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(personalCanvases);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Optimistic UI update
    reorderPinned(items.map(item => item.id));
  };

  const [isCreating, setIsCreating] = useState(false);

  const handleCreateCanvas = async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      // Call API directly so we get the real UUID + slug before navigating
      const newCanvas = await createCanvas(mentorId, 'New Blank Canvas', false);
      if (!newCanvas?.id || !newCanvas?.slug) {
        throw new Error('Invalid response from server');
      }
      // Add to store with real data (no temp IDs)
      addCanvas(newCanvas);
      setActiveCanvasId(newCanvas.id);
      router.push(`/dashboard/mentors/${mentorId}/learning-universe/canvas/${newCanvas.slug}`);
    } catch (e) {
      console.error('Failed to create canvas:', e);
      toast.error('Failed to create canvas. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteClick = (id: string, currentTitle: string) => {
    setDeleteTargetId(id);
    setDeleteTargetTitle(currentTitle);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) removeCanvas(deleteTargetId);
    setIsDeleteOpen(false);
    setDeleteTargetId(null);
  };

  const handleRenameClick = (id: string, currentTitle: string) => {
    setRenameTargetId(id);
    setRenameCurrentTitle(currentTitle);
    setIsRenameOpen(true);
  };

  const handleRenameSave = (newTitle: string) => {
    if (renameTargetId) {
      updateCanvas(renameTargetId, { name: newTitle });
    }
    setIsRenameOpen(false);
    setRenameTargetId(null);
  };

  const handleDuplicateClick = (canvas: any) => {
    setDuplicateTarget(canvas);
    setIsDuplicateOpen(true);
  };

  const handleDuplicateConfirm = async () => {
    if (duplicateTarget) {
      await duplicateCanvas(duplicateTarget.id);
    }
    setIsDuplicateOpen(false);
    setDuplicateTarget(null);
  };
  
  const handleArchiveClick = (id: string, currentTitle: string) => {
    const target = canvases.find(c => c.id === id);
    if (target?.is_archived) {
      // Unarchive directly
      updateCanvas(id, { is_archived: false });
    } else {
      // Show archive confirmation modal
      setArchiveTargetId(id);
      setArchiveTargetTitle(currentTitle);
      setIsArchiveOpen(true);
    }
  };

  const handleArchiveConfirm = () => {
    if (archiveTargetId) archiveCanvas(archiveTargetId);
    setIsArchiveOpen(false);
    setArchiveTargetId(null);
  };
  
  const handlePin = (id: string, currentlyPinned: boolean) => {
    updateCanvas(id, { is_pinned: !currentlyPinned });
  };

  const handleOpen = (id: string) => {
    const target = canvases.find(c => c.id === id);
    setActiveCanvasId(id);
    if (target?.is_official_roadmap) {
      router.push(`/dashboard/mentors/${mentorId}/learning-universe`);
    } else {
      router.push(`/dashboard/mentors/${mentorId}/learning-universe/canvas/${target?.slug || id}`);
    }
  };

  const handleShare = (id: string, currentTitle: string) => {
    setShareTargetId(id);
    setShareTargetTitle(currentTitle);
    setIsShareOpen(true);
  };

  const handleExport = (id: string) => {
    const target = canvases.find(c => c.id === id);
    if (target) {
      setActiveCanvasId(id);
      const canvasStore = require('@/stores/learningUniverseStore').useCanvasStore;
      canvasStore.getState().setNodes(target.nodes || []);
      canvasStore.getState().setEdges(target.edges || []);
      if (target.viewport) canvasStore.getState().setViewport(target.viewport);
      router.push(`/dashboard/mentors/${mentorId}/learning-universe/export`);
    }
  };

  const handleSettings = (id: string) => {
    setActiveCanvasId(id);
    router.push(`/dashboard/mentors/${mentorId}/learning-universe/settings`);
  };

  return (
    <div className="flex h-full w-full">
      {/* Dashboard Sidebar */}
      <div className="w-64 border-r border-white/5 bg-black/40 p-6 flex flex-col shrink-0 overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-xl font-bold tracking-tight text-white/90">Workspaces</h2>
          <p className="text-xs text-muted-foreground mt-1">Manage your knowledge graph</p>
        </div>
        
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 font-medium rounded-xl h-10 px-3"
            onClick={handleCreateCanvas}
          >
            <Plus className="w-4 h-4" />
            Blank Canvas
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-white rounded-xl h-10 px-3 transition-colors">
            <Layout className="w-4 h-4" />
            Browse Templates
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-white rounded-xl h-10 px-3 transition-colors">
            <Import className="w-4 h-4" />
            Import Notes
          </Button>
        </div>

        <div className="pt-6 mt-6 border-t border-white/5 space-y-1">
          <Button 
            variant="ghost" 
            className={`w-full justify-start gap-3 rounded-xl h-10 px-3 transition-colors ${filterType === 'all' ? 'text-white/90 bg-white/5' : 'text-muted-foreground hover:text-white'}`}
            onClick={() => setFilterType('all')}
          >
            <Folder className="w-4 h-4" />
            All Canvases
          </Button>
          <Button 
            variant="ghost" 
            className={`w-full justify-start gap-3 rounded-xl h-10 px-3 transition-colors ${filterType === 'recent' ? 'text-white/90 bg-white/5' : 'text-muted-foreground hover:text-white'}`}
            onClick={() => setFilterType('recent')}
          >
            <Activity className="w-4 h-4" />
            Recent Activity
          </Button>
          <Button 
            variant="ghost" 
            className={`w-full justify-start gap-3 rounded-xl h-10 px-3 transition-colors ${filterType === 'pinned' ? 'text-white/90 bg-white/5' : 'text-muted-foreground hover:text-white'}`}
            onClick={() => setFilterType('pinned')}
          >
            <Pin className="w-4 h-4" />
            Pinned
          </Button>
          <Button 
            variant="ghost" 
            className={`w-full justify-start gap-3 rounded-xl h-10 px-3 transition-colors ${filterType === 'archived' ? 'text-white/90 bg-white/5' : 'text-muted-foreground hover:text-white'}`}
            onClick={() => setFilterType('archived')}
          >
            <Archive className="w-4 h-4" />
            Archived
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-10 overflow-y-auto bg-gradient-to-b from-zinc-950 to-black">
        <div className="max-w-6xl w-full mx-auto">
          
          <div className="flex items-center mb-10">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search canvases, templates, or descriptions..." 
                className="pl-11 bg-white/[0.02] border-white/10 rounded-2xl text-sm h-12 placeholder:text-muted-foreground focus-visible:ring-emerald-500/50 shadow-inner hover:bg-white/[0.04] transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Statistics Row */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4 px-1">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white/80">Workspace Health</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.03] flex flex-col gap-1.5 hover:bg-white/[0.02] transition-colors">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Canvases</span>
                <span className="text-3xl font-bold text-white/90">{canvases.length}</span>
              </div>
              <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.03] flex flex-col gap-1.5 hover:bg-white/[0.02] transition-colors">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pinned</span>
                <span className="text-3xl font-bold text-white/90">{canvases.filter(c => c.is_pinned).length}</span>
              </div>
              <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.03] flex flex-col gap-1.5 hover:bg-white/[0.02] transition-colors">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Templates Used</span>
                <span className="text-3xl font-bold text-white/90">3</span>
              </div>
              <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.03] flex flex-col justify-between hover:bg-white/[0.02] transition-colors">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Storage Used</span>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold text-white/90">12%</span>
                  <HardDrive className="w-6 h-6 text-emerald-500/30 mb-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Official Workspace (only show if it matches the current filter) */}
          {officialRoadmap && (
            (filterType === 'all') ||
            (filterType === 'pinned' && officialRoadmap.is_pinned) ||
            (filterType === 'archived' && officialRoadmap.is_archived)
          ) && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Map className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-white/90">Official Workspace</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {officialRoadmap && (
                  <CanvasCard 
                    canvas={officialRoadmap}
                    isActive={activeCanvasId === officialRoadmap.id}
                    onOpen={handleOpen}
                    onRename={handleRenameClick}
                    onDuplicate={handleDuplicateClick}
                    onDelete={(id) => handleDeleteClick(id, officialRoadmap.name)}
                    onPin={() => handlePin(officialRoadmap.id, !!officialRoadmap.is_pinned)}
                    onArchive={() => handleArchiveClick(officialRoadmap.id, officialRoadmap.name)}
                    onShare={() => handleShare(officialRoadmap.id, officialRoadmap.name)}
                    onExport={() => handleExport(officialRoadmap.id)}
                    onSettings={() => handleSettings(officialRoadmap.id)}
                  />
                )}
              </div>
            </div>
          )}

          {/* Personal Canvases or Recent Activity */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                {filterType === 'recent' ? <Activity className="w-4 h-4 text-blue-400" /> : <FileText className="w-4 h-4 text-blue-400" />}
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-white/90">
                {filterType === 'recent' ? 'Recent Activity' : 
                 filterType === 'pinned' ? 'Pinned Canvases' :
                 filterType === 'archived' ? 'Archived Canvases' :
                 'My Canvases'}
              </h3>
            </div>
            
            {filterType === 'recent' ? (
              <ActivityFeed activities={activities} canvases={canvases} />
            ) : filterType === 'pinned' ? (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="pinned-canvases" direction="horizontal">
                  {(provided) => (
                    <div 
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {personalCanvases.map((canvas, index) => (
                        <Draggable key={canvas.id} draggableId={canvas.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <CanvasCard 
                                canvas={canvas}
                                isActive={activeCanvasId === canvas.id}
                                onOpen={handleOpen}
                                onRename={handleRenameClick}
                                onDuplicate={handleDuplicateClick}
                                onDelete={(id) => handleDeleteClick(id, canvas.name)}
                                onPin={() => handlePin(canvas.id, !!canvas.is_pinned)}
                                onArchive={() => handleArchiveClick(canvas.id, canvas.name)}
                                onShare={() => handleShare(canvas.id, canvas.name)}
                                onExport={() => handleExport(canvas.id)}
                                onSettings={() => handleSettings(canvas.id)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personalCanvases.map(canvas => (
                  <CanvasCard 
                    key={canvas.id}
                    canvas={canvas}
                    isActive={activeCanvasId === canvas.id}
                    onOpen={handleOpen}
                    onRename={handleRenameClick}
                    onDuplicate={handleDuplicateClick}
                    onDelete={(id) => handleDeleteClick(id, canvas.name)}
                    onPin={() => handlePin(canvas.id, !!canvas.is_pinned)}
                    onArchive={() => handleArchiveClick(canvas.id, canvas.name)}
                    onShare={() => handleShare(canvas.id, canvas.name)}
                    onExport={() => handleExport(canvas.id)}
                    onSettings={() => handleSettings(canvas.id)}
                  />
                ))}
              </div>
            )}
              
              {filterType !== 'archived' && filterType !== 'pinned' && personalCanvases.length === 0 && !isCreating && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="col-span-full"
                >
                  <div
                    className="flex flex-col items-center justify-center p-16 rounded-3xl border border-dashed border-white/10 bg-gradient-to-b from-white/[0.02] to-transparent hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all cursor-pointer group"
                    onClick={handleCreateCanvas}
                  >
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center mb-6 ring-1 ring-emerald-500/20 group-hover:ring-emerald-500/40 group-hover:scale-110 transition-all shadow-xl shadow-emerald-500/10">
                      <Plus className="w-10 h-10 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                    </div>
                    <h4 className="text-xl font-semibold text-white/80 group-hover:text-white/90 transition-colors mb-2">Create your first canvas</h4>
                    <p className="text-sm text-muted-foreground text-center max-w-xs leading-relaxed">
                      A canvas is your knowledge graph — start blank and build your learning universe, or use a template.
                    </p>
                    <div className="mt-6 flex items-center gap-3">
                      <button
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
                        onClick={(e) => { e.stopPropagation(); handleCreateCanvas(); }}
                      >
                        <Plus className="w-4 h-4" /> Blank Canvas
                      </button>
                      <button
                        className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors border border-white/10"
                        onClick={(e) => { e.stopPropagation(); }}
                      >
                        <Layout className="w-4 h-4" /> Browse Templates
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
              {(filterType === 'pinned' || filterType === 'archived') && personalCanvases.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                    {filterType === 'pinned' ? <Pin className="w-7 h-7 text-muted-foreground" /> : <Archive className="w-7 h-7 text-muted-foreground" />}
                  </div>
                  <h4 className="text-base font-medium text-white/60">
                    {filterType === 'pinned' ? 'No pinned canvases' : 'No archived canvases'}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filterType === 'pinned' ? 'Pin canvases from the context menu to access them quickly.' : 'Archived canvases are hidden from the main view.'}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      
      {/* Modals */}
        <RenameCanvasModal
          isOpen={isRenameOpen}
          onClose={() => setIsRenameOpen(false)}
          currentTitle={renameCurrentTitle}
          onSave={handleRenameSave}
        />
        <DeleteCanvasModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          canvasTitle={deleteTargetTitle}
          onConfirm={handleDeleteConfirm}
        />
        <ArchiveCanvasModal
          isOpen={isArchiveOpen}
          onClose={() => setIsArchiveOpen(false)}
          canvasTitle={archiveTargetTitle}
          onConfirm={handleArchiveConfirm}
        />
        <DuplicateCanvasModal
          isOpen={isDuplicateOpen}
          onClose={() => setIsDuplicateOpen(false)}
          canvasTitle={duplicateTarget?.name || ''}
          onConfirm={handleDuplicateConfirm}
        />
        <ShareCanvasModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          canvasTitle={shareTargetTitle}
          canvasId={shareTargetId || ''}
        />

    </div>
  );
}
