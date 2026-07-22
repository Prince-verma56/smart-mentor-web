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
  mentorId: string;
  title: string;
  type: ResourceType;
  url?: string;
  content?: string; // for notes, code snippets
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateResource {
  mentorId: string;
  title: string;
  type: ResourceType;
  url?: string;
  content?: string;
  tags?: string[];
}
