// ─── Session Types ────────────────────────────────────────────────────────────

export type SessionMode = "conversation" | "live-teaching";
export type SessionStatus = "scheduled" | "active" | "completed" | "cancelled";

export interface Message {
  id: string;
  sessionId?: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  created_at?: string;
  token_count?: number;
  // Extension points for future rich content (code blocks, images)
  metadata?: {
    type?: "text" | "code" | "image" | "explanation";
    language?: string; // for code blocks
    imageUrl?: string;
  };
}

export interface Session {
  id: string;
  mentorId: string;
  userId: string;
  mode: SessionMode;
  status: SessionStatus;
  title?: string;
  startedAt?: string;
  endedAt?: string;
  durationMinutes?: number;
  messages: Message[];
  // Extension point: voice session data (Vapi/ElevenLabs)
  voiceSessionId?: string;
  // Extension point: recording
  recordingUrl?: string;
  topicsCovered: string[];
  notes?: string;
  createdAt: string;
}

// ─── Chat Session (Supabase DB model) ────────────────────────────────────────

export interface ChatSession {
  id: string;
  mentor_id: string;
  user_id: string;
  title: string;
  summary?: string | null;
  created_at: string;
  updated_at: string;
  last_message_at?: string | null;
  message_count: number;
  is_pinned: boolean;
  is_archived: boolean;
}

export interface CreateSession {
  mentorId: string;
  mode: SessionMode;
  title?: string;
}
