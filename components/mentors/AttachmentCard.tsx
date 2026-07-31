import React, { memo } from "react";
import { FileText, FileImage, FileCode, FileJson, FileType2, Archive, Loader2, PlayCircle, Music } from "lucide-react";
import { motion } from "framer-motion";

interface AttachmentProps {
  attachment: {
    type: string;
    url: string;
    fileName?: string;
    size?: number;
    metadata?: any;
  };
  onClick?: () => void;
}

function formatBytes(bytes?: number, decimals = 1) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return FileImage;
  if (type.startsWith("video/")) return PlayCircle;
  if (type.startsWith("audio/")) return Music;
  if (type === "application/pdf") return FileText;
  if (type === "application/json") return FileJson;
  if (type === "text/markdown") return FileType2;
  if (type === "application/zip") return Archive;
  if (type.startsWith("text/")) return FileCode;
  return FileText;
};

export const AttachmentCard = memo(function AttachmentCard({ attachment, onClick }: AttachmentProps) {
  const isImage = attachment.type.startsWith("image/");
  
  if (isImage) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        onClick={onClick}
        className="relative rounded-xl overflow-hidden border border-white/10 shadow-sm max-h-[350px] cursor-pointer group bg-black/40 inline-block"
      >
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors z-10 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium text-white backdrop-blur-md">
            Click to expand
          </div>
        </div>
        {/* Placeholder skeleton before load */}
        <div className="absolute inset-0 bg-muted/20 animate-pulse -z-10" />
        <img 
          src={attachment.url} 
          alt={attachment.fileName || "Attached Image"} 
          className="object-contain max-h-[350px] w-auto h-auto min-w-[150px] max-w-[400px] rounded-xl transition-all duration-300" 
          loading="lazy"
        />
      </motion.div>
    );
  }

  const Icon = getFileIcon(attachment.type);
  const isPdf = attachment.type === "application/pdf";

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="bg-black/20 hover:bg-black/40 cursor-pointer rounded-xl p-3 border border-white/10 flex items-start gap-3 w-[260px] transition-all"
    >
      <div className="bg-white/5 p-2.5 rounded-lg border border-white/5 shrink-0 flex items-center justify-center">
        <Icon className="h-5 w-5 text-emerald-400/80" />
      </div>
      
      <div className="flex flex-col overflow-hidden w-full pt-0.5">
        <span className="truncate text-[13px] font-medium text-white/90">
          {attachment.fileName || "Document"}
        </span>
        
        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-white/50">
          <span>{formatBytes(attachment.size)}</span>
          {isPdf && attachment.metadata?.pages && (
            <>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>{attachment.metadata.pages} pages</span>
            </>
          )}
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span className="text-emerald-500/80 font-medium">AI Ready</span>
        </div>
      </div>
    </motion.div>
  );
});
