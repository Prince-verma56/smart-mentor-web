"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Mic, FileUp, BarChart, Settings, BookOpen, MessageSquare, Code2, Map } from "lucide-react";
import type { MentorWithStats } from "@/types/mentor";

// Actions are now derived inside the component

const gradientMapping: Record<string, string> = {
  "text-emerald-500": 'linear-gradient(to bottom right, #10b981, #047857)',
  "text-blue-500": 'linear-gradient(to bottom right, #3b82f6, #1d4ed8)',
  "text-violet-500": 'linear-gradient(to bottom right, #8b5cf6, #6d28d9)',
  "text-orange-500": 'linear-gradient(to bottom right, #f97316, #c2410c)',
  "text-primary": 'linear-gradient(to bottom right, #10b981, #047857)',
  "text-muted-foreground": 'linear-gradient(to bottom right, #374151, #1f2937)',
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

interface QuickActionsProps {
  recentMentor?: MentorWithStats;
}

export function QuickActions({ recentMentor }: QuickActionsProps) {
  const ACTIONS = [
    {
      title: "Continue Roadmap",
      description: "Pick up where you left off.",
      icon: Map,
      href: recentMentor ? `/dashboard/mentors/${recentMentor.id}?action=roadmap` : "/dashboard/mentors",
      color: "text-emerald-500",
    },
    {
      title: "Practice Topic",
      description: "Solidify your understanding.",
      icon: Code2,
      href: recentMentor ? `/dashboard/mentors/${recentMentor.id}?action=practice` : "/dashboard/mentors",
      color: "text-blue-500",
    },
    {
      title: "Ask a Question",
      description: "Clear up any confusion.",
      icon: MessageSquare,
      href: recentMentor ? `/dashboard/mentors/${recentMentor.id}` : "/dashboard/mentors",
      color: "text-violet-500",
    },
    {
      title: "Upload Resources",
      description: "Add PDFs or text to your knowledge base.",
      icon: FileUp,
      href: recentMentor ? `/dashboard/mentors/${recentMentor.id}/resources` : "/dashboard/mentors",
      color: "text-orange-500",
    },
    {
      title: "Start Voice Session",
      description: "Practice speaking with your mentor.",
      icon: Mic,
      href: recentMentor ? `/dashboard/mentors/${recentMentor.id}?action=voice` : "/dashboard/mentors",
      color: "text-primary",
    },
    {
      title: "Workspace Settings",
      description: "Manage your mentor preferences.",
      icon: Settings,
      href: recentMentor ? `/dashboard/mentors/${recentMentor.id}/settings` : "/dashboard/mentors",
      color: "text-muted-foreground",
    }
  ];

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Quick Actions</h2>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {ACTIONS.map((action, i) => {
          const bgGradient = gradientMapping[action.color] || gradientMapping["text-primary"];

          return (
            <motion.div key={i} variants={item}>
              <Link href={action.href}>
                <Card className="group h-full border-muted/40 bg-[#030712]/50 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:shadow-lg hover:border-white/20 transition-all duration-300 overflow-visible">
                  <CardContent className="p-5 flex items-center gap-5 h-full overflow-visible">
                    
                    {/* 3D Glass Icon Implementation */}
                    <div className="relative bg-transparent outline-none border-none w-[3.5em] h-[3.5em] [perspective:24em] [transform-style:preserve-3d] shrink-0">
                      {/* Back tilted shadow/colored layer */}
                      <span
                        className="absolute top-0 left-0 w-full h-full rounded-[1em] block transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[100%_100%] rotate-[15deg] [will-change:transform] group-hover:[transform:rotate(25deg)_translate3d(-0.2em,-0.2em,0.2em)]"
                        style={{
                          background: bgGradient,
                          boxShadow: '0.3em -0.3em 0.5em rgba(0,0,0,0.5)'
                        }}
                      ></span>

                      {/* Front Glass Layer */}
                      <span
                        className="absolute top-0 left-0 w-full h-full rounded-[1em] bg-[hsla(0,0%,100%,0.05)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[80%_50%] flex backdrop-blur-[0.5em] [-webkit-backdrop-filter:blur(0.5em)] [-moz-backdrop-filter:blur(0.5em)] [will-change:transform] transform group-hover:[transform:translate3d(0,0,1em)] ring-1 ring-white/10"
                        style={{
                          boxShadow: '0 0 0 0.1em hsla(0, 0%, 100%, 0.1) inset'
                        }}
                      >
                        <span className="m-auto w-[1.5em] h-[1.5em] flex items-center justify-center text-white" aria-hidden="true">
                          <action.icon className="w-full h-full" />
                        </span>
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-semibold text-white/90 group-hover:text-white transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-sm text-white/50 mt-0.5 line-clamp-1">
                        {action.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

