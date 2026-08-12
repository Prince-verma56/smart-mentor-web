/**
 * canvasApi.ts
 *
 * All API calls go through the Next.js proxy at /api/canvas/...
 * The proxy (app/api/canvas/[...path]/route.ts) handles authentication
 * server-side via Clerk auth(), so no token reading is needed here.
 * This also eliminates all CORS issues.
 *
 * NOTE: All functions return `null` on failure and log to console.
 * They never throw — callers must handle null returns gracefully.
 */

const BASE = '/api/canvas';

/**
 * Parses an API response. Returns the parsed JSON on success.
 * On failure, logs silently and returns null — does NOT throw.
 */
async function handleApiResponse(response: Response, context: string): Promise<any | null> {
  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || errorDetail;
    } catch {
      // Ignore if no JSON body
    }
    console.warn(`[canvasApi] ${context} failed (${response.status}): ${errorDetail}`);
    return null;
  }
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/** Wraps a fetch call, returning null on any network/timeout error. */
async function safeFetch(url: string, options?: RequestInit): Promise<Response | null> {
  try {
    return await fetch(url, options);
  } catch (err: any) {
    console.warn(`[canvasApi] Network error for ${url}:`, err?.message || err);
    return null;
  }
}

/** Returns array of canvases, or throws on failure (so initWorkspace can handle it). */
export const fetchCanvases = async (mentorId: string): Promise<any[]> => {
  const response = await safeFetch(`${BASE}/canvases?mentor_id=${mentorId}`, { cache: 'no-store' });
  if (!response) throw new Error('Canvas service did not respond in time. Please try again.');
  const data = await handleApiResponse(response, 'fetchCanvases');
  if (data === null) throw new Error('Failed to fetch canvases');
  return Array.isArray(data) ? data : [];
};

export const fetchCanvasById = async (canvasId: string): Promise<any | null> => {
  const response = await safeFetch(`${BASE}/canvas/${canvasId}`);
  if (!response) return null;
  return handleApiResponse(response, 'fetchCanvasById');
};

export const createCanvas = async (
  mentorId: string,
  name: string,
  is_official_roadmap: boolean = false
): Promise<any | null> => {
  const response = await safeFetch(`${BASE}/canvases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mentor_id: mentorId, name, is_official_roadmap }),
  });
  if (!response) return null;
  return handleApiResponse(response, 'createCanvas');
};

export const updateCanvasState = async (canvasId: string, updates: any): Promise<any | null> => {
  const response = await safeFetch(`${BASE}/canvas/${canvasId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response) return null;
  return handleApiResponse(response, 'updateCanvasState');
};

export const deleteCanvas = async (canvasId: string): Promise<any | null> => {
  const response = await safeFetch(`${BASE}/canvas/${canvasId}`, { method: 'DELETE' });
  if (!response) return null;
  return handleApiResponse(response, 'deleteCanvas');
};

export const duplicateCanvas = async (canvasId: string): Promise<any | null> => {
  const response = await safeFetch(`${BASE}/canvas/${canvasId}/duplicate`, { method: 'POST' });
  if (!response) return null;
  return handleApiResponse(response, 'duplicateCanvas');
};

export const archiveCanvas = async (canvasId: string): Promise<any | null> => {
  const response = await safeFetch(`${BASE}/canvas/${canvasId}/archive`, { method: 'POST' });
  if (!response) return null;
  return handleApiResponse(response, 'archiveCanvas');
};

export const pinCanvas = async (canvasId: string, pin: boolean): Promise<any | null> => {
  const response = await safeFetch(`${BASE}/canvas/${canvasId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_pinned: pin }),
  });
  if (!response) return null;
  return handleApiResponse(response, 'pinCanvas');
};

export const shareCanvas = async (canvasId: string): Promise<any | null> => {
  const response = await safeFetch(`${BASE}/canvas/${canvasId}/share`, { method: 'POST' });
  if (!response) return null;
  return handleApiResponse(response, 'shareCanvas');
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
