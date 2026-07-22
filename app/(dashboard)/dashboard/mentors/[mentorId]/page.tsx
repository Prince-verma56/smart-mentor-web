import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MentorWorkspace } from "@/components/mentors/MentorWorkspace";
import { mentorService } from "@/services/mentorService";
import { MOCK_ROADMAPS } from "@/lib/mock-data/mentor-roadmap";
import { MOCK_PROGRESS } from "@/lib/mock-data/mentor-progress";
import { roadmapService } from "@/services/roadmapService";
import { auth } from "@clerk/nextjs/server";

interface MentorWorkspacePageProps {
  params: Promise<{ mentorId: string }>;
}

export async function generateMetadata({ params }: MentorWorkspacePageProps): Promise<Metadata> {
  const { userId } = await auth();
  const { mentorId } = await params;
  const mentor = await mentorService.getMentorById(mentorId, userId || "unauthenticated");
  return {
    title: mentor ? `${mentor.name} Workspace` : "Mentor Workspace",
  };
}

export default async function MentorWorkspacePage({ params }: MentorWorkspacePageProps) {
  const { userId } = await auth();
  const { mentorId } = await params;

  if (!userId) {
    notFound();
  }

  const mentor = await mentorService.getMentorById(mentorId, userId);

  if (!mentor) {
    notFound();
  }

  const stats = MOCK_PROGRESS[mentorId] ?? mentor.stats;
  // Fetch real AI generated roadmap from Supabase
  const roadmapFromDb = await roadmapService.getRoadmapForMentor(mentorId);
  const roadmap = roadmapFromDb || MOCK_ROADMAPS[mentorId];

  return (
    <MentorWorkspace
      mentor={mentor}
      stats={stats}
      roadmap={roadmap}
    />
  );
}
