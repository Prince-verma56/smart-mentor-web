import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MentorWorkspace } from "@/components/mentors/MentorWorkspace";
import { getMentorById } from "@/actions/mentorActions";
import { getOrGenerateRoadmap } from "@/actions/roadmapActions";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResourcesPageProps {
  params: Promise<{ mentorId: string }>;
}

export async function generateMetadata({ params }: ResourcesPageProps): Promise<Metadata> {
  const { userId } = await auth();
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Resources & Files</h1>
            <p className="text-muted-foreground">Context and materials shared with {mentor.name}.</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" /> Upload File
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>File Library</CardTitle>
            <CardDescription>Upload PDFs, code files, or text documents to give your mentor more context.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-8 border border-dashed rounded-lg bg-muted/10 flex flex-col items-center justify-center text-center space-y-3 h-64">
              <FolderOpen className="h-8 w-8 text-muted-foreground/50" />
              <div>
                <p className="text-sm font-medium">Resource Management Coming Soon</p>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">Soon you'll be able to attach specific files to your learning path for context-aware answers.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MentorWorkspace>
  );
}
