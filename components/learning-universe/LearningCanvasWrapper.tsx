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
  const canvases = useWorkspaceStore(s => s.canvases);
  const addCanvas = useWorkspaceStore(s => s.addCanvas);
  const isWorkspaceInitializing = useWorkspaceStore(s => s.isInitializing);

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
        // Canvas exists — just make it active (idempotent)
        if (activeCanvasId !== official.id) {
          setActiveCanvasId(official.id);
        }
        // Reset the attempt guard so re-renders don't re-create
        attemptedRef.current = key;
        return;
      }

      // No official canvas yet AND we haven't attempted creation for this key yet
      if (attemptedRef.current === key) return; // already tried — don't loop
      attemptedRef.current = key;

      // workspaceStore.initWorkspace already creates a local canvas when the API is
      // down. If we reach here it means initWorkspace hasn't run yet or the canvas
      // list is truly empty — let initWorkspace handle it by triggering it again.
      // We do NOT call the canvas API directly here to avoid the infinite-retry loop.
      useWorkspaceStore.getState().initWorkspace(mentorId);
      return;
    }

    // ── Slug-based canvas route ──
    // Slug-only lookup: never fall back to c.id === slug (fake IDs would match)
    const found = canvases.find(c => c.slug === slug);
    if (found) {
      if (activeCanvasId !== found.id) {
        setActiveCanvasId(found.id);
      }
      return;
    }

    // Canvas not in store yet (e.g. browser refresh, deep link)
    // Only attempt once per key to avoid hammering API
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
  // canvases + isWorkspaceInitializing are the reactive triggers; slug and mentorId
  // reset attemptedRef below so the effect re-runs on navigation.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, canvases, isWorkspaceInitializing]);

  // Reset attempt guard on navigation so new mentor/slug combos work correctly
  useEffect(() => {
    attemptedRef.current = null;
  }, [mentorId, slug]);

  // Determine if the current active canvas is the official roadmap
  const activeCanvas = canvases.find(c => c.id === activeCanvasId);
  const isOfficialRoadmap = activeCanvas?.is_official_roadmap === true;

  return <LearningCanvas key={activeCanvasId || 'empty'} mentorId={mentorId} isOfficialRoadmap={isOfficialRoadmap} />;
}
