import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MentorWorkspace } from "@/components/mentors/MentorWorkspace";
import { mentorService } from "@/services/mentorService";
import { MOCK_ROADMAPS } from "@/lib/mock-data/mentor-roadmap";
import { MOCK_PROGRESS } from "@/lib/mock-data/mentor-progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Brain, MessageSquare, Mic, FolderOpen, AlertTriangle } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { roadmapService } from "@/services/roadmapService";

import { MentorSettingsContent } from "@/components/mentors/MentorSettingsContent";

interface SettingsPageProps {
  params: Promise<{ mentorId: string }>;
}

export async function generateMetadata({ params }: SettingsPageProps): Promise<Metadata> {
  const { userId } = await auth();
  const { mentorId } = await params;
  const mentor = await mentorService.getMentorById(mentorId, userId || "unauthenticated");
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

  const mentor = await mentorService.getMentorById(mentorId, userId);
  if (!mentor) {
    notFound();
  }

  const roadmap = await roadmapService.getOrGenerateRoadmap(mentorId, userId);

  return (
    <MentorSettingsContent 
      mentor={mentor} 
      stats={mentor.stats} 
      roadmap={roadmap ?? undefined} 
    />
  );
}
