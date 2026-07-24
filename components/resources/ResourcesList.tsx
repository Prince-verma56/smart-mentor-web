"use client";

import { useResources } from "@/hooks/useResources";
import { ResourceCard } from "./ResourceCard";
import { ResourceUploader } from "./ResourceUploader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ResourcesList({ mentorId }: { mentorId: string }) {
  const { resources, isLoading, isError, deleteResource, isDeleting } = useResources(mentorId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Knowledge</CardTitle>
          <CardDescription>
            Give your AI mentor new documents to learn from. The mentor will reference these when answering questions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResourceUploader mentorId={mentorId} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Knowledge Base</h3>
        
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-[120px] w-full rounded-xl" />
            <Skeleton className="h-[120px] w-full rounded-xl" />
          </div>
        )}

        {isError && (
          <div className="p-4 border border-destructive/50 text-destructive rounded-lg bg-destructive/10">
            Failed to load resources.
          </div>
        )}

        {!isLoading && !isError && resources.length === 0 && (
          <div className="text-center py-12 border rounded-lg bg-muted/20 text-muted-foreground">
            No resources uploaded yet.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onDelete={deleteResource}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
