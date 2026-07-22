import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, BookOpen, Clock, Target, PlayCircle, Trophy, TrendingUp, Sparkles, AlertCircle, Brain, Rocket } from "lucide-react";
import type { MentorStats } from "@/types/mentor";

interface ProgressCardProps {
  stats: MentorStats;
}

export function ProgressCard({ stats }: ProgressCardProps) {
  const hoursTotal = Math.round((stats.totalMinutes || 0) / 60);
  const todayProgress = stats.progressPercent || 0;
  const currentModule = stats.currentTopic || "Current Topic";
  const currentLesson = "Continue Learning";
  
  // Example for deriving achievements or using real arrays when available
  const achievements = [
    { id: 1, icon: <Target className="h-6 w-6 text-blue-500" />, name: "First Session", unlocked: (stats.totalSessions || 0) > 0 },
    { id: 2, icon: <Flame className="h-6 w-6 text-orange-500" />, name: "3 Day Streak", unlocked: (stats.learningStreak || 0) >= 3 },
    { id: 3, icon: <Brain className="h-6 w-6 text-purple-500" />, name: "Quiz Master", unlocked: (stats.questionsAsked || 0) >= 10 },
    { id: 4, icon: <Rocket className="h-6 w-6 text-red-500" />, name: "Fast Learner", unlocked: (stats.completedTopics || 0) >= 5 },
  ];

  const weeklyGoalDays = stats.learningStreak || 0;
  const weeklyGoalTarget = 5;

  return (
    <div className="space-y-4 pb-4">
      {/* Today's Goal */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Goal Progress</span>
            </div>
            <span className="text-xs font-medium text-primary">{todayProgress}%</span>
          </div>
          <Progress value={todayProgress} className="h-2 bg-primary/10" />
        </CardContent>
      </Card>

      {/* Continue Learning */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <PlayCircle className="h-4 w-4 text-blue-500" />
            Continue Learning
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Topic</p>
              <p className="text-sm font-semibold mt-0.5">{currentModule}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-orange-500/10 border border-orange-500/20 p-3">
          <Flame className="h-5 w-5 text-orange-500 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Streak</p>
            <p className="text-sm font-semibold">{stats.learningStreak || 0} days</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 border p-3">
          <BookOpen className="h-5 w-5 text-blue-500 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Sessions</p>
            <p className="text-sm font-semibold">{stats.totalSessions || 0}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 border p-3">
          <Clock className="h-5 w-5 text-green-500 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Time</p>
            <p className="text-sm font-semibold">{hoursTotal}h</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 border p-3">
          <Target className="h-5 w-5 text-violet-500 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-sm font-semibold">
              {stats.completedTopics || 0}/{stats.totalTopics || 10}
            </p>
          </div>
        </div>
      </div>
      
      {/* Messages & Questions Add-on Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 border p-3">
          <Sparkles className="h-5 w-5 text-purple-500 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Messages</p>
            <p className="text-sm font-semibold">{stats.messagesCount || 0}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 border p-3">
          <AlertCircle className="h-5 w-5 text-indigo-500 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Questions</p>
            <p className="text-sm font-semibold">{stats.questionsAsked || 0}</p>
          </div>
        </div>
      </div>
      
      {/* Weekly Goal */}
      <Card>
         <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
                 <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" className="text-primary" strokeDasharray="289" strokeDashoffset={289 - (289 * Math.min(weeklyGoalDays, weeklyGoalTarget)) / weeklyGoalTarget} strokeLinecap="round" transform="rotate(-90 50 50)" />
                 </svg>
                 <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Weekly Goal</p>
                <p className="text-xs text-muted-foreground">{weeklyGoalDays} of {weeklyGoalTarget} days</p>
              </div>
            </div>
         </CardContent>
      </Card>

      {/* Recommended Topics */}
      {stats.nextTopicSuggestion && (
        <Card className="border-dashed border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold text-primary">Recommended Next</p>
            </div>
            <p className="text-sm font-medium">{stats.nextTopicSuggestion}</p>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
           <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
             {achievements.map(achievement => (
               <div key={achievement.id} className={`flex flex-col items-center gap-1 shrink-0 ${!achievement.unlocked ? 'opacity-40 grayscale' : ''}`}>
                 <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl shadow-sm border">
                   {achievement.icon}
                 </div>
                 <span className="text-[10px] font-medium text-center w-20 leading-tight">{achievement.name}</span>
               </div>
             ))}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
