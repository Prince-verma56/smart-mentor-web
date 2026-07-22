import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MentorWorkspace } from "@/components/mentors/MentorWorkspace";
import { getMentorById } from "@/actions/mentorActions";
import { getOrGenerateRoadmap } from "@/actions/roadmapActions";
import { auth } from "@clerk/nextjs/server";

interface MentorWorkspacePageProps {
  params: Promise<{ mentorId: string }>;
}

export async function generateMetadata({ params }: MentorWorkspacePageProps): Promise<Metadata> {
  const { userId } = await auth();
  const { mentorId } = await params;
  const mentor = await getMentorById(mentorId);
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

  const mentor = await getMentorById(mentorId);

  if (!mentor) {
    notFound();
  }

  const stats = mentor.stats;

  // Pass the promise down to avoid blocking the page load during generation!
  const roadmapPromise = getOrGenerateRoadmap(mentorId, userId);

  return (
    <MentorWorkspace
      mentor={mentor}
      stats={stats}
      roadmapPromise={roadmapPromise}
    />
  );
}
