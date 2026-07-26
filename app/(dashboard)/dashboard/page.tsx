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
              
              {/* Inline Glass Icon for Header */}
              <div className="relative bg-transparent outline-none border-none w-[1em] h-[1em] [perspective:24em] [transform-style:preserve-3d] group">
                <span
                  className="absolute top-0 left-0 w-full h-full rounded-[0.25em] block transition-[opacity,transform] duration-300 origin-[100%_100%] rotate-[15deg] group-hover:[transform:rotate(25deg)_translate3d(-0.1em,-0.1em,0.1em)]"
                  style={{
                    background: 'linear-gradient(to bottom right, #10b981, #047857)',
                    boxShadow: '0.1em -0.1em 0.2em rgba(0,0,0,0.5)'
                  }}
                ></span>
                <span
                  className="absolute top-0 left-0 w-full h-full rounded-[0.25em] bg-[hsla(0,0%,100%,0.05)] transition-[opacity,transform] duration-300 origin-[80%_50%] flex backdrop-blur-[0.2em] transform group-hover:[transform:translate3d(0,0,0.5em)] ring-1 ring-white/20"
                >
                  <span className="m-auto w-[0.6em] h-[0.6em] flex items-center justify-center text-white" aria-hidden="true">
                    <Sparkles className="w-full h-full animate-pulse" />
                  </span>
                </span>
              </div>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Your personal AI ecosystem is ready. You have {mentors.length} active {mentors.length === 1 ? 'mentor' : 'mentors'} waiting.
            </p>
          </div>
          <div className="flex items-center gap-4 relative z-10">
            {mentors.length > 0 && (
              <Link href={`/dashboard/mentors/${recentMentor?.id}`}>
                <Button variant="outline" size="lg" className="h-12 px-6 gap-2 bg-background/50 backdrop-blur-sm border-muted/50 hover:bg-muted/50 text-base">
                  <BrainCircuit className="h-5 w-5" />
                  Resume Session
                </Button>
              </Link>
            )}
            <Link href="/dashboard/mentors/create">
              <Button size="lg" className="h-12 px-6 gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all text-base">
                <Sparkles className="h-5 w-5 fill-current" />
                Create Mentor
              </Button>
            </Link>
          </div>
        </section>

        {mentors.length > 0 ? (
          <>
            {/* Section 2: Your Mentors (Highest Priority, moved to top, full width) */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 group cursor-default">
                {/* Inline Glass Icon */}
                <div className="relative bg-transparent outline-none border-none w-[1.5em] h-[1.5em] [perspective:24em] [transform-style:preserve-3d]">
                  <span
                    className="absolute top-0 left-0 w-full h-full rounded-[0.3em] block transition-[opacity,transform] duration-300 origin-[100%_100%] rotate-[15deg] group-hover:[transform:rotate(25deg)_translate3d(-0.1em,-0.1em,0.1em)]"
                    style={{
                      background: 'linear-gradient(to bottom right, #10b981, #047857)',
                      boxShadow: '0.1em -0.1em 0.2em rgba(0,0,0,0.5)'
                    }}
                  ></span>
                  <span
                    className="absolute top-0 left-0 w-full h-full rounded-[0.3em] bg-[hsla(0,0%,100%,0.05)] transition-[opacity,transform] duration-300 origin-[80%_50%] flex backdrop-blur-[0.2em] transform group-hover:[transform:translate3d(0,0,0.5em)] ring-1 ring-white/20"
                  >
                    <span className="m-auto w-[0.8em] h-[0.8em] flex items-center justify-center text-white" aria-hidden="true">
                      <BrainCircuit className="w-full h-full" />
                    </span>
                  </span>
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
