"use client";

import { FileText, Trash2, Loader2, FileWarning, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResourceResponse } from "@/actions/resourceActions";

interface ResourceCardProps {
  resource: ResourceResponse;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function ResourceCard({ resource, onDelete, isDeleting }: ResourceCardProps) {
  const isReady = resource.status === "READY";
  const isFailed = resource.status === "FAILED";
  const isProcessing = !isReady && !isFailed && resource.status !== "ARCHIVED";

  return (
    <Card className={`relative overflow-hidden transition-all ${isFailed ? "border-destructive/50" : ""}`}>
      {/* Background progress animation if processing */}
      {isProcessing && (
        <div className="absolute inset-0 bg-primary/5 animate-pulse" />
      )}
      
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 relative z-10">
        <div className="space-y-1">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            {resource.name}
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <span>{new Date(resource.created_at).toLocaleDateString()}</span>
            <span>•</span>
            <span className="uppercase text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground">
              {resource.type.replace("application/", "").replace("text/", "")}
            </span>
          </CardDescription>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon"
          className="text-muted-foreground hover:text-destructive -mt-2 -mr-2"
          onClick={() => onDelete(resource.id)}
          disabled={isDeleting}
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </Button>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="flex items-center justify-between text-sm mt-4">
          <div className="flex items-center gap-2">
            {isProcessing && (
              <>
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-primary font-medium">{resource.status}</span>
              </>
            )}
            {isReady && (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-500 font-medium">Ready</span>
              </>
            )}
            {isFailed && (
              <>
                <FileWarning className="w-4 h-4 text-destructive" />
                <span className="text-destructive font-medium">Failed</span>
              </>
            )}
          </div>
          
          {/* We will add chunk count later when Backend Hardening is done */}
          {resource.error_message && isFailed && (
            <span className="text-xs text-destructive max-w-[200px] truncate" title={resource.error_message}>
              {resource.error_message}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
