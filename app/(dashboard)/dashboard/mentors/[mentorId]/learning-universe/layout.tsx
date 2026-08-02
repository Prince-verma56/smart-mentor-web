import { notFound } from "next/navigation";
import { getMentorById } from "@/actions/mentorActions";
import { auth } from "@clerk/nextjs/server";
import { WorkspaceHeader } from "@/components/learning-universe/WorkspaceHeader";
import { ConversationProvider } from "@/contexts/ConversationContext";
import { GlobalShortcuts } from "@/components/learning-universe/GlobalShortcuts";
import { WorkspaceInitializer } from "@/components/learning-universe/WorkspaceInitializer";
import { CollapsibleSidebar } from "@/components/learning-universe/CollapsibleSidebar";

interface LearningUniverseLayoutProps {
  children: React.ReactNode;
  params: Promise<{ mentorId: string }>;
}

export default async function LearningUniverseLayout({ children, params }: LearningUniverseLayoutProps) {
  const { userId } = await auth();
  const { mentorId } = await params;

  if (!userId) {
    notFound();
  }

  const mentor = await getMentorById(mentorId);

  if (!mentor) {
    notFound();
  }

  return (
    <ConversationProvider mentorId={mentorId}>
      <div className="flex h-screen w-full bg-background overflow-hidden relative">
        <GlobalShortcuts mentorId={mentorId} />
        {/* Auto-loads canvases from DB on every LU page */}
        <WorkspaceInitializer mentorId={mentorId} />
        {/* Sidebar with toggleable collapse */}
        <CollapsibleSidebar mentor={mentor} />
        
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          <WorkspaceHeader mentorId={mentorId} />
          <main className="flex-1 relative bg-gradient-to-b from-zinc-950 to-black overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </ConversationProvider>
  );
}
