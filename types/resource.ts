// ─── Resource Types ───────────────────────────────────────────────────────────

export type ResourceType =
  | "pdf"
  | "note"
  | "code"
  | "url"
  | "youtube"
  | "github"
  | "image"
  | "article"
  | "flashcard"
  | "cheatsheet"
  | "exercise";

export interface Resource {
  id: string;
  mentor_id: string;
  name: string;
  type: string; // The backend uses a generic string or specific mime types, but we can treat it as string
  status: "processing" | "ready" | "failed" | "uploaded" | "uploading" | string;
  storage_url: string;
  previewUrl?: string; // Appended by upload response sometimes, but not in DB model usually
  publicUrl?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateResource {
  mentorId: string;
  title: string;
  type: ResourceType;
  url?: string;
  content?: string;
  tags?: string[];
}
