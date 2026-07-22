import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MentorWizard } from "@/components/mentors/MentorWizard";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Create AI Mentor",
};

export default function CreateMentorPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/mentors">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2 mb-2 hover:bg-transparent hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Back to Mentors
          </Button>
        </Link>
      </div>

      <MentorWizard />
    </div>
  );
}
