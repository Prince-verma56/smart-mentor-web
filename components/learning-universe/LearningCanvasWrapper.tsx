"use client";

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useWorkspaceStore } from '@/stores/learningUniverseStore';
import { fetchCanvasById } from '@/lib/api/canvasApi';

const LearningCanvas = dynamic(
  () => import('./LearningCanvas').then((mod) => mod.LearningCanvas),
  { ssr: false, loading: () => <div className="w-full h-full bg-transparent flex items-center justify-center text-muted-foreground text-sm">Loading Canvas...</div> }
);

export function LearningCanvasWrapper({ mentorId, slug }: { mentorId: string, slug?: string }) {
  const activeCanvasId = useWorkspaceStore(s => s.activeCanvasId);
  const setActiveCanvasId = useWorkspaceStore(s => s.setActiveCanvasId);
  const allCanvases = useWorkspaceStore(s => s.canvases);
  const addCanvas = useWorkspaceStore(s => s.addCanvas);
  const isWorkspaceInitializing = useWorkspaceStore(s => s.isInitializing);

  // CRITICAL: scope all canvas lookups to THIS mentor only.
  // workspaceStore.canvases holds canvases for ALL mentors together.
  const canvases = allCanvases.filter(c => c.mentor_id === mentorId);

  // Guard against infinite retry: once we've attempted to resolve a canvas for this
  // mentorId + slug combination, we don't retry until those inputs change.
  const attemptedRef = useRef<string | null>(null);

  useEffect(() => {
    if (isWorkspaceInitializing) return;

    const key = `${mentorId}:${slug ?? '_root'}`;

    if (!slug) {
      // ── Root learning-universe page — activate the official roadmap canvas ──
      const official = canvases.find(c => c.is_official_roadmap);
      if (official) {
        if (official.nodes === undefined) {
          if (attemptedRef.current === key) return;
          attemptedRef.current = key;
          fetchCanvasById(official.id).then(fullCanvas => {
            if (fullCanvas?.id) {
              addCanvas(fullCanvas);
              setActiveCanvasId(fullCanvas.id);
            }
          });
        } else {
          if (activeCanvasId !== official.id) {
            setActiveCanvasId(official.id);
          }
          attemptedRef.current = key;
        }
        return;
      }

      // No official canvas yet AND we haven't attempted creation for this key yet
      if (attemptedRef.current === key) return; // already tried — don't loop
      attemptedRef.current = key;

      // Delegate to initWorkspace — it creates a local canvas when the API is down
      useWorkspaceStore.getState().initWorkspace(mentorId);
      return;
    }

    // ── Slug-based canvas route ──
    const found = canvases.find(c => c.slug === slug);
    if (found) {
      if (found.nodes === undefined) {
        if (attemptedRef.current === key) return;
        attemptedRef.current = key;
        fetchCanvasById(found.id).then(fullCanvas => {
          if (fullCanvas?.id) {
            addCanvas(fullCanvas);
            setActiveCanvasId(fullCanvas.id);
          }
        });
      } else {
        if (activeCanvasId !== found.id) {
          setActiveCanvasId(found.id);
        }
      }
      return;
    }

    // Canvas not in store yet — only attempt fetch once per key
    if (attemptedRef.current === key) return;
    attemptedRef.current = key;

    fetchCanvasById(slug).then(canvas => {
      if (canvas?.id) {
        addCanvas(canvas);
        setActiveCanvasId(canvas.id);
      }
    }).catch(err => {
      console.warn('[LearningCanvasWrapper] Failed to fetch canvas by slug:', err);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, canvases, isWorkspaceInitializing]);

  // Cleanup is fully handled by setActiveCanvasId in workspaceStore.
  // We no longer need an artificial mentor-level wipe here, which caused race conditions.

  // Reset attempt guard on navigation so new mentor/slug combos work correctly
  useEffect(() => {
    attemptedRef.current = null;
  }, [mentorId, slug]);

  // Determine if the current active canvas is the official roadmap
  const activeCanvas = canvases.find(c => c.id === activeCanvasId);
  const isOfficialRoadmap = activeCanvas?.is_official_roadmap === true;

  return <LearningCanvas key={activeCanvasId || 'empty'} mentorId={mentorId} isOfficialRoadmap={isOfficialRoadmap} />;
}
