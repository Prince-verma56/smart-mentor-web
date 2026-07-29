"use client";

import { useState, useCallback, useRef } from "react";
import { UploadCloud, X, Loader2, FileText, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadResource } from "@/lib/resources";
import { Resource } from "@/types/resource";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UploadTask {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  controller: AbortController;
  error?: string;
  resource?: Resource;
}

interface ResourceDropzoneProps {
  mentorId: string;
  onUploadSuccess: (resource: Resource) => void;
  className?: string;
}

export function ResourceDropzone({ mentorId, onUploadSuccess, className }: ResourceDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startUpload = async (task: UploadTask) => {
    try {
      const resource = await uploadResource(
        mentorId,
        task.file,
        (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setTasks((prev) =>
              prev.map((t) => (t.id === task.id ? { ...t, progress: percentCompleted } : t))
            );
          }
        },
        task.controller.signal
      );

      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: "success", resource, progress: 100 } : t))
      );
      onUploadSuccess(resource);
      
      // Auto remove success tasks after 3s
      setTimeout(() => {
        setTasks((prev) => prev.filter((t) => t.id !== task.id || t.status !== "success"));
      }, 3000);
    } catch (err: any) {
      if (err.name === "CanceledError") {
        setTasks((prev) => prev.filter((t) => t.id !== task.id));
      } else {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? { ...t, status: "error", error: err.response?.data?.detail || err.message || "Upload failed" }
              : t
          )
        );
      }
    }
  };

  const handleFiles = (files: FileList | File[]) => {
    const newTasks: UploadTask[] = [];
    
    Array.from(files).forEach((file) => {
      // Prevent duplicate duplicate uploads of the exact same file
      if (tasks.some((t) => t.file.name === file.name && t.file.size === file.size && (t.status === "uploading" || t.status === "success"))) {
        return;
      }

      const task: UploadTask = {
        id: Math.random().toString(36).substring(7),
        file,
        progress: 0,
        status: "uploading",
        controller: new AbortController(),
      };
      startUpload(task);
      newTasks.push(task);
    });

    if (newTasks.length > 0) {
      setTasks((prev) => [...newTasks, ...prev]);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const cancelUpload = (id: string) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === id);
      if (task && task.status === "uploading") {
        task.controller.abort();
      }
      return prev.filter((t) => t.id !== id);
    });
  };

  const retryUpload = (id: string) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === id);
      if (task) {
        const newTask: UploadTask = { ...task, status: "uploading", progress: 0, controller: new AbortController(), error: undefined };
        startUpload(newTask);
        return prev.map((t) => (t.id === id ? newTask : t));
      }
      return prev;
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={(e) => {
          e.preventDefault();
          fileInputRef.current?.click();
        }}
        className={cn(
          "relative border-2 border-dashed rounded-[24px] p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group overflow-hidden bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]",
          isDragActive
            ? "border-emerald-500/50 bg-emerald-500/5"
            : "border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.04]"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        
        <input
          type="file"
          multiple
          className="hidden"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files);
            }
            e.target.value = "";
          }}
          onClick={(e) => e.stopPropagation()}
          accept=".pdf,.txt,.md,image/png,image/jpeg,image/webp,image/gif"
        />

        <div className="h-12 w-12 rounded-full bg-white/[0.05] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <UploadCloud className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
        
        <h4 className="text-sm font-semibold text-foreground mb-1">
          Click to upload or drag and drop
        </h4>
        <p className="text-xs text-muted-foreground max-w-[200px]">
          PDF, TXT, MD, or Images (max 10MB)
        </p>
      </div>

      <AnimatePresence mode="popLayout">
        {tasks.length > 0 && (
          <motion.div layout className="space-y-2">
            {tasks.map((task) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={task.id}
                className="relative bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 flex items-center gap-3 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
              >
                {task.status === "uploading" && (
                  <div 
                    className="absolute inset-0 bg-emerald-500/5 transition-all duration-300"
                    style={{ width: `${task.progress}%` }}
                  />
                )}
                
                <div className="h-8 w-8 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0 z-10">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                
                <div className="flex-1 min-w-0 z-10">
                  <p className="text-xs font-medium text-foreground truncate">
                    {task.file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground uppercase">
                      {task.status === "uploading" ? `${task.progress}%` : task.status}
                    </span>
                    {task.error && (
                      <span className="text-[10px] text-red-400 truncate max-w-[150px]">
                        - {task.error}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 z-10">
                  {task.status === "uploading" && (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <button onClick={() => cancelUpload(task.id)} className="p-1 hover:bg-white/[0.1] rounded-md transition-colors text-muted-foreground hover:text-foreground">
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  )}
                  {task.status === "success" && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  )}
                  {task.status === "error" && (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <button onClick={() => retryUpload(task.id)} className="p-1 hover:bg-white/[0.1] rounded-md transition-colors text-muted-foreground hover:text-foreground" title="Retry">
                        <RefreshCw className="h-3 w-3" />
                      </button>
                      <button onClick={() => cancelUpload(task.id)} className="p-1 hover:bg-white/[0.1] rounded-md transition-colors text-muted-foreground hover:text-foreground" title="Dismiss">
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
