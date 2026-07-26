import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MentorWorkspace } from "@/components/mentors/MentorWorkspace";
import { getMentorById } from "@/actions/mentorActions";
import { MOCK_ROADMAPS } from "@/lib/mock-data/mentor-roadmap";
import { MOCK_PROGRESS } from "@/lib/mock-data/mentor-progress";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Brain, MessageSquare, Mic, FolderOpen, AlertTriangle } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { getOrGenerateRoadmap } from "@/actions/roadmapActions";

import { MentorSettingsContent } from "@/components/mentors/MentorSettingsContent";

interface SettingsPageProps {
  params: Promise<{ mentorId: string }>;
}

export async function generateMetadata({ params }: SettingsPageProps): Promise<Metadata> {
  const { userId } = await auth();
  const { mentorId } = await params;
  const mentor = await getMentorById(mentorId);
  return {
    title: mentor ? `Settings - ${mentor.name}` : "Mentor Settings",
  };
}

export default async function SettingsPage({ params }: SettingsPageProps) {
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
    <MentorSettingsContent 
      mentor={mentor} 
      stats={mentor.stats} 
      roadmap={roadmap ?? undefined} 
    />
  );
}
