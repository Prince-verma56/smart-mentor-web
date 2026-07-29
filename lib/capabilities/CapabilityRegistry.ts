export type Capability =
  | "chat"
  | "vision"
  | "long_document"
  | "code"
  | "web_search"
  | "ocr"
  | "deep_reasoning"
  | "fast_response"
  | "audio"
  | "video";

export interface CapabilityDef {
  id: Capability;
  name: string;
  description: string;
  icon: string; // lucide icon name
}

export const CapabilityRegistry: Record<Capability, CapabilityDef> = {
  chat: { id: "chat", name: "Auto", description: "Standard conversational model", icon: "Sparkles" },
  fast_response: { id: "fast_response", name: "Fast Response", description: "Low latency, quick answers", icon: "Zap" },
  deep_reasoning: { id: "deep_reasoning", name: "Deep Reasoning", description: "Complex problem solving", icon: "Brain" },
  code: { id: "code", name: "Code Expert", description: "Programming and logic", icon: "Code2" },
  vision: { id: "vision", name: "Vision", description: "Image analysis", icon: "Eye" },
  long_document: { id: "long_document", name: "Long Document", description: "Large context window", icon: "FileText" },
  web_search: { id: "web_search", name: "Web Search", description: "Real-time internet access", icon: "Globe" },
  ocr: { id: "ocr", name: "OCR", description: "Extract text from images/PDFs", icon: "ScanText" },
  audio: { id: "audio", name: "Audio", description: "Speech processing", icon: "Mic" },
  video: { id: "video", name: "Video", description: "Video analysis", icon: "Video" },
};
