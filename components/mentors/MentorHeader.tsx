import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Settings, Zap, Home } from "lucide-react";
import type { Mentor } from "@/types/mentor";
import Breadcrumb from "@/components/ui/smoothui/breadcrumb";

interface MentorHeaderProps {
  mentor: Mentor;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const DIFFICULTY_COLORS = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  intermediate: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  advanced: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  expert: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
} as const;

export function MentorHeader({ mentor }: MentorHeaderProps) {
  return (
    <header className="border-b bg-background px-4 py-3 space-y-3">
      <div className="flex items-center">
        <Breadcrumb
          items={[
            { label: <Home className="h-3.5 w-3.5" />, href: "/dashboard" },
            { label: "Mentors", href: "/dashboard/mentors" },
            { label: mentor.name },
          ]}
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-9 w-9 shrink-0">
            {mentor.avatarUrl ? (
              <img src={mentor.avatarUrl} alt={mentor.name} />
            ) : null}
            <AvatarFallback
              style={{ backgroundColor: mentor.avatarColor }}
              className="text-white text-sm font-semibold"
            >
              {getInitials(mentor.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="text-base font-semibold leading-tight truncate">{mentor.name}</h1>
            <p className="text-xs text-muted-foreground truncate">{mentor.role}</p>
          </div>
          <Separator orientation="vertical" className="h-8 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{mentor.subject}</Badge>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[mentor.difficultyLevel]}`}
            >
              {mentor.difficultyLevel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Extension point: Live Teaching Mode button */}
          <Button variant="outline" size="sm" className="gap-1.5 hidden sm:flex" disabled>
            <Zap className="h-3.5 w-3.5" />
            Live Mode
          </Button>
          <Link href={`/dashboard/mentors/${mentor.id}/settings`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Mentor settings</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
