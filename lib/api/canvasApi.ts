/**
 * canvasApi.ts
 *
 * All API calls go through the Next.js proxy at /api/canvas/...
 * The proxy (app/api/canvas/[...path]/route.ts) handles authentication
 * server-side via Clerk auth(), so no token reading is needed here.
 * This also eliminates all CORS issues.
 */
import { toast } from 'react-hot-toast';

const BASE = '/api/canvas';

async function handleApiError(response: Response, defaultMessage: string) {
  if (!response.ok) {
    let errorDetail = defaultMessage;
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || defaultMessage;
    } catch {
      // Ignore if no JSON body
    }
    toast.error(errorDetail, { id: 'canvas-api-error' });
    throw new Error(errorDetail);
  }
  return response.json();
}

export const fetchCanvases = async (mentorId: string) => {
  const response = await fetch(`${BASE}/canvases?mentor_id=${mentorId}`, {
    cache: 'no-store',
  });
  return handleApiError(response, 'Failed to fetch canvases');
};

export const fetchCanvasById = async (canvasId: string) => {
  const response = await fetch(`${BASE}/canvas/${canvasId}`);
  return handleApiError(response, 'Failed to fetch canvas');
};

export const createCanvas = async (
  mentorId: string,
  name: string,
  is_official_roadmap: boolean = false
) => {
  const response = await fetch(`${BASE}/canvases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mentor_id: mentorId, name, is_official_roadmap }),
  });
  return handleApiError(response, 'Failed to create canvas');
};

export const updateCanvasState = async (canvasId: string, updates: any) => {
  const response = await fetch(`${BASE}/canvas/${canvasId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return handleApiError(response, 'Failed to update canvas');
};

export const deleteCanvas = async (canvasId: string) => {
  const response = await fetch(`${BASE}/canvas/${canvasId}`, {
    method: 'DELETE',
  });
  return handleApiError(response, 'Failed to delete canvas');
};

export const duplicateCanvas = async (canvasId: string) => {
  const response = await fetch(`${BASE}/canvas/${canvasId}/duplicate`, {
    method: 'POST',
  });
  return handleApiError(response, 'Failed to duplicate canvas');
};

export const archiveCanvas = async (canvasId: string) => {
  const response = await fetch(`${BASE}/canvas/${canvasId}/archive`, {
    method: 'POST',
  });
  return handleApiError(response, 'Failed to archive canvas');
};

export const pinCanvas = async (canvasId: string, pin: boolean) => {
  const response = await fetch(`${BASE}/canvas/${canvasId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_pinned: pin }),
  });
  return handleApiError(response, 'Failed to update pin status');
};

export const shareCanvas = async (canvasId: string) => {
  const response = await fetch(`${BASE}/canvas/${canvasId}/share`, {
    method: 'POST',
  });
  return handleApiError(response, 'Failed to share canvas');
};

/**
 * Silently fetches activity log. Returns [] on any error — never shows error toasts.
 */
export const fetchWorkspaceActivities = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${BASE}/activities`, { cache: 'no-store' });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};
