import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LayoutMode, ThemeMode } from './types';
import { fetchCanvases, fetchCanvasById, updateCanvasState, deleteCanvas, duplicateCanvas as duplicateCanvasApi, archiveCanvas as archiveCanvasApi, CanvasNotFoundError } from '@/lib/api/canvasApi';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Module-level concurrency guard: prevents multiple simultaneous initWorkspace
 * calls for the same mentorId from creating duplicate canvases.
 * This guards against React Strict Mode double-invocation and multiple
 * component mounts (WorkspaceInitializer + LearningCanvasWrapper) racing.
 */
const _initInFlight = new Set<string>();

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
    _local: true, // marker: never persisted to server
  };
}

interface WorkspaceState {
  activeCanvasId: string | null;
  canvases: any[]; // stores ALL mentors' canvases together — keyed by mentor_id
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
        // ── Concurrency guard: if already in-flight for this mentorId, skip ────
        if (_initInFlight.has(mentorId)) {
          return;
        }
        _initInFlight.add(mentorId);

        const existing = get().canvases;

        // ── ISOLATION: Immediately wipe the canvas store so the OLD mentor's
        // nodes are never visible while we fetch the new mentor's data.
        // Only do this if the current active canvas belongs to a DIFFERENT mentor.
        const currentActiveId = get().activeCanvasId;
        const currentActiveCanvas = existing.find((c: any) => c.id === currentActiveId);
        if (currentActiveCanvas && currentActiveCanvas.mentor_id !== mentorId) {
          const canvasStore = require('./canvasStore').useCanvasStore;
          canvasStore.getState().setAutosaveEnabled(false);
          canvasStore.getState().resetUniverse();
        }

        // ── Early-return guard ──────────────────────────────────────────────────
        // Only use the early return if THIS mentor already has a fully loaded,
        // server-backed canvas AND the active canvas ID belongs to this mentor.
        const mentorCanvases = existing.filter((c: any) => c.mentor_id === mentorId);
        const hasOfficialForMentor = mentorCanvases.some((c: any) => c.is_official_roadmap && !c._local);

        if (hasOfficialForMentor) {
          const isActiveOnThisMentor = currentActiveId &&
            mentorCanvases.some((c: any) => c.id === currentActiveId && !c._local);

          if (isActiveOnThisMentor) {
            const activeCanvas = mentorCanvases.find((c: any) => c.id === currentActiveId);
            if (activeCanvas && Array.isArray(activeCanvas.nodes) && activeCanvas.nodes.length > 0) {
              // Re-hydrate the canvas store with saved nodes
              const canvasStore = require('./canvasStore').useCanvasStore;
              canvasStore.getState().setAutosaveEnabled(false);
              canvasStore.getState().setNodes(activeCanvas.nodes);
              canvasStore.getState().setEdges(activeCanvas.edges || []);
              if (activeCanvas.viewport) canvasStore.getState().setViewport(activeCanvas.viewport);
              setTimeout(() => canvasStore.getState().setAutosaveEnabled(true), 100);
              _initInFlight.delete(mentorId);
              return;
            }
            // Canvas exists but has no nodes — fall through to fetch fresh data
          }
          // activeCanvasId points to another mentor — fall through to full fetch
        }

        // ── Full init ───────────────────────────────────────────────────────────
        set({ isInitializing: true });
        try {
          let serverCanvases = await fetchCanvases(mentorId);

          if (!serverCanvases.find((c: any) => c.is_official_roadmap)) {
            const { createCanvas } = await import('@/lib/api/canvasApi');
            const newOfficial = await createCanvas(mentorId, 'Official Roadmap', true);
            if (newOfficial) {
              serverCanvases = [newOfficial, ...serverCanvases];
            } else {
              // Backend down — inject a local canvas so UI has something to work with
              serverCanvases = [makeLocalCanvas(mentorId, 'Official Roadmap', true), ...serverCanvases];
            }
          }

          // Merge: keep other mentors' canvases, replace THIS mentor's (drop stale local-only canvases)
          const otherMentorCanvases = get().canvases.filter(
            (c: any) => c.mentor_id !== mentorId
          );
          const mergedCanvases = [...serverCanvases, ...otherMentorCanvases];
          set({ canvases: mergedCanvases });

          // Resolve activeCanvasId for this mentor
          const currentActiveId = get().activeCanvasId;
          const activeCanvasInState = mergedCanvases.find((c: any) => c.id === currentActiveId);
          
          const isCurrentValidForMentor =
            currentActiveId &&
            UUID_RE.test(currentActiveId) &&
            activeCanvasInState;

          // If not valid, or if the active canvas in state is missing full 'nodes' data (it's just a summary)
          if (!isCurrentValidForMentor || (activeCanvasInState && !Array.isArray(activeCanvasInState.nodes))) {
            const official = mergedCanvases.find((c: any) => c.is_official_roadmap);
            const targetId = official ? official.id : (mergedCanvases[0]?.id || null);
            if (targetId) {
              // Fetch full canvas data before activating, preventing empty summary from wiping nodes
              const fullCanvas = await fetchCanvasById(targetId);
              if (fullCanvas?.id && Array.isArray(fullCanvas.nodes)) {
                // Update merged canvases with the full data so setActiveCanvasId picks up the nodes
                set((state) => {
                  const newCanvases = [...state.canvases];
                  const idx = newCanvases.findIndex(c => c.id === fullCanvas.id);
                  if (idx !== -1) {
                    newCanvases[idx] = { ...newCanvases[idx], ...fullCanvas };
                  }
                  return { canvases: newCanvases };
                });
                // Use setActiveCanvasId so canvasStore nodes/edges are properly reset
                get().setActiveCanvasId(targetId);
              } else {
                console.error("Failed to fetch full canvas data or nodes missing. Aborting activation to prevent data loss.");
              }
            }
          }
        } catch (error) {
          console.error('Failed to init workspace from API', error);

          // Keep other mentors' canvases intact — only handle THIS mentor
          const currentMentorCanvases = get().canvases.filter(
            (c: any) => c.mentor_id === mentorId
          );

          if (currentMentorCanvases.length === 0) {
            // First visit for this mentor — create a local canvas
            const localCanvas = makeLocalCanvas(mentorId, 'Official Roadmap', true);
            // Append to existing (don't replace other mentors' data)
            set((state) => ({ canvases: [...state.canvases, localCanvas] }));
            // Use setActiveCanvasId to properly reset canvasStore nodes
            get().setActiveCanvasId(localCanvas.id);
          } else {
            // Canvases exist for this mentor — switch to the official one
            const official = currentMentorCanvases.find((c: any) => c.is_official_roadmap)
              || currentMentorCanvases[0];
            if (official) {
              get().setActiveCanvasId(official.id);
            }
          }
        } finally {
          set({ isInitializing: false });
          _initInFlight.delete(mentorId); // Release lock so future visits re-initialize
        }
      },

      setActiveCanvasId: (id) => {
        set((state) => {
          if (state.activeCanvasId === id) return state;

          const canvasStore = require('./canvasStore').useCanvasStore;
          const { nodes, edges, viewport, history } = canvasStore.getState();

          // Snapshot current canvas state into the old canvas entry before switching
          const updatedCanvases = state.activeCanvasId
            ? state.canvases.map(c =>
                c.id === state.activeCanvasId
                  ? { ...c, nodes, edges, viewport, history }
                  : c
              )
            : state.canvases;

          const nextCanvas = updatedCanvases.find(c => c.id === id);
          if (nextCanvas) {
            // We are changing canvases. Unconditionally wipe the in-memory state
            // so nodes from the old canvas NEVER bleed into the new one.
            canvasStore.getState().setAutosaveEnabled(false);
            canvasStore.getState().resetUniverse();

            const nextHasNodes = Array.isArray(nextCanvas.nodes) && nextCanvas.nodes.length > 0;

            if (nextHasNodes) {
              // New canvas has saved data — load it
              canvasStore.getState().setNodes(nextCanvas.nodes || []);
              canvasStore.getState().setEdges(nextCanvas.edges || []);
              if (nextCanvas.viewport) {
                canvasStore.getState().setViewport(nextCanvas.viewport);
              }
              if (nextCanvas.history) {
                canvasStore.setState({ history: nextCanvas.history });
              }
            }
            
            // Re-enable autosave after a tick so loading doesn't trigger a save
            setTimeout(() => {
              canvasStore.getState().setAutosaveEnabled(true);
            }, 100);
          }

          return { activeCanvasId: id, canvases: updatedCanvases };
        });
      },

      addCanvas: (canvas: any) => {
        set((state) => {
          const existingIndex = state.canvases.findIndex(c => c.id === canvas.id);
          if (existingIndex !== -1) {
            const newCanvases = [...state.canvases];
            newCanvases[existingIndex] = { ...newCanvases[existingIndex], ...canvas };
            return { canvases: newCanvases };
          }
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
        set((state) => {
          const nextCanvases = state.canvases.filter((c) => c.id !== id);
          let nextActive = state.activeCanvasId;

          if (state.activeCanvasId === id) {
            // Prefer another canvas from the same mentor
            const removedCanvas = state.canvases.find(c => c.id === id);
            const sameMentorCanvases = nextCanvases.filter(
              c => c.mentor_id === removedCanvas?.mentor_id
            );
            const official = sameMentorCanvases.find(c => c.is_official_roadmap);
            nextActive = official ? official.id : (sameMentorCanvases[0]?.id || null);

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
        toast.success('Canvas moved to trash. You have 10 seconds to undo.', {
          duration: 10000,
          id: 'delete-toast'
        });

        setTimeout(async () => {
          try {
            await deleteCanvas(id);
          } catch (e) {
            console.error('API error deleting canvas', e);
          }
        }, 10000);
      },

      duplicateCanvas: async (id) => {
        try {
          const res = await duplicateCanvasApi(id);
          if (res && res.status === 'success') {
            const newId = res.new_id;
            const targetCanvas = get().canvases.find((c: any) => c.id === id);
            const mentorId = targetCanvas?.mentor_id;

            if (mentorId) {
              const allCanvases = await fetchCanvases(mentorId);
              // Merge: keep other mentors' canvases
              const otherMentors = get().canvases.filter((c: any) => c.mentor_id !== mentorId);
              set({ canvases: [...allCanvases, ...otherMentors] });
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
        const { activeCanvasId, canvases } = get();
        if (!activeCanvasId) return;

        const currentCanvas = canvases.find(c => c.id === activeCanvasId);
        if (currentCanvas?._local) return; // Never save mock canvases

        const canvasStore = require('./canvasStore').useCanvasStore;
        const { nodes, edges, viewport } = canvasStore.getState();

        // Safety check: if this is an official roadmap and nodes is completely empty, 
        // DO NOT SAVE to prevent catastrophic data loss bugs from accidental state wipes.
        if (currentCanvas?.is_official_roadmap && nodes.length === 0) {
          console.warn("Skipping autosave: Refusing to save 0 nodes to official roadmap (safety catch).");
          return;
        }

        set({ isSaving: true });

        // Only save if activeId is a real UUID — never a mock or temp string
        if (activeCanvasId && UUID_RE.test(activeCanvasId)) {
          try {
            await updateCanvasState(activeCanvasId, { nodes, edges, viewport });
          } catch (e: any) {
            if (e instanceof CanvasNotFoundError) {
              // Canvas was created offline and was never saved to backend.
              // Remove it from store so initWorkspace creates a real one.
              console.warn(`[WorkspaceStore] Removing ghost local canvas ${activeCanvasId} — not found on backend.`);
              set((state) => ({
                canvases: state.canvases.filter(c => c.id !== activeCanvasId),
                activeCanvasId: null,
              }));
            } else {
              console.error('Failed to save to API', e);
            }
          }
        }

        set({ isSaving: false });
      },
    }),
    {
      name: 'workspace-storage',
      version: 5, // v5: Do not persist canvases or activeCanvasId — both loaded fresh from DB.
      // Persisting activeCanvasId caused cross-mentor data leakage: if a user visited
      // ML Mentor, the ML canvas ID was stored in localStorage. When they then visited
      // DevOps Mentor, the stale ML canvas_id was sent to the generation API, which
      // returned ML nodes for the DevOps canvas (cross-tenant data breach).
      partialize: (state) => ({
        // ONLY persist UI preferences — never canvas data or IDs
        workspaceSettings: state.workspaceSettings,
      }),
      migrate: (_persistedState: any, _version: number) => {
        // Clear all pre-v5 state — canvas data will be re-loaded from DB on next visit.
        const settings = _persistedState?.workspaceSettings;
        return {
          activeCanvasId: null,
          canvases: [],
          ...(settings ? { workspaceSettings: settings } : {}),
        };
      },
    }
  )
);
