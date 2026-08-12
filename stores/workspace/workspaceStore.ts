import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LayoutMode, ThemeMode } from './types';
import { fetchCanvases, updateCanvasState, deleteCanvas, duplicateCanvas as duplicateCanvasApi, archiveCanvas as archiveCanvasApi, CanvasNotFoundError } from '@/lib/api/canvasApi';

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

        // ── Early-return guard ──────────────────────────────────────────────────
        // If we already have THIS mentor's official canvas in local state, check
        // whether the active canvas is already pointing at one of this mentor's
        // canvases. If yes, skip the API round-trip entirely.
        const mentorCanvases = existing.filter((c: any) => c.mentor_id === mentorId);
        // Only use the early-return guard if canvases are server-backed (not local-only)
        const hasOfficialForMentor = mentorCanvases.some((c: any) => c.is_official_roadmap && !c._local);

        if (hasOfficialForMentor) {
          const currentActiveId = get().activeCanvasId;
          const isOnThisMentor = currentActiveId &&
            mentorCanvases.some((c: any) => c.id === currentActiveId && !c._local);

          if (isOnThisMentor) {
            return; // Already showing the right mentor's canvas — nothing to do
          }

          // We have this mentor's canvases but activeCanvasId points elsewhere
          // (e.g. user navigated from a different mentor). Switch to this mentor.
          const official = mentorCanvases.find((c: any) => c.is_official_roadmap && !c._local);
          if (official) {
            get().setActiveCanvasId(official.id);
            return;
          }
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
          const isCurrentValidForMentor =
            currentActiveId &&
            UUID_RE.test(currentActiveId) &&
            serverCanvases.some((c: any) => c.id === currentActiveId);

          if (!isCurrentValidForMentor) {
            const official = serverCanvases.find((c: any) => c.is_official_roadmap);
            const targetId = official ? official.id : (serverCanvases[0]?.id || null);
            if (targetId) {
              // Use setActiveCanvasId so canvasStore nodes/edges are properly reset
              get().setActiveCanvasId(targetId);
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
            // Disable autosave during the switch to prevent the empty slate from
            // being saved before the new canvas's nodes are loaded
            canvasStore.getState().setAutosaveEnabled(false);
            canvasStore.getState().resetUniverse();
            canvasStore.getState().setNodes(nextCanvas.nodes || []);
            canvasStore.getState().setEdges(nextCanvas.edges || []);
            if (nextCanvas.viewport) {
              canvasStore.getState().setViewport(nextCanvas.viewport);
            }
            if (nextCanvas.history) {
              canvasStore.setState({ history: nextCanvas.history });
            }
            // Re-enable autosave after a tick so triggerAutosave from setNodes/setEdges
            // is already scheduled but the enable flag is now true for future edits
            setTimeout(() => {
              canvasStore.getState().setAutosaveEnabled(true);
            }, 100);
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
        set({ isSaving: true });
        const state = get();
        const activeId = state.activeCanvasId;

        // Only save if activeId is a real UUID — never a mock or temp string
        if (activeId && UUID_RE.test(activeId)) {
          try {
            const canvasStore = require('./canvasStore').useCanvasStore;
            const { nodes, edges, viewport } = canvasStore.getState();
            await updateCanvasState(activeId, { nodes, edges, viewport });
          } catch (e: any) {
            if (e instanceof CanvasNotFoundError) {
              // Canvas was created offline and was never saved to backend.
              // Remove it from store so initWorkspace creates a real one.
              console.warn(`[WorkspaceStore] Removing ghost local canvas ${activeId} — not found on backend.`);
              set((state) => ({
                canvases: state.canvases.filter(c => c.id !== activeId),
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
      version: 3, // v3: multi-mentor store (canvases from all mentors coexist)
      migrate: (_persistedState, _version) => {
        // Clear any pre-v3 state — nodes will be re-generated on next visit
        return { activeCanvasId: null, canvases: [] };
      },
    }
  )
);
