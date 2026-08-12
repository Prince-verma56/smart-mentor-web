import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LayoutMode, ThemeMode } from './types';
import { fetchCanvases, updateCanvasState, deleteCanvas, duplicateCanvas as duplicateCanvasApi, archiveCanvas as archiveCanvasApi } from '@/lib/api/canvasApi';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Create a minimal local canvas object that works offline (no backend required). */
function makeLocalCanvas(mentorId: string, name: string, isOfficial: boolean): any {
  return {
    id: crypto.randomUUID(),
    name,
    mentor_id: mentorId,
    is_official_roadmap: isOfficial,
    slug: null,
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    _local: true, // marker so we know it was never persisted to server
  };
}

interface WorkspaceState {
  activeCanvasId: string | null;
  canvases: any[];
  isSaving: boolean;
  isInitializing: boolean;
  workspaceSettings: {
    sidebarWidth: number;
    explorerExpansionState: string[];
  };
  updateWorkspaceSettings: (settings: Partial<WorkspaceState['workspaceSettings']>) => void;
  setActiveCanvasId: (id: string | null) => void;
  addCanvas: (canvas: any) => void;
  updateCanvas: (id: string, updates: any) => Promise<string | null>;
  removeCanvas: (id: string) => void;
  duplicateCanvas: (id: string) => Promise<void>;
  archiveCanvas: (id: string) => Promise<void>;
  reorderPinned: (canvasIds: string[]) => void;
  saveCanvasState: () => Promise<void>;
  initWorkspace: (mentorId: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      activeCanvasId: null,
      canvases: [],
      isSaving: false,
      isInitializing: false,
      workspaceSettings: {
        sidebarWidth: 320,
        explorerExpansionState: [],
      },
      updateWorkspaceSettings: (settings) => set((state) => ({
        workspaceSettings: { ...state.workspaceSettings, ...settings }
      })),

      initWorkspace: async (mentorId) => {
        // If we already have canvases for this mentor in local state and they're still
        // valid, skip a full re-init to avoid hammering a slow/down backend.
        const existing = get().canvases;
        const alreadyHasOfficial = existing.some(
          (c: any) => c.is_official_roadmap && c.mentor_id === mentorId
        );
        if (alreadyHasOfficial && get().activeCanvasId) {
          // Still make sure activeCanvasId is pointing at something valid
          const currentActiveId = get().activeCanvasId;
          if (currentActiveId && existing.some((c: any) => c.id === currentActiveId)) {
            return; // all good — skip API call
          }
        }

        set({ isInitializing: true });
        try {
          let serverCanvases = await fetchCanvases(mentorId);
          
          if (!serverCanvases.find((c: any) => c.is_official_roadmap)) {
            const { createCanvas } = await import('@/lib/api/canvasApi');
            try {
              const newOfficial = await createCanvas(mentorId, 'Official Roadmap', true);
              if (newOfficial) {
                serverCanvases = [newOfficial, ...serverCanvases];
              }
            } catch (createErr) {
              // Backend unavailable for create — we'll fall through to local canvas below
              console.warn('[initWorkspace] Failed to create canvas on server:', createErr);
              // Inject local canvas so the UI has something to work with
              serverCanvases = [makeLocalCanvas(mentorId, 'Official Roadmap', true), ...serverCanvases];
            }
          }
          
          // Always replace canvases from server — never trust stale persisted state
          set({ canvases: serverCanvases });

          // Resolve the correct activeCanvasId:
          // 1. If current persisted activeCanvasId is a real UUID that still exists in server list, keep it
          // 2. Otherwise reset to official roadmap or first canvas
          const currentActiveId = get().activeCanvasId;
          const isCurrentValid =
            currentActiveId &&
            UUID_RE.test(currentActiveId) &&
            serverCanvases.some((c: any) => c.id === currentActiveId);

          if (!isCurrentValid) {
            const official = serverCanvases.find((c: any) => c.is_official_roadmap);
            set({ activeCanvasId: official ? official.id : (serverCanvases[0]?.id || null) });
          }
        } catch (error) {
          console.error('Failed to init workspace from API', error);
          // Backend is unavailable. Keep whatever canvases are already in local state.
          // If there's still nothing (first visit ever), inject a local canvas so the
          // UI has something to render and the auto-generate guard can fire.
          const stillEmpty = get().canvases.length === 0 ||
            !get().canvases.some((c: any) => c.mentor_id === mentorId);
          if (stillEmpty) {
            const localCanvas = makeLocalCanvas(mentorId, 'Official Roadmap', true);
            set({ canvases: [localCanvas], activeCanvasId: localCanvas.id });
          } else {
            // Ensure activeCanvasId is still valid
            const currentActiveId = get().activeCanvasId;
            const validCanvases = get().canvases;
            if (!currentActiveId || !validCanvases.some((c: any) => c.id === currentActiveId)) {
              const official = validCanvases.find((c: any) => c.is_official_roadmap);
              set({ activeCanvasId: official ? official.id : (validCanvases[0]?.id || null) });
            }
          }
        } finally {
          set({ isInitializing: false });
        }
      },

      setActiveCanvasId: (id) => {
        set((state) => {
          if (state.activeCanvasId === id) return state;

          const canvasStore = require('./canvasStore').useCanvasStore;
          const { nodes, edges, viewport, history } = canvasStore.getState();

          const updatedCanvases = state.activeCanvasId
            ? state.canvases.map(c =>
                c.id === state.activeCanvasId
                  ? { ...c, nodes, edges, viewport, history }
                  : c
              )
            : state.canvases;

          const nextCanvas = updatedCanvases.find(c => c.id === id);
          if (nextCanvas) {
            canvasStore.getState().resetUniverse();
            canvasStore.getState().setNodes(nextCanvas.nodes || []);
            canvasStore.getState().setEdges(nextCanvas.edges || []);
            if (nextCanvas.viewport) {
              canvasStore.getState().setViewport(nextCanvas.viewport);
            }
            if (nextCanvas.history) {
              canvasStore.setState({ history: nextCanvas.history });
            }
          }

          return { activeCanvasId: id, canvases: updatedCanvases };
        });
      },

      addCanvas: (canvas: any) => {
        set((state) => {
          if (state.canvases.some(c => c.id === canvas.id)) return state;
          return { canvases: [...state.canvases, canvas] };
        });
      },

      updateCanvas: async (id, updates) => {
        
        // Optimistic UI update
        set((state) => ({
          canvases: state.canvases.map((c) => c.id === id ? { ...c, ...updates } : c)
        }));
        try {
          const apiUpdates: Record<string, any> = { ...updates };
          if ('title' in apiUpdates && !('name' in apiUpdates)) {
            apiUpdates.name = apiUpdates.title;
            delete apiUpdates.title;
          }
          const updated = await updateCanvasState(id, apiUpdates);
          if (updated && updated.slug) {
            // Sync full canvas object back from server response
            set((state) => ({
              canvases: state.canvases.map((c) => c.id === id ? { ...c, ...updated } : c)
            }));
            return updated.slug;
          }
        } catch (e) {
          console.error('API error updating canvas', e);
        }
        return null;
      },

      removeCanvas: async (id) => {
        const originalCanvas = get().canvases.find(c => c.id === id);
        
        set((state) => {
          const nextCanvases = state.canvases.filter((c) => c.id !== id);
          let nextActive = state.activeCanvasId;

          if (state.activeCanvasId === id) {
            const official = nextCanvases.find(c => c.is_official_roadmap);
            nextActive = official ? official.id : (nextCanvases[0]?.id || null);

            if (nextActive) {
              const nextCanvas = nextCanvases.find(c => c.id === nextActive);
              const canvasStore = require('./canvasStore').useCanvasStore;
              canvasStore.getState().setNodes(nextCanvas?.nodes || []);
              canvasStore.getState().setEdges(nextCanvas?.edges || []);
              if (nextCanvas?.viewport) {
                canvasStore.getState().setViewport(nextCanvas.viewport);
              }
            }
          }

          return { canvases: nextCanvases, activeCanvasId: nextActive };
        });

        const { toast } = await import('react-hot-toast');
        
        let cancelled = false;
        toast.success('Canvas moved to trash. You have 10 seconds to undo.', {
          duration: 10000,
          id: 'delete-toast'
        });
        
        setTimeout(async () => {
          if (!cancelled) {
            try {
              await deleteCanvas(id);
            } catch (e) {
              console.error('API error deleting canvas', e);
            }
          }
        }, 10000);
      },

      duplicateCanvas: async (id) => {
        try {
          const res = await duplicateCanvasApi(id);
          if (res.status === 'success') {
            const newId = res.new_id;
            const targetCanvas = get().canvases.find((c: any) => c.id === id);
            const mentorId = targetCanvas?.mentor_id || get().canvases.find((c: any) => c.mentor_id)?.mentor_id;
            
            if (mentorId) {
              const allCanvases = await fetchCanvases(mentorId);
              set({ canvases: allCanvases });
            }
            get().setActiveCanvasId(newId);
          }
        } catch (e) {
          console.error('API error duplicating canvas', e);
        }
      },

      archiveCanvas: async (id) => {
        set((state) => ({
          canvases: state.canvases.map((c) => c.id === id ? { ...c, is_archived: true } : c)
        }));
        try {
          await archiveCanvasApi(id);
        } catch (e) {
          console.error('API error archiving canvas', e);
        }
      },

      reorderPinned: (canvasIds: string[]) => {
        set((state) => {
          const nextCanvases = [...state.canvases];
          canvasIds.forEach((id, index) => {
            const canvas = nextCanvases.find(c => c.id === id);
            if (canvas) {
              canvas.pinned_order = index;
            }
          });
          return { canvases: nextCanvases };
        });

        // Fire off APIs without waiting
        canvasIds.forEach((id, index) => {
          updateCanvasState(id, { pinned_order: index }).catch(e => {
            console.error(`Failed to update pinned_order for ${id}`, e);
          });
        });
      },

      saveCanvasState: async () => {
        set({ isSaving: true });
        const state = get();
        const activeId = state.activeCanvasId;

        // Only save if activeId is a real UUID — never a mock or temp string
        if (activeId && UUID_RE.test(activeId)) {
          try {
            const canvasStore = require('./canvasStore').useCanvasStore;
            const { nodes, edges, viewport } = canvasStore.getState();
            await updateCanvasState(activeId, { nodes, edges, viewport });
          } catch (e) {
            console.error('Failed to save to API', e);
          }
        }

        set({ isSaving: false });
      },
    }),
    {
      name: 'workspace-storage',
      version: 2, // v2 clears all old state (fake IDs, title→name mismatch)
      migrate: (_persistedState, _version) => {
        // Force-clear any pre-v2 localStorage — start fresh from server
        return { activeCanvasId: null, canvases: [] };
      },
    }
  )
);

// trigger compile
