import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MentorWorkspace } from "@/components/mentors/MentorWorkspace";
import { mentorService } from "@/services/mentorService";
import { roadmapService } from "@/services/roadmapService";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoadmapCard } from "@/components/mentors/RoadmapCard";

interface RoadmapPageProps {
  params: Promise<{ mentorId: string }>;
}

export async function generateMetadata({ params }: RoadmapPageProps): Promise<Metadata> {
  const { userId } = await auth();
  const { mentorId } = await params;
  const mentor = await mentorService.getMentorById(mentorId, userId || "unauthenticated");
  return {
    title: mentor ? `Learning Path - ${mentor.name}` : "Mentor Learning Path",
  };
}

export default async function RoadmapPage({ params }: RoadmapPageProps) {
  const { userId } = await auth();
  const { mentorId } = await params;

  if (!userId) {
    notFound();
  }

  const mentor = await mentorService.getMentorById(mentorId, userId);
  if (!mentor) {
    notFound();
  }
  const roadmap = await roadmapService.getOrGenerateRoadmap(mentorId, userId);

  return (
    <MentorWorkspace mentor={mentor} stats={mentor.stats} roadmap={roadmap ?? undefined} view="settings">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Learning Path</h1>
            <p className="text-muted-foreground">Your structured journey to achieving your goals with {mentor.name}.</p>
          </div>
          <Button className="gap-2">
            <PlayCircle className="h-4 w-4" /> Continue Learning
          </Button>
        </div>

        <div className="mt-8">
          {roadmap ? (
            <RoadmapCard roadmap={roadmap} />
          ) : (
            <Card>
              <CardContent>
                <div className="p-8 flex flex-col items-center justify-center text-center space-y-3 h-64">
                  <Map className="h-8 w-8 text-muted-foreground/50 animate-pulse" />
                  <div>
                    <p className="text-sm font-medium">Generating Learning Path...</p>
                    <p className="text-xs text-muted-foreground max-w-xs mt-1">Our AI is designing a customized curriculum based on your goals.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MentorWorkspace>
  );
}
