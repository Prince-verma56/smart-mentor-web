import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MentorWorkspace } from "@/components/mentors/MentorWorkspace";
import { mentorService } from "@/services/mentorService";
import { roadmapService } from "@/services/roadmapService";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface HistoryPageProps {
  params: Promise<{ mentorId: string }>;
}

export async function generateMetadata({ params }: HistoryPageProps): Promise<Metadata> {
  const { userId } = await auth();
  const { mentorId } = await params;
  const mentor = await mentorService.getMentorById(mentorId, userId || "unauthenticated");
  return {
    title: mentor ? `History - ${mentor.name}` : "Mentor History",
  };
}

export default async function HistoryPage({ params }: HistoryPageProps) {
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
            <h1 className="text-2xl font-bold tracking-tight">Session History</h1>
            <p className="text-muted-foreground">Review your past conversations and generated code with {mentor.name}.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search history..." className="pl-8" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Your most recent interactions will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-8 border border-dashed rounded-lg bg-muted/10 flex flex-col items-center justify-center text-center space-y-3 h-64">
              <History className="h-8 w-8 text-muted-foreground/50" />
              <div>
                <p className="text-sm font-medium">History UI Coming Soon</p>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">This page will soon display a searchable log of all your past chats and sessions.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MentorWorkspace>
  );
}
