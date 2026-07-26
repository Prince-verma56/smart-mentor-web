"use client";

import { useState } from "react";
import type { MentorWithStats } from "@/types/mentor";
import { MentorCard } from "./MentorCard";
import { EmptyState } from "./EmptyState";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BrainCircuit, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

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
        <div className="relative w-full md:max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <Input
            placeholder="Search mentors, roles, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/50 backdrop-blur-sm border-muted/40 focus-visible:ring-primary/20 shadow-sm"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>

        {/* Filter Chips */}
        <ScrollArea className="w-full md:max-w-[50%] whitespace-nowrap">
          <div className="flex w-max space-x-2 p-1">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "secondary"}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-4 h-8 text-xs transition-all ${
                  activeCategory === category 
                    ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" 
                    : "bg-background/50 hover:bg-muted text-muted-foreground border border-muted/40"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
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
    </div>
  );
}
