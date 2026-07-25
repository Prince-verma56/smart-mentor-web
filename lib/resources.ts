import apiClient from "./axios";
import { Resource } from "@/types/resource";

export async function uploadResource(mentorId: string, file: File): Promise<Resource> {
  const formData = new FormData();
  formData.append("mentor_id", mentorId);
  formData.append("file", file);

  const response = await apiClient.post<Resource>("/api/v1/resources/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function getResources(mentorId: string): Promise<Resource[]> {
  const response = await apiClient.get<Resource[]>("/api/v1/resources", {
    params: {
      mentor_id: mentorId,
    },
  });

  return response.data;
}
