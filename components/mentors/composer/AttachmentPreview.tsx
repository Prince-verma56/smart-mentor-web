import { Loader2, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Attachment {
  file: File;
  url?: string;
  uploading: boolean;
}

interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove: (index: number) => void;
}

export function AttachmentPreview({ attachments, onRemove }: AttachmentPreviewProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 px-5 pt-4 pb-1">
      {attachments.map((a, i) => (
        <div key={i} className="relative group/att flex items-center gap-3 bg-card/60 backdrop-blur-sm rounded-xl pr-4 p-2 border border-border/60 max-w-[240px] shadow-sm transition-all hover:shadow-md hover:bg-card/90">
          {a.uploading ? (
            <div className="h-10 w-10 rounded-lg bg-background/50 flex items-center justify-center shrink-0">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          ) : a.file.type.startsWith("image/") ? (
            <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 bg-muted relative">
              <img src={a.url} alt="preview" className="h-full w-full object-cover transition-transform duration-300 group-hover/att:scale-110" />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-lg"></div>
            </div>
          ) : (
            <div className="h-10 w-10 rounded-lg bg-background/50 flex items-center justify-center shrink-0 text-muted-foreground ring-1 ring-inset ring-border/50">
              <FileText className="h-5 w-5" />
            </div>
          )}

          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[12px] font-medium text-foreground truncate">{a.file.name}</span>
            <span className="text-[10px] text-muted-foreground truncate">
              {(a.file.size / 1024).toFixed(1)} KB • {a.file.type.split('/')[1]?.toUpperCase() || 'FILE'}
            </span>
          </div>

          <button
            onClick={() => onRemove(i)}
            className="absolute -right-2 -top-2 h-6 w-6 bg-background hover:bg-destructive hover:text-destructive-foreground border border-border/50 shadow-sm rounded-full flex items-center justify-center opacity-0 scale-90 group-hover/att:opacity-100 group-hover/att:scale-100 transition-all z-10"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
