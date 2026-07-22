import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, BookOpen, Clock, Target } from "lucide-react";
import type { MentorStats } from "@/types/mentor";

interface ProgressCardProps {
  stats: MentorStats;
}

export function ProgressCard({ stats }: ProgressCardProps) {
  const hoursTotal = Math.round(stats.totalMinutes / 60);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Your Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall completion</span>
            <span className="font-semibold">{stats.progressPercent}%</span>
          </div>
          <Progress value={stats.progressPercent} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
            <Flame className="h-5 w-5 text-orange-500 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Streak</p>
              <p className="text-sm font-semibold">{stats.learningStreak} days</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
            <BookOpen className="h-5 w-5 text-blue-500 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Sessions</p>
              <p className="text-sm font-semibold">{stats.totalSessions}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
            <Clock className="h-5 w-5 text-green-500 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Time Spent</p>
              <p className="text-sm font-semibold">{hoursTotal}h</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
            <Target className="h-5 w-5 text-violet-500 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-sm font-semibold">
                {stats.completedTopics}/{stats.totalTopics}
              </p>
            </div>
          </div>
        </div>

        {stats.nextTopicSuggestion && (
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground mb-1">Up next</p>
            <p className="text-sm font-medium">{stats.nextTopicSuggestion}</p>
            <Badge variant="secondary" className="mt-2 text-xs">Suggested</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
