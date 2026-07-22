import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MentorGrid } from "@/components/mentors/MentorGrid";
import { mentorService } from "@/services/mentorService";
import type { MentorWithStats } from "@/types/mentor";
import { Plus, Sparkles, Clock, Target, BrainCircuit, Flame, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const user = await currentUser();
  const allMentors = (await mentorService.getMentorsForUser(userId)) as unknown as MentorWithStats[];

  // Stats calculation
  const totalSessions = allMentors.reduce((a, m) => a + m.stats.totalSessions, 0);
  const totalHours = Math.round(allMentors.reduce((a, m) => a + m.stats.totalMinutes, 0) / 60);
  const bestStreak = allMentors.length > 0 ? Math.max(...allMentors.map((m) => m.stats.learningStreak)) : 0;
  const completedTopics = allMentors.reduce((a, m) => a + m.stats.completedTopics, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Subtle Premium Background Glow */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      {/* Top Section: Greeting & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Welcome back, {user?.firstName ?? "Explorer"}!
            <Sparkles className="h-6 w-6 text-primary" />
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-xl">
            Your personalized AI Mentors are ready. Pick up right where you left off.
          </p>
        </div>
        <Link href="/dashboard/mentors/create">
          <Button size="lg" className="gap-2 shadow-lg hover:shadow-primary/25 transition-all">
            <Plus className="h-5 w-5" />
            Create AI Mentor
          </Button>
        </Link>
      </div>

      {/* Premium Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { title: "Active Mentors", value: allMentors.length, icon: BrainCircuit, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Study Time", value: `${totalHours}h`, icon: Clock, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { title: "Completed Topics", value: completedTopics, icon: Target, color: "text-violet-500", bg: "bg-violet-500/10" },
          { title: "Best Streak", value: `${bestStreak} days`, icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="border-muted/50 bg-background/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator className="bg-border/50" />

      {/* Mentors Grid Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <BrainCircuit className="h-6 w-6 text-primary" />
              Your Mentors
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Jump into a session with your specialized AI guides.</p>
          </div>
        </div>
        
        <MentorGrid mentors={allMentors} />
      </section>
      
      {/* Recent Activity (Placeholder for future) */}
      {allMentors.length > 0 && (
        <section className="pt-8">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Recent Activity</h2>
          </div>
          <Card className="border-muted/50 bg-background/50 backdrop-blur-sm shadow-sm">
            <CardContent className="p-8 text-center">
              <Activity className="h-8 w-8 text-muted-foreground/30 mb-3 mx-auto" />
              <p className="text-sm font-medium text-foreground">Activity timeline coming soon</p>
              <p className="text-xs text-muted-foreground mt-1">We are tracking your progress to build a comprehensive history.</p>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
