import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Settings, Zap, Home } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import type { Mentor } from "@/types/mentor";
import Breadcrumb from "@/components/ui/smoothui/breadcrumb";

interface MentorHeaderProps {
  mentor: Mentor;
}

const DIFFICULTY_COLORS = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  intermediate: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  advanced: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  expert: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
} as const;

export function MentorHeader({ mentor }: MentorHeaderProps) {
  return (
    <header className="border-b bg-background shrink-0">
      {/* Row 1: Breadcrumb */}
      <div className="px-4 pt-2.5 pb-0">
        <Breadcrumb
          items={[
            { label: <Home className="h-3.5 w-3.5" />, href: "/dashboard" },
            { label: "Mentors", href: "/dashboard/mentors" },
            { label: mentor.name },
          ]}
        />
      </div>

      {/* Row 2: Mentor info + actions */}
      <div className="flex items-center justify-between gap-3 px-4 py-2">
        {/* Left: mentor info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="min-w-0">
            <h1 className="text-sm font-semibold leading-tight truncate">{mentor.name}</h1>
            <p className="text-xs text-muted-foreground truncate">{mentor.role}</p>
          </div>
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-1.5">
            <Badge variant="outline" className="text-xs h-5 px-1.5">{mentor.subject}</Badge>
            <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${DIFFICULTY_COLORS[mentor.difficultyLevel]}`}>
              {mentor.difficultyLevel}
            </span>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs hidden sm:flex" disabled>
            <Zap className="h-3 w-3" />
            Live Mode
          </Button>
          <Link href={`/dashboard/mentors/${mentor.id}/settings`}>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Settings className="h-3.5 w-3.5" />
              <span className="sr-only">Settings</span>
            </Button>
          </Link>
          <UserButton
            appearance={{ elements: { avatarBox: "h-7 w-7 ring-1 ring-border" } }}
          />
        </div>
      </div>
    </header>
  );
}
