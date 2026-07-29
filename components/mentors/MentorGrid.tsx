"use client";

import { useState } from "react";
import type { MentorWithStats } from "@/types/mentor";
import { MentorCard } from "./MentorCard";
import { EmptyState } from "./EmptyState";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BrainCircuit } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { PremiumCommandPalette, CommandTrigger } from "@/components/ui/premium-command-palette";
import SmoothTab from "@/components/kokonutui/smooth-tab";

interface MentorGridProps {
  mentors: MentorWithStats[];
}

const CATEGORIES = [
  "All",
  "Programming",
  "Career",
  "Fitness",
  "Language",
  "Education",
  "Personal",
];

// Helper to map subjects to categories (simplified for example)
function getCategory(subject: string) {
  if (["frontend", "backend", "fullstack", "devops", "machine-learning", "data-science", "dsa", "system-design"].includes(subject)) return "Programming";
  if (["career", "interview", "resume", "startup"].includes(subject)) return "Career";
  if (subject === "fitness") return "Fitness";
  if (subject === "english" || subject === "communication") return "Language";
  return "Personal";
}

export function MentorGrid({ mentors }: MentorGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [commandOpen, setCommandOpen] = useState(false);
  const router = useRouter();

  if (mentors.length === 0) {
    return (
      <EmptyState
        title="Welcome to your AI Workspace"
        description="Build your personal ecosystem of AI Mentors. Create guides for coding, fitness, career growth, and more."
        actionLabel="Create First Mentor"
        actionHref="/dashboard/mentors/create"
      />
    );
  }

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch =
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = activeCategory === "All" || getCategory(mentor.subject) === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Workspace Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-sm z-50">
          <CommandTrigger
            onClick={() => setCommandOpen(true)}
            placeholder="Search mentors..."
          // We omit the cmd+k indicator here to avoid conflict with the global sidebar search
          />
        </div>

        {/* Filter Chips */}
        <div className="w-full md:max-w-[60%] overflow-x-auto scrollbar-hide">
          <SmoothTab
            items={CATEGORIES.map(category => ({
              id: category,
              title: category,
              color: "emerald" as const
            }))}
            activeColor="bg-white/[0.08] border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
            selectedTextColor="text-white"
            value={activeCategory}
            onChange={(tabId) => setActiveCategory(tabId)}
            hideContent={true}
            className="w-max bg-transparent p-0 gap-2"
          />
        </div>
      </div>

      {/* Grid */}
      <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filteredMentors.map((mentor) => (
            <motion.div
              key={mentor.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <MentorCard mentor={mentor} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredMentors.length === 0 && (
        <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
          <BrainCircuit className="h-12 w-12 text-muted/30 mb-4" />
          <p>No mentors found matching your criteria.</p>
          <Button variant="link" onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}>
            Clear filters
          </Button>
        </div>
      )}

      <PremiumCommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        title="Search Mentors"
        placeholder="Type a mentor name or role..."
        emptyMessage="No mentors found."
        items={mentors.map(m => ({
          id: m.id,
          label: m.name,
          description: `${m.role} • ${m.subject}`,
          icon: <BrainCircuit className="h-4 w-4" />
        }))}
        onSelect={(item) => {
          setSearchQuery("");
          setActiveCategory("All");
          router.push(`/dashboard/mentors/${item.id}`);
        }}
      />
    </div>
  );
}
