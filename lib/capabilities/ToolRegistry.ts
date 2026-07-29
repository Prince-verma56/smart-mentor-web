import { Capability } from "./CapabilityRegistry";

export type ToolId =
  | "web_search"
  | "knowledge_search"
  | "memory_search"
  | "roadmap"
  | "document_qa"
  | "ocr"
  | "quiz"
  | "flashcards"
  | "timeline"
  | "summarize"
  | "explain"
  | "code_review";

export interface ToolDef {
  id: ToolId;
  name: string;
  description: string;
  icon: string;
  capability?: Capability;
  requiresApiKey?: boolean;
  enabled: boolean;
}

export const ToolRegistry: Record<ToolId, ToolDef> = {
  web_search: { id: "web_search", name: "Web Search", description: "Search the live internet", icon: "Globe", capability: "web_search", enabled: true },
  knowledge_search: { id: "knowledge_search", name: "Knowledge Search", description: "Search uploaded resources", icon: "Library", enabled: true },
  memory_search: { id: "memory_search", name: "Memory Search", description: "Search past conversations", icon: "Brain", enabled: true },
  roadmap: { id: "roadmap", name: "Roadmap Context", description: "Use current learning path", icon: "Map", enabled: true },
  document_qa: { id: "document_qa", name: "Document QA", description: "Ask questions about files", icon: "FileText", capability: "long_document", enabled: true },
  ocr: { id: "ocr", name: "OCR", description: "Extract text from images", icon: "ScanText", capability: "ocr", enabled: true },
  quiz: { id: "quiz", name: "Quiz Generator", description: "Test your knowledge", icon: "HelpCircle", enabled: true },
  flashcards: { id: "flashcards", name: "Flashcards", description: "Create study cards", icon: "Layers", enabled: true },
  timeline: { id: "timeline", name: "Timeline", description: "Visualize events", icon: "Clock", enabled: true },
  summarize: { id: "summarize", name: "Summarize", description: "Condense information", icon: "AlignLeft", enabled: true },
  explain: { id: "explain", name: "Explain", description: "Break down complex topics", icon: "Lightbulb", enabled: true },
  code_review: { id: "code_review", name: "Code Review", description: "Analyze source code", icon: "Code2", capability: "code", enabled: true },
};
