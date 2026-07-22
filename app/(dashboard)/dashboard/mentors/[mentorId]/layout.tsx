// The mentor workspace uses a full-height, edge-to-edge layout.
// We override the parent dashboard layout padding here.
import type { ReactNode } from "react";
import { mentorService } from "@/services/mentorService";
import type { Metadata } from "next";

interface MentorLayoutProps {
  params: Promise<{ mentorId: string }>;
}

export async function generateMetadata({ params }: MentorLayoutProps): Promise<Metadata> {
  const { mentorId } = await params;
  const mentor = await mentorService.getMentorById(mentorId, "user_2test123");
  return {
    title: mentor ? mentor.name : "AI Mentor",
  };
}

export default function MentorWorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-4 -my-6 sm:-mx-6 lg:-mx-8 h-[calc(100vh-4rem)] overflow-hidden">
      {children}
    </div>
  );
}
