"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText, Upload, Bookmark, ChevronRight, Loader2,
  Image as ImageIcon, MoreVertical, Trash2, Sparkles,
  Download, AlertCircle, Search, SlidersHorizontal,
  FileCode, FileJson, FileAudio, FileVideo, Brain,
  BookOpen, RefreshCw, CheckCircle2, Clock, Layers
} from "lucide-react";
import type { Resource } from "@/types/resource";
import { getResources, deleteResource } from "@/lib/resources";
import { toast } from "sonner";
import { ResourceDropzone } from "./ResourceDropzone";
import { ResourcePreviewModal } from "./ResourcePreviewModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface ResourcePanelProps {
  mentorId: string;
}

// Detect file category
function detectCategory(type: string, name: string) {
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  if (type === "application/pdf" || name.toLowerCase().endsWith(".pdf")) return "pdf";
  if (type === "text/markdown" || name.toLowerCase().endsWith(".md")) return "markdown";
  if (type === "application/json" || name.toLowerCase().endsWith(".json")) return "json";
  const codeExts = [".js", ".ts", ".tsx", ".jsx", ".py", ".go", ".rs", ".java", ".cpp", ".c", ".sh", ".yaml", ".yml"];
  if (codeExts.some((ext) => name.toLowerCase().endsWith(ext))) return "code";
  return "document";
}

function ResourceIcon({ type, name, size = "sm" }: { type: string; name: string; size?: "sm" | "lg" }) {
  const category = detectCategory(type, name);
  const cls = size === "lg" ? "h-6 w-6" : "h-4 w-4";
  switch (category) {
    case "image": return <ImageIcon className={`${cls} text-purple-400`} />;
    case "pdf": return <FileText className={`${cls} text-red-400`} />;
    case "markdown": return <BookOpen className={`${cls} text-blue-400`} />;
    case "json": return <FileJson className={`${cls} text-yellow-400`} />;
    case "code": return <FileCode className={`${cls} text-emerald-400`} />;
    case "audio": return <FileAudio className={`${cls} text-pink-400`} />;
    case "video": return <FileVideo className={`${cls} text-orange-400`} />;
    default: return <FileText className={`${cls} text-muted-foreground`} />;
  }
}

const STATUS_LABEL: Record<string, string> = {
  UPLOADING: "Uploading", UPLOADED: "Uploaded", STORED: "Stored",
  PROCESSING: "Processing", TEXT_EXTRACTION: "Extracting", CHUNKING: "Chunking",
  EMBEDDING: "Embedding", INDEXING: "Indexing", READY: "Ready for AI", FAILED: "Failed",
};
const STATUS_CLASS: Record<string, string> = {
  UPLOADING: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  UPLOADED: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  STORED: "text-gray-400 bg-gray-500/10 border-gray-500/20",
  PROCESSING: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  TEXT_EXTRACTION: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  CHUNKING: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  EMBEDDING: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  INDEXING: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  READY: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  FAILED: "text-red-400 bg-red-500/10 border-red-500/20",
};
const ACTIVE_STATUSES = new Set(["UPLOADING", "PROCESSING", "TEXT_EXTRACTION", "CHUNKING", "EMBEDDING", "INDEXING"]);

// Thumbnail preview for image resources
function ImageThumbnail({ url, name }: { url?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) {
    return (
      <div className="h-10 w-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
        <ImageIcon className="h-5 w-5 text-purple-400" />
      </div>
    );
  }
  return (
    <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 border border-white/[0.06]">
      <img
        src={url}
        alt={name}
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

const UPCOMING_TOPICS = [
  "Suspense & Error Boundaries",
  "Server Actions",
  "Route Handlers",
  "Middleware",
  "Image Optimization",
];

export function ResourcePanel({ mentorId }: ResourcePanelProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name" | "status">("date");
  const [activeTab, setActiveTab] = useState<"all" | "ready" | "images" | "documents">("all");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);

  const loadResources = async () => {
    setLoadError(false);
    setIsLoading(true);
    try {
      const data = await getResources(mentorId);
      setResources(data);
    } catch (err) {
      console.error("Failed to load resources", err);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [mentorId]);

  const handleDelete = async (id: string) => {
    try {
      await deleteResource(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
      toast.success("Resource deleted");
      if (previewResource?.id === id) setPreviewResource(null);
    } catch {
      toast.error("Failed to delete resource");
    }
  };

  const handleUploadSuccess = (resource: Resource) => {
    setResources((prev) => [resource, ...prev]);
    toast.success(`${resource.name} uploaded`);
  };

  const tabFiltered = useMemo(() => {
    return resources.filter((r) => {
      const cat = detectCategory(r.type, r.name);
      if (activeTab === "ready") return (r.status || "").toUpperCase() === "READY";
      if (activeTab === "images") return cat === "image";
      if (activeTab === "documents") return ["pdf", "markdown", "document", "json", "code"].includes(cat);
      return true;
    });
  }, [resources, activeTab]);

  const filteredResources = useMemo(() => {
    return tabFiltered
      .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "status") return (a.status || "").localeCompare(b.status || "");
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [tabFiltered, search, sortBy]);

  // Derived counts for tab badges
  const counts = useMemo(() => ({
    all: resources.length,
    ready: resources.filter((r) => (r.status || "").toUpperCase() === "READY").length,
    images: resources.filter((r) => detectCategory(r.type, r.name) === "image").length,
    documents: resources.filter((r) => ["pdf", "markdown", "document", "json", "code"].includes(detectCategory(r.type, r.name))).length,
  }), [resources]);

  return (
    <>
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">

          {/* Knowledge Stats Row */}
          {resources.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 flex flex-col items-center justify-center gap-1">
                <Layers className="h-4 w-4 text-emerald-500" />
                <span className="text-lg font-bold text-white/90">{resources.length}</span>
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Files</span>
              </div>
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 flex flex-col items-center justify-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-lg font-bold text-white/90">{counts.ready}</span>
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Indexed</span>
              </div>
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 flex flex-col items-center justify-center gap-1">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-lg font-bold text-white/90">{resources.filter(r => ACTIVE_STATUSES.has((r.status || "").toUpperCase())).length}</span>
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Processing</span>
              </div>
            </div>
          )}

          {/* Upcoming Topics */}
          <Card className="rounded-[20px] border border-white/[0.05] bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-white/90">Upcoming Topics</CardTitle>
            </CardHeader>
            <CardContent className="pb-4 space-y-1">
              {UPCOMING_TOPICS.map((topic, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-white/[0.04] transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-emerald-500/50 w-4">{i + 1}.</span>
                    <span className="text-white/80">{topic}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Resources Knowledge Workspace */}
          <Card className="rounded-[20px] border border-white/[0.05] bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <CardHeader className="pb-3 pt-4">
              {/* Top row: Title + Upload */}
              <div className="flex items-center justify-between mb-3">
                <CardTitle className="text-sm font-medium text-white/90">
                  Knowledge Base{" "}
                  <span className="text-muted-foreground font-normal ml-1">({resources.length})</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:text-emerald-300 rounded-full px-3"
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload
                </Button>
              </div>

              {/* Search + Sort */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search files..."
                    className="pl-8 h-8 text-xs bg-white/[0.02] border-white/[0.06] focus:border-emerald-500/30 rounded-lg"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/[0.1] shrink-0">
                      <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36 bg-[#030712] border-white/[0.1]">
                    <DropdownMenuItem className={`cursor-pointer text-xs ${sortBy === "date" ? "text-emerald-400" : ""}`} onClick={() => setSortBy("date")}>Newest first</DropdownMenuItem>
                    <DropdownMenuItem className={`cursor-pointer text-xs ${sortBy === "name" ? "text-emerald-400" : ""}`} onClick={() => setSortBy("name")}>Name A–Z</DropdownMenuItem>
                    <DropdownMenuItem className={`cursor-pointer text-xs ${sortBy === "status" ? "text-emerald-400" : ""}`} onClick={() => setSortBy("status")}>By status</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Tabs: use a simple button-based tab row since base-ui Tabs has different API */}
              <div className="flex items-center gap-1 mt-2 flex-wrap">
                {(["all", "ready", "images", "documents"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`h-6 text-[10px] px-2.5 rounded-md capitalize transition-all ${
                      activeTab === tab
                        ? "bg-white/[0.12] text-white/90 font-medium"
                        : "text-muted-foreground hover:text-white/70 hover:bg-white/[0.05]"
                    }`}
                  >
                    {tab} <span className="opacity-60 ml-0.5">{counts[tab]}</span>
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="pb-4">
              {/* Loading skeleton */}
              {isLoading ? (
                <div className="space-y-2.5 py-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-14 rounded-xl bg-white/[0.02] animate-pulse" />
                  ))}
                </div>
              ) : loadError ? (
                <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                  <AlertCircle className="h-8 w-8 text-red-400/50" />
                  <p className="text-sm text-muted-foreground">Failed to load resources</p>
                  <Button variant="ghost" size="sm" className="gap-2 text-xs" onClick={loadResources}>
                    <RefreshCw className="h-3.5 w-3.5" /> Retry
                  </Button>
                </div>
              ) : resources.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-white/[0.06] rounded-xl bg-white/[0.01] cursor-pointer hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                    <Upload className="h-6 w-6 text-emerald-400" />
                  </div>
                  <p className="text-sm font-medium text-white/80">Build your knowledge base</p>
                  <p className="text-[11px] text-muted-foreground mt-1 max-w-[200px]">
                    Upload PDFs, notes, images or code files. The AI will learn from them.
                  </p>
                  <Button variant="ghost" size="sm" className="mt-4 text-xs text-emerald-400 hover:text-emerald-300">
                    Click to upload
                  </Button>
                </div>
              ) : filteredResources.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                  <Search className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No results for "{search}"</p>
                  <button className="text-xs text-emerald-400 hover:underline" onClick={() => setSearch("")}>
                    Clear search
                  </button>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  <div className="space-y-2">
                    {filteredResources.map((r) => {
                      const statusKey = (r.status || "STORED").toUpperCase();
                      const isActive = ACTIVE_STATUSES.has(statusKey);
                      const isImage = r.type.startsWith("image/");
                      return (
                        <motion.div
                          key={r.id}
                          layout
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.97 }}
                          className="group flex items-center gap-3 rounded-xl p-2.5 border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.1] transition-all cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]"
                          onClick={() => setPreviewResource(r)}
                        >
                          {/* Thumbnail or Icon */}
                          {isImage && r.previewUrl ? (
                            <ImageThumbnail url={r.previewUrl} name={r.name} />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                              <ResourceIcon type={r.type} name={r.name} />
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-white/85 truncate group-hover:text-emerald-400 transition-colors leading-snug">
                              {r.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-muted-foreground">
                                {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-[8px] uppercase tracking-wider h-3.5 px-1 flex items-center gap-0.5 shrink-0 ${STATUS_CLASS[statusKey] || STATUS_CLASS.STORED}`}
                              >
                                {isActive && <span className="h-1 w-1 rounded-full bg-current animate-pulse shrink-0" />}
                                {STATUS_LABEL[statusKey] || r.status}
                              </Badge>
                            </div>
                          </div>

                          {/* Actions */}
                          <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/[0.1]">
                                  <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 bg-[#030712] border-white/[0.1]">
                                <DropdownMenuItem className="gap-2 cursor-pointer text-sm" onClick={() => setPreviewResource(r)}>
                                  <FileText className="h-4 w-4 text-muted-foreground" /> Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 cursor-pointer text-sm text-emerald-400 focus:text-emerald-300" disabled={statusKey !== "READY"}>
                                  <Sparkles className="h-4 w-4" /> Ask AI
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 cursor-pointer text-sm text-emerald-400 focus:text-emerald-300" disabled={statusKey !== "READY"}>
                                  <Brain className="h-4 w-4" /> Generate Notes
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/[0.05]" />
                                  {r.previewUrl && (
                                    <DropdownMenuItem className="p-0 cursor-pointer text-sm">
                                      <a
                                        href={r.previewUrl}
                                        download={r.name}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 w-full px-1.5 py-1 text-white/90 hover:text-white"
                                      >
                                        <Download className="h-4 w-4 text-muted-foreground" /> Download
                                      </a>
                                    </DropdownMenuItem>
                                  )}
                                <DropdownMenuItem
                                  className="text-red-400 focus:text-red-300 focus:bg-red-400/10 cursor-pointer gap-2 text-sm"
                                  onClick={() => handleDelete(r.id)}
                                >
                                  <Trash2 className="h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </AnimatePresence>
              )}
            </CardContent>
          </Card>

          {/* Bookmarks */}
          <Card className="rounded-[20px] border border-white/[0.05] bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-white/90">
                <Bookmark className="h-4 w-4 text-emerald-500" />
                Bookmarks
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex flex-col items-center justify-center py-5 text-center">
                <p className="text-xs text-muted-foreground max-w-[200px]">
                  Save important messages as bookmarks during sessions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#030712] border-white/[0.1] p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl">Upload to Knowledge Base</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Supported: PDF, TXT, MD, PNG, JPG, WEBP, GIF (max 10MB)
            </p>
          </DialogHeader>
          <div className="p-6 pt-2">
            <ResourceDropzone
              mentorId={mentorId}
              onUploadSuccess={handleUploadSuccess}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <ResourcePreviewModal
        resource={previewResource}
        open={!!previewResource}
        onOpenChange={(open) => !open && setPreviewResource(null)}
        onDelete={handleDelete}
      />
    </>
  );
}
