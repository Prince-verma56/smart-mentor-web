import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MentorWorkspace } from "@/components/mentors/MentorWorkspace";
import { getMentorById } from "@/actions/mentorActions";
import { getOrGenerateRoadmap } from "@/actions/roadmapActions";
import { auth } from "@clerk/nextjs/server";
import { LearningCanvas } from "@/components/learning-universe/LearningCanvas";

interface LearningUniversePageProps {
  params: Promise<{ mentorId: string }>;
}

export async function generateMetadata({ params }: LearningUniversePageProps): Promise<Metadata> {
  const { mentorId } = await params;
  const mentor = await getMentorById(mentorId);
  return {
    title: mentor ? `${mentor.name} Learning Universe` : "Learning Universe",
  };
}

export default async function LearningUniversePage({ params }: LearningUniversePageProps) {
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
  const roadmapPromise = getOrGenerateRoadmap(mentorId, userId);

  return (
    <MentorWorkspace
      mentor={mentor}
      stats={stats}
      roadmapPromise={roadmapPromise}
      view="learning-universe"
    >
      <div className="absolute inset-0 w-full h-full">
        <LearningCanvas />
      </div>
    </MentorWorkspace>
  );
}
