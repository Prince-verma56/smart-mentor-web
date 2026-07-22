import type { MentorWithStats } from "@/types/mentor";
import { MentorCard } from "./MentorCard";
import { EmptyState } from "./EmptyState";

interface MentorGridProps {
  mentors: MentorWithStats[];
}

export function MentorGrid({ mentors }: MentorGridProps) {
  if (mentors.length === 0) {
    return (
      <EmptyState
        title="No mentors yet"
        description="Create your first AI mentor to start a personalized learning journey."
        actionLabel="Create your first mentor"
        actionHref="/dashboard/mentors/create"
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {mentors.map((mentor) => (
        <MentorCard key={mentor.id} mentor={mentor} />
      ))}
    </div>
  );
}
