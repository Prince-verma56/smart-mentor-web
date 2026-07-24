"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadResource } from "@/actions/resourceActions";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface ResourceUploaderProps {
  mentorId: string;
}

export function ResourceUploader({ mentorId }: ResourceUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt", ".md"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mentor_id", mentorId);

      await uploadResource(mentorId, formData);
      
      toast.success("File uploaded successfully");
      setFile(null);
      // Invalidate to start polling
      queryClient.invalidateQueries({ queryKey: ["resources", mentorId] });
    } catch (error: any) {
      toast.error(error.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
          ${isUploading ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        <input {...getInputProps()} />
        
        {!file ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <p className="font-medium">Click or drag file to upload</p>
            <p className="text-xs text-muted-foreground">
              Supports PDF, TXT, MD (up to 10MB)
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-background border p-4 rounded-md">
            <div className="flex items-center gap-3 overflow-hidden">
              <File className="w-8 h-8 text-primary shrink-0" />
              <div className="text-left overflow-hidden">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {file && (
        <div className="flex justify-end">
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isUploading ? "Uploading..." : "Process Document"}
          </Button>
        </div>
      )}
    </div>
  );
}
