"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export type ResourceStatus = "UPLOADING" | "PROCESSING" | "EXTRACTING" | "CHUNKING" | "EMBEDDING" | "INDEXING" | "READY" | "FAILED" | "ARCHIVED";

export interface ResourceResponse {
  id: string;
  name: string;
  type: string;
  status: ResourceStatus;
  created_at: string;
  error_message?: string;
}

export async function uploadResource(mentorId: string, formData: FormData) {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) throw new Error("Unauthorized");

  const response = await fetch(`${API_URL}/api/v1/resources/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData, // Contains mentor_id and file
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Upload failed: ${err}`);
  }

  revalidatePath(`/dashboard/mentors/${mentorId}/resources`);
  return response.json();
}

export async function getResources(mentorId: string): Promise<ResourceResponse[]> {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) return [];

  const response = await fetch(`${API_URL}/api/v1/resources?mentor_id=${mentorId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Failed to fetch resources");
    return [];
  }

  return response.json();
}

export async function deleteResource(mentorId: string, resourceId: string) {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) throw new Error("Unauthorized");

  const response = await fetch(`${API_URL}/api/v1/resources/${resourceId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete resource");
  }

  revalidatePath(`/dashboard/mentors/${mentorId}/resources`);
  return true;
}
