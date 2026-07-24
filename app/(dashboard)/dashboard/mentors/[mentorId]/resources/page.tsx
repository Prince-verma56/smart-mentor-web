import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MentorWorkspace } from "@/components/mentors/MentorWorkspace";
import { getMentorById } from "@/actions/mentorActions";
import { getOrGenerateRoadmap } from "@/actions/roadmapActions";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResourcesList } from "@/components/resources/ResourcesList";

interface ResourcesPageProps {
  params: Promise<{ mentorId: string }>;
}

export async function generateMetadata({ params }: ResourcesPageProps): Promise<Metadata> {
  const { mentorId } = await params;
  const mentor = await getMentorById(mentorId);
  return {
    title: mentor ? `Resources - ${mentor.name}` : "Mentor Resources",
  };
}

export default async function ResourcesPage({ params }: ResourcesPageProps) {
  const { userId } = await auth();
  const { mentorId } = await params;

  if (!userId) {
    notFound();
  }

  const mentor = await getMentorById(mentorId);
  if (!mentor) {
    notFound();
  }
  const roadmap = await getOrGenerateRoadmap(mentorId, userId);

  return (
    <MentorWorkspace mentor={mentor} stats={mentor.stats} roadmap={roadmap ?? undefined} view="settings">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resources & Files</h1>
          <p className="text-muted-foreground">Context and materials shared with {mentor.name}.</p>
        </div>

        <ResourcesList mentorId={mentorId} />
      </div>
    </MentorWorkspace>
  );
}
