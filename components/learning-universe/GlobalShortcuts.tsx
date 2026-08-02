"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceStore } from '@/stores/learningUniverseStore';
import { toast } from 'sonner';

export const GlobalShortcuts = ({ mentorId }: { mentorId: string }) => {
  const router = useRouter();
  const canvases = useWorkspaceStore(s => s.canvases);
  const activeCanvasId = useWorkspaceStore(s => s.activeCanvasId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      // Save: Cmd/Ctrl + S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        useWorkspaceStore.setState({ isSaving: true });
        setTimeout(() => useWorkspaceStore.setState({ isSaving: false }), 1000);
        toast.success('Workspace saved successfully', { duration: 1500 });
      }

      // Workspaces: Cmd/Ctrl + B
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        router.push(`/dashboard/mentors/${mentorId}/learning-universe/workspaces`);
      }

      // Settings: Cmd/Ctrl + ,
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        router.push(`/dashboard/mentors/${mentorId}/learning-universe/settings`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, mentorId]);

  return null;
};
