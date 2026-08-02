"use client";

import React, { useEffect } from 'react';
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

  useEffect(() => {
    if (!slug) {
      // No slug — we are at the learning-universe root, activate official roadmap
      const official = canvases.find(c => c.is_official_roadmap);
      if (official) {
        setActiveCanvasId(official.id);
      }
      return;
    }



    // Slug-only lookup: never fall back to c.id === slug (fake IDs would match)
    const found = canvases.find(c => c.slug === slug);
    if (found) {
      if (activeCanvasId !== found.id) {
        setActiveCanvasId(found.id);
      }
    } else {
      // Canvas not in store yet (e.g. browser refresh, deep link)
      // Fetch by slug from API, then hydrate the store
      fetchCanvasById(slug).then(canvas => {
        if (canvas?.id) {
          addCanvas(canvas);
          setActiveCanvasId(canvas.id);
        }
      }).catch(err => {
        console.error('[LearningCanvasWrapper] Failed to fetch canvas by slug:', err);
      });
    }
  }, [slug, canvases, setActiveCanvasId, addCanvas, activeCanvasId]);

  // Determine if the current active canvas is the official roadmap
  const activeCanvas = canvases.find(c => c.id === activeCanvasId);
  const isOfficialRoadmap = activeCanvas?.is_official_roadmap === true;

  return <LearningCanvas key={activeCanvasId || 'empty'} mentorId={mentorId} isOfficialRoadmap={isOfficialRoadmap} />;
}

