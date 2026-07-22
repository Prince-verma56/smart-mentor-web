"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MentorRoadmap, TopicStatus } from "@/types/roadmap";
import { toggleTopicStatusAction } from "@/actions/roadmapActions";
import { toast } from "sonner";

interface RoadmapCardProps {
  roadmap: MentorRoadmap;
}

const statusIcon: Record<TopicStatus, React.ReactNode> = {
  completed: <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />,
  "in-progress": <Loader2 className="h-4 w-4 text-blue-500 shrink-0 animate-spin" />,
  available: <Circle className="h-4 w-4 text-muted-foreground shrink-0" />,
  locked: <Lock className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />,
};

export function RoadmapCard({ roadmap }: RoadmapCardProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticRoadmap, setOptimisticRoadmap] = useState(roadmap);

  const handleToggle = (topicId: string, currentStatus: string) => {
    // If it's a mock topic (starts with "topic-"), don't try to save it to DB
    if (topicId.startsWith("topic-")) {
      toast.error("This is a demo topic. Create a real mentor to track progress!");
      return;
    }

    // Optimistic UI Update
    setOptimisticRoadmap(prev => {
      const newRoadmap = { ...prev };
      newRoadmap.phases = newRoadmap.phases.map(phase => {
        const newPhase = { ...phase };
        newPhase.topics = newPhase.topics.map(t => {
          if (t.id === topicId) {
            return { ...t, status: (currentStatus === "completed" ? "available" : "completed") as TopicStatus };
          }
          return t;
        });
        newPhase.completedCount = newPhase.topics.filter(t => t.status === "completed").length;
        return newPhase;
      });
      return newRoadmap;
    });

    // Server Action
    startTransition(async () => {
      const res = await toggleTopicStatusAction(topicId, currentStatus);
      if (res.error) {
        toast.error(res.error);
        // Revert on error (could implement full revert logic here)
      } else if (res.success) {
        toast.success(res.newStatus === "completed" ? "Topic completed! 🎉" : "Topic unmarked.");
      }
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Learning Roadmap</CardTitle>
        <p className="text-xs text-muted-foreground">{optimisticRoadmap.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {optimisticRoadmap.phases.map((phase) => (
          <div key={phase.id}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {phase.title}
              </span>
              <Badge variant="outline" className="text-xs">
                {phase.completedCount}/{phase.totalCount}
              </Badge>
            </div>
            <div className="space-y-1.5">
              {phase.topics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => handleToggle(topic.id, topic.status)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer transition-colors hover:bg-accent/50",
                    topic.status === "in-progress" && "bg-blue-50 dark:bg-blue-950/30",
                    topic.status === "locked" && "opacity-50 cursor-not-allowed",
                  )}
                >
                  {statusIcon[topic.status]}
                  <span
                    className={cn(
                      "flex-1 truncate",
                      topic.status === "completed" && "line-through text-muted-foreground",
                      topic.status === "in-progress" && "font-medium text-blue-600 dark:text-blue-400",
                    )}
                  >
                    {topic.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
