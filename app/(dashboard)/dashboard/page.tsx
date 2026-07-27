import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { MentorGrid } from "@/components/mentors/MentorGrid";
import { getMentorsForUser } from "@/actions/mentorActions";
import { getDashboardStats, getLearningJourney } from "@/actions/dashboardActions";
import type { MentorWithStats } from "@/types/mentor";
import { OverviewWidgets } from "@/components/dashboard/OverviewWidgets";
import { ContinueLearning } from "@/components/dashboard/ContinueLearning";
import { AIRecommendation } from "@/components/dashboard/AIRecommendation";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { LearningJourney } from "@/components/dashboard/LearningJourney";
import { Sparkles, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CommandButton from "@/components/kokonutui/command-button";

export const metadata: Metadata = {
  title: "AI Workspace | Dashboard",
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const user = await currentUser();
  
  // Fetch real data in parallel
  const [allMentors, stats, journeyData] = await Promise.all([
    getMentorsForUser(),
    getDashboardStats(),
    getLearningJourney()
  ]);

  const mentors = allMentors as unknown as MentorWithStats[];

  // Find the mentor with the most recent session, or just use the first one as fallback
  const recentMentor = mentors.length > 0 
    ? mentors.reduce((latest, current) => {
        if (!latest.stats.lastSessionDate) return current;
        if (!current.stats.lastSessionDate) return latest;
        return new Date(current.stats.lastSessionDate) > new Date(latest.stats.lastSessionDate) ? current : latest;
      })
    : undefined;

  return (
    <div className="relative min-h-screen pb-24 animate-in fade-in duration-700">
      {/* Premium Deep Space Background */}
      <div className="fixed inset-0 -z-10 bg-[#030712]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-[#030712] to-[#030712]" />
      </div>

      {/* Increased max-width and vertical spacing */}
      <div className="space-y-20 px-4 md:px-8 max-w-screen-2xl mx-auto pt-10">
        
        {/* Section 1: Hero Section */}
        <section className="relative flex flex-col md:flex-row md:items-center justify-between gap-8 py-6">
          <div className="space-y-3 relative z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground flex items-center gap-4">
              {getGreeting()}, {user?.firstName ?? "Explorer"}
              
              {/* Premium Glass Icon for Header */}
              <div className="relative w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-xl">
                <Sparkles className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" strokeWidth={2} />
              </div>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Your personal AI ecosystem is ready. You have {mentors.length} active {mentors.length === 1 ? 'mentor' : 'mentors'} waiting.
            </p>
          </div>
          <div className="flex items-center gap-4 relative z-10">
            {mentors.length > 0 && (
              <Link href={`/dashboard/mentors/${recentMentor?.id}`}>
                <CommandButton
                  size="lg"
                  className="h-12 px-6 gap-2 !rounded-full !bg-white/[0.05] !bg-none text-zinc-300 hover:text-white border-white/10 hover:border-white/20 transition-all hover:bg-white/[0.08] font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-md"
                  rightIcon={<BrainCircuit className="h-5 w-5 fill-current" />}
                  sweepClassName="bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                >
                  Resume Session
                </CommandButton>
              </Link>
            )}
            <Link href="/dashboard/mentors/create">
              <CommandButton
                size="lg"
                className="h-12 px-6 gap-2 !rounded-full !bg-emerald-500/15 !bg-none text-emerald-200 hover:text-white border-emerald-500/30 hover:border-emerald-500/50 transition-all hover:bg-emerald-500/25 font-medium shadow-[0_0_20px_-5px_rgba(16,185,129,0.3),_inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-md"
                rightIcon={<Sparkles className="h-5 w-5 fill-current" />}
                sweepClassName="bg-gradient-to-r from-emerald-400/0 via-emerald-400/30 to-emerald-400/0"
              >
                Create Mentor
              </CommandButton>
            </Link>
          </div>
        </section>

        {mentors.length > 0 ? (
          <>
            {/* Section 2: Your Mentors (Highest Priority, moved to top, full width) */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 group cursor-default">
                {/* Premium Glass Icon for Mentors */}
                <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-xl">
                  <BrainCircuit className="w-5 h-5 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" strokeWidth={2} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white/90">Your Mentors</h2>
              </div>
              <MentorGrid mentors={mentors} />
            </section>

            {/* Section 3: Continue Learning (Full width card) */}
            <section className="space-y-6">
              <ContinueLearning recentMentor={recentMentor} />
            </section>

            {/* Section 4: AI Recommendation (Dedicated large section) */}
            <section className="space-y-6">
              <AIRecommendation />
            </section>

            {/* Section 5: Quick Actions (Horizontal cards) */}
            <section className="space-y-6">
              <QuickActions />
            </section>

            {/* Section 6: Learning Journey (Vertical path using real grouped data) */}
            <section className="space-y-6 pt-12">
              <LearningJourney data={journeyData} />
            </section>
            
            {/* Section 7: Statistics (Moved to the bottom, real data) */}
            <section className="space-y-6 pt-8 border-t border-muted/20">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Your Impact</h2>
              </div>
              <OverviewWidgets stats={stats} />
            </section>
          </>
        ) : (
          <MentorGrid mentors={[]} />
        )}
      </div>
    </div>
  );
}
