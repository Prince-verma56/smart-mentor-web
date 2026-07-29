import apiClient from "./axios";
import { Resource } from "@/types/resource";

export async function uploadResource(
  mentorId: string, 
  file: File, 
  onProgress?: (progressEvent: any) => void,
  signal?: AbortSignal
): Promise<Resource> {
  const formData = new FormData();
  formData.append("mentor_id", mentorId);
  formData.append("file", file);

  const response = await apiClient.post<any>("/api/v1/resources/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: onProgress,
    signal,
  });

  const data = response.data;
  return {
    id: data.resourceId,
    mentor_id: mentorId,
    name: data.fileName,
    type: data.mimeType,
    status: data.status,
    storage_url: data.storagePath,
    previewUrl: data.previewUrl,
    publicUrl: data.publicUrl,
    created_at: data.createdAt,
    updated_at: data.createdAt,
  };
}

export async function getResources(mentorId: string): Promise<Resource[]> {
  const response = await apiClient.get<any[]>("/api/v1/resources", {
    params: {
      mentor_id: mentorId,
    },
  });

  // Map backend snake_case to our Resource interface
  return response.data.map((r: any) => ({
    id: r.id,
    mentor_id: r.mentor_id,
    name: r.name,
    type: r.type,
    status: r.status,
    storage_url: r.storage_url,
    previewUrl: r.preview_url || undefined,
    error_message: r.error_message || undefined,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));
}

export async function getPreviewUrl(resourceId: string): Promise<string | null> {
  try {
    const response = await apiClient.get<{ preview_url: string }>(`/api/v1/resources/${resourceId}/preview-url`);
    return response.data.preview_url || null;
  } catch {
    return null;
  }
}

export async function deleteResource(resourceId: string): Promise<void> {
  await apiClient.delete(`/api/v1/resources/${resourceId}`);
}
