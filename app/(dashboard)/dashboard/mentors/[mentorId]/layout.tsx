// The mentor workspace uses a full-height, edge-to-edge layout.
// We override the parent dashboard layout padding here.
import type { ReactNode } from "react";
import { getMentorById } from "@/actions/mentorActions";
import type { Metadata } from "next";

interface MentorLayoutProps {
  params: Promise<{ mentorId: string }>;
}

export async function generateMetadata({ params }: MentorLayoutProps): Promise<Metadata> {
  const { mentorId } = await params;
  const mentor = await getMentorById(mentorId);
  return {
    title: mentor ? mentor.name : "AI Mentor",
  };
}

export default function MentorWorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 bg-background overflow-hidden">
      {children}
    </div>
  );
}
