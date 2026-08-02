"use client";

import { useEffect } from 'react';
import { useWorkspaceStore } from '@/stores/learningUniverseStore';

/**
 * Mounts in the layout and calls initWorkspace once per mentorId.
 * This ensures canvases are hydrated from the server on every page
 * in the learning-universe section.
 */
export function WorkspaceInitializer({ mentorId }: { mentorId: string }) {
  const initWorkspace = useWorkspaceStore(s => s.initWorkspace);
  const isInitializing = useWorkspaceStore(s => s.isInitializing);

  useEffect(() => {
    if (!mentorId || isInitializing) return;
    initWorkspace(mentorId);
  // Only re-run when mentorId changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mentorId]);

  return null;
}
