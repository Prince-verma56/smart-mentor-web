"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Resource } from "@/types/resource";
import {
  Loader2, FileText, AlertCircle, Download, Trash2, MoreVertical,
  Sparkles, BookOpen, Brain, FlaskConical, BookMarked, RefreshCw, X,
  Image as ImageIcon, FileCode, FileJson, FileAudio, FileVideo
} from "lucide-react";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { getPreviewUrl } from "@/lib/resources";
import { toast } from "sonner";

interface ResourcePreviewModalProps {
  resource: Resource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (id: string) => void;
}

// Detect file category from mime type and filename
function detectCategory(type: string, name: string): "image" | "pdf" | "text" | "markdown" | "json" | "audio" | "video" | "code" | "csv" | "unknown" {
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  if (type === "application/pdf" || name.toLowerCase().endsWith(".pdf")) return "pdf";
  if (type === "text/markdown" || name.toLowerCase().endsWith(".md") || name.toLowerCase().endsWith(".mdx")) return "markdown";
  if (type === "application/json" || name.toLowerCase().endsWith(".json")) return "json";
  const codeExts = [".js", ".ts", ".tsx", ".jsx", ".py", ".go", ".rs", ".java", ".cpp", ".c", ".cs", ".rb", ".sh", ".yaml", ".yml", ".toml", ".xml", ".html", ".css"];
  if (codeExts.some((ext) => name.toLowerCase().endsWith(ext))) return "code";
  if (name.toLowerCase().endsWith(".csv")) return "csv";
  if (type.startsWith("text/")) return "text";
  return "unknown";
}

function categoryIcon(cat: ReturnType<typeof detectCategory>) {
  switch (cat) {
    case "image": return <ImageIcon className="h-5 w-5 text-purple-400" />;
    case "pdf": return <FileText className="h-5 w-5 text-red-400" />;
    case "markdown": return <BookOpen className="h-5 w-5 text-blue-400" />;
    case "json": return <FileJson className="h-5 w-5 text-yellow-400" />;
    case "code": return <FileCode className="h-5 w-5 text-emerald-400" />;
    case "audio": return <FileAudio className="h-5 w-5 text-pink-400" />;
    case "video": return <FileVideo className="h-5 w-5 text-orange-400" />;
    default: return <FileText className="h-5 w-5 text-muted-foreground" />;
  }
}

const STATUS_LABEL: Record<string, string> = {
  UPLOADING: "Uploading",
  UPLOADED: "Uploaded",
  PROCESSING: "Processing",
  TEXT_EXTRACTION: "Extracting Text",
  CHUNKING: "Chunking",
  EMBEDDING: "Generating Embeddings",
  INDEXING: "Indexing",
  READY: "Ready for AI",
  STORED: "Stored",
  FAILED: "Failed",
};
const STATUS_CLASS: Record<string, string> = {
  UPLOADING: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  UPLOADED: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  PROCESSING: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  TEXT_EXTRACTION: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  CHUNKING: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  EMBEDDING: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  INDEXING: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  READY: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  STORED: "text-gray-400 bg-gray-500/10 border-gray-500/20",
  FAILED: "text-red-400 bg-red-500/10 border-red-500/20",
};

export function ResourcePreviewModal({ resource, open, onOpenChange, onDelete }: ResourcePreviewModalProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string | undefined>(undefined);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [urlFetchError, setUrlFetchError] = useState(false);

  // For text/md/json/code/csv: fetched text content
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [textError, setTextError] = useState(false);

  // For PDF: blob URL to avoid Content-Disposition:attachment
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState(false);

  const blobUrlRef = useRef<string | null>(null);

  const category = resource ? detectCategory(resource.type, resource.name) : "unknown";
  const statusKey = (resource?.status || "STORED").toUpperCase();

  // Step 1: Resolve signed URL
  useEffect(() => {
    if (!resource || !open) {
      setResolvedUrl(undefined);
      setUrlFetchError(false);
      return;
    }

    // Reset content state when resource changes
    setTextContent(null);
    setTextError(false);
    setPdfBlobUrl(null);
    setPdfError(false);

    if (resource.previewUrl) {
      setResolvedUrl(resource.previewUrl);
    } else if (resource.storage_url) {
      setIsFetchingUrl(true);
      setUrlFetchError(false);
      getPreviewUrl(resource.id)
        .then((url) => {
          if (url) {
            setResolvedUrl(url);
          } else {
            setUrlFetchError(true);
          }
        })
        .catch(() => setUrlFetchError(true))
        .finally(() => setIsFetchingUrl(false));
    } else {
      setUrlFetchError(true);
    }

    return () => {
      // Revoke old blob URL on cleanup
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [resource?.id, open]);

  // Step 2a: Fetch text content for text-based types
  useEffect(() => {
    if (!resolvedUrl || !resource || !open) return;
    const isTextBased = ["text", "markdown", "json", "code", "csv"].includes(category);
    if (!isTextBased) return;

    setIsLoadingText(true);
    setTextError(false);
    setTextContent(null);

    fetch(resolvedUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => setTextContent(text))
      .catch((err) => {
        console.error("Failed to fetch text content:", err);
        setTextError(true);
      })
      .finally(() => setIsLoadingText(false));
  }, [resolvedUrl, category, open]);

  // Step 2b: Fetch PDF as blob to bypass Content-Disposition: attachment
  useEffect(() => {
    if (!resolvedUrl || !resource || !open || category !== "pdf") return;

    setIsLoadingPdf(true);
    setPdfError(false);
    setPdfBlobUrl(null);

    fetch(resolvedUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setPdfBlobUrl(url);
      })
      .catch((err) => {
        console.error("Failed to fetch PDF:", err);
        setPdfError(true);
      })
      .finally(() => setIsLoadingPdf(false));
  }, [resolvedUrl, category, open]);

  // Cleanup blob on close
  useEffect(() => {
    if (!open && blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
      setPdfBlobUrl(null);
    }
  }, [open]);

  const handleRefreshUrl = () => {
    if (!resource) return;
    setResolvedUrl(undefined);
    setUrlFetchError(false);
    setIsFetchingUrl(true);
    getPreviewUrl(resource.id)
      .then((url) => {
        if (url) {
          setResolvedUrl(url);
          toast.success("Preview URL refreshed");
        } else {
          setUrlFetchError(true);
          toast.error("Could not refresh preview URL");
        }
      })
      .catch(() => { setUrlFetchError(true); toast.error("Could not refresh preview URL"); })
      .finally(() => setIsFetchingUrl(false));
  };

  if (!resource) return null;

  const isProcessing = ["UPLOADING", "PROCESSING", "TEXT_EXTRACTION", "CHUNKING", "EMBEDDING", "INDEXING"].includes(statusKey);
  const isReady = statusKey === "READY";

  const renderPreview = () => {
    if (isFetchingUrl) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-sm">Generating secure preview link...</p>
        </div>
      );
    }

    if (urlFetchError) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-muted-foreground p-6 text-center">
          <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">Preview Unavailable</p>
            <p className="text-sm mt-1 max-w-[280px]">
              Could not generate a secure preview link. The file may still be processing, or the storage service is temporarily unavailable.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefreshUrl} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Try Again
          </Button>
        </div>
      );
    }

    if (isProcessing && !resolvedUrl) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-muted-foreground p-6 text-center">
          <div className="h-16 w-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">Processing Your File</p>
            <p className="text-sm mt-1 max-w-[280px]">
              {STATUS_LABEL[statusKey] || "Processing"} — this usually takes a few seconds.
            </p>
          </div>
        </div>
      );
    }

    if (!resolvedUrl) return null;

    switch (category) {
      case "image":
        return (
          <div className="w-full h-full flex items-center justify-center p-6 bg-[#0a0a0a]">
            <img
              src={resolvedUrl}
              alt={resource.name}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        );

      case "pdf":
        if (isLoadingPdf) {
          return (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-red-400" />
              <p className="text-sm">Loading PDF...</p>
            </div>
          );
        }
        if (pdfError) {
          return (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-muted-foreground">
              <AlertCircle className="h-10 w-10 text-red-400/60" />
              <div>
                <p className="text-base font-semibold text-foreground">PDF Preview Failed</p>
                <p className="text-sm mt-1 max-w-[300px]">The PDF couldn't be loaded. This may be a CORS or network issue.</p>
              </div>
              <Button variant="outline" asChild>
                <a href={resolvedUrl} target="_blank" rel="noopener noreferrer" download>Download PDF Instead</a>
              </Button>
            </div>
          );
        }
        if (pdfBlobUrl) {
          return (
            <iframe
              src={`${pdfBlobUrl}#toolbar=1&navpanes=0`}
              className="w-full h-full border-0"
              title={resource.name}
            />
          );
        }
        return null;

      case "video":
        return (
          <div className="w-full h-full flex items-center justify-center p-4 bg-black">
            <video
              src={resolvedUrl}
              controls
              className="max-w-full max-h-full rounded-lg shadow-2xl"
              style={{ maxHeight: "calc(85vh - 100px)" }}
            />
          </div>
        );

      case "audio":
        return (
          <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-8 bg-gradient-to-b from-[#0a0a0a] to-[#030712]">
            <div className="h-24 w-24 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
              <FileAudio className="h-10 w-10 text-pink-400" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-white/90">{resource.name}</p>
              <p className="text-sm text-muted-foreground mt-1">Audio file</p>
            </div>
            <audio src={resolvedUrl} controls className="w-full max-w-md" />
          </div>
        );

      case "markdown":
        if (isLoadingText) {
          return (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          );
        }
        if (textError) return renderTextError();
        return (
          <div className="w-full h-full bg-[#0d1117] overflow-auto">
            <div className="p-8 max-w-4xl mx-auto">
              {textContent ? (
                <MarkdownRenderer content={textContent} />
              ) : (
                <p className="text-muted-foreground text-sm">No content</p>
              )}
            </div>
          </div>
        );

      case "json":
        if (isLoadingText) return <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
        if (textError) return renderTextError();
        return (
          <div className="w-full h-full bg-[#0d1117] overflow-auto">
            <pre className="p-8 text-xs font-mono text-emerald-300 leading-relaxed whitespace-pre-wrap break-all">
              {textContent ? (() => { try { return JSON.stringify(JSON.parse(textContent), null, 2); } catch { return textContent; } })() : ""}
            </pre>
          </div>
        );

      case "code":
      case "csv":
      case "text":
        if (isLoadingText) return <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
        if (textError) return renderTextError();
        return (
          <div className="w-full h-full bg-[#0d1117] overflow-auto">
            <pre className="p-8 text-xs font-mono text-gray-300 leading-relaxed whitespace-pre-wrap">
              {textContent}
            </pre>
          </div>
        );

      default:
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-muted-foreground">
            <div className="h-16 w-16 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center">
              <FileText className="h-8 w-8 opacity-40" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">Preview Not Available</p>
              <p className="text-sm mt-1 max-w-[300px]">
                This file type ({resource.type || "unknown"}) cannot be previewed in the browser.
              </p>
            </div>
            <Button variant="outline" asChild>
              <a href={resolvedUrl} target="_blank" rel="noopener noreferrer" download>
                <Download className="h-4 w-4 mr-2" /> Download File
              </a>
            </Button>
          </div>
        );
    }
  };

  function renderTextError() {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-muted-foreground">
        <AlertCircle className="h-10 w-10 text-red-400/60" />
        <div>
          <p className="text-base font-semibold text-foreground">Content Load Failed</p>
          <p className="text-sm mt-1 max-w-[300px]">Could not load file content. This may be a CORS or network issue.</p>
        </div>
        {resolvedUrl && (
          <Button variant="outline" asChild>
            <a href={resolvedUrl} target="_blank" rel="noopener noreferrer" download>
              <Download className="h-4 w-4 mr-2" /> Download Instead
            </a>
          </Button>
        )}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 flex flex-col bg-[#030712] border-white/[0.06] shadow-[0_0_100px_rgba(0,0,0,0.9)] overflow-hidden rounded-2xl">
        {/* Header */}
        <DialogHeader className="p-4 pr-12 border-b border-white/[0.06] bg-white/[0.02] flex-row items-center justify-between space-y-0 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden pr-4 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
              {categoryIcon(category)}
            </div>
            <div className="flex flex-col min-w-0">
              <DialogTitle className="text-[15px] truncate font-semibold text-white/90 leading-snug">
                {resource.name}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-[11px] text-muted-foreground">
                  {format(new Date(resource.created_at), "MMM d, yyyy · h:mm a")}
                </span>
                <Badge
                  variant="outline"
                  className={`text-[9px] uppercase tracking-wider h-4 px-1.5 flex items-center gap-1 ${STATUS_CLASS[statusKey] || STATUS_CLASS.STORED}`}
                >
                  {isProcessing && <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />}
                  {STATUS_LABEL[statusKey] || resource.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* AI Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 hover:text-emerald-300"
                  disabled={!isReady}
                  title={isReady ? "AI Actions" : "File must be fully indexed before AI actions are available"}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Ask AI
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-[#030712] border-white/[0.1]">
                <DropdownMenuItem className="gap-2 cursor-pointer text-sm">
                  <Sparkles className="h-4 w-4 text-emerald-400" /> Explain this file
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer text-sm">
                  <BookOpen className="h-4 w-4 text-blue-400" /> Summarize
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer text-sm">
                  <Brain className="h-4 w-4 text-violet-400" /> Generate Notes
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer text-sm">
                  <FlaskConical className="h-4 w-4 text-orange-400" /> Generate Quiz
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer text-sm">
                  <BookMarked className="h-4 w-4 text-pink-400" /> Generate Flashcards
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Download */}
            {resolvedUrl && (
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/[0.08]" asChild title="Download">
                <a href={resolvedUrl} download={resource.name} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            )}

            {/* More options */}
            {onDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/[0.08]">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-[#030712] border-white/[0.1]">
                  <DropdownMenuItem className="gap-2 cursor-pointer text-sm whitespace-nowrap" onClick={handleRefreshUrl}>
                    <RefreshCw className="h-4 w-4 text-blue-400" /> Refresh Preview URL
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/[0.05]" />
                  <DropdownMenuItem
                    className="text-red-400 focus:text-red-300 focus:bg-red-400/10 cursor-pointer gap-2 text-sm whitespace-nowrap"
                    onClick={() => { onDelete(resource.id); onOpenChange(false); }}
                  >
                    <Trash2 className="h-4 w-4" /> Delete Resource
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </DialogHeader>

        {/* Preview Area */}
        <div className="flex-1 overflow-hidden relative bg-[#08090e]">
          {renderPreview()}
        </div>

        {/* Footer: metadata bar */}
        <div className="border-t border-white/[0.05] bg-white/[0.01] px-4 py-2 flex items-center gap-4 shrink-0 flex-wrap">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{resource.type || "unknown type"}</span>
          <span className="text-[10px] text-muted-foreground">·</span>
          <span className="text-[10px] text-muted-foreground">ID: {resource.id.slice(0, 8)}...</span>
          {resource.error_message && (
            <>
              <span className="text-[10px] text-muted-foreground">·</span>
              <span className="text-[10px] text-red-400 truncate max-w-[300px]" title={resource.error_message}>
                Error: {resource.error_message}
              </span>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
