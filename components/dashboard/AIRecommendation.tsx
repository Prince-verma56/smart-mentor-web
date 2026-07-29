"use client";

import { motion } from "framer-motion";
import CommandButton from "@/components/kokonutui/command-button";
import { Sparkles, Play, Flame, Clock, Target, Brain, Lightbulb, CheckCircle2, Wand2, FileQuestion, BookOpen } from "lucide-react";
import { SingleGlassIcon } from "@/components/GlassIcons";
import type { MentorWithStats } from "@/types/mentor";
import Link from "next/link";

// ─── XP by difficulty ────────────────────────────────────────────────────────

const XP_BY_DIFFICULTY: Record<string, number> = {
  beginner: 50,
  intermediate: 100,
  advanced: 150,
  expert: 200,
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="relative h-full flex flex-col justify-between rounded-[32px] bg-white/[0.02] border border-white/[0.04] p-8 animate-pulse overflow-hidden">
      <div className="space-y-4">
        <div className="h-6 w-28 bg-white/[0.06] rounded-full" />
        <div className="h-7 w-48 bg-white/[0.06] rounded-lg" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-white/[0.04] rounded" />
          <div className="h-4 w-4/5 bg-white/[0.04] rounded" />
          <div className="h-4 w-3/5 bg-white/[0.04] rounded" />
        </div>
      </div>
      <div className="flex items-center justify-between mt-8">
        <div className="flex gap-2">
          <div className="h-7 w-28 bg-white/[0.05] rounded-full" />
          <div className="h-7 w-20 bg-white/[0.05] rounded-full" />
        </div>
        <div className="h-10 w-36 bg-white/[0.05] rounded-full" />
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface AIRecommendationProps {
  mentors?: MentorWithStats[];
  knowledgeSources?: number;
}

export function AIRecommendation({ mentors = [], knowledgeSources = 0 }: AIRecommendationProps) {
  // Find the best mentor to recommend a review for:
  // Prefer the one with an active topic and highest progress
  const reviewMentor = mentors
    .filter((m) => m.stats.progressPercent > 0)
    .sort((a, b) => b.stats.progressPercent - a.stats.progressPercent)[0];

  // For knowledge card: mentor with the most files uploaded
  const knowledgeMentor = mentors
    .filter((m) => (m.stats.filesUploaded ?? 0) > 0)
    .sort((a, b) => (b.stats.filesUploaded ?? 0) - (a.stats.filesUploaded ?? 0))[0];

  const reviewTopic = reviewMentor?.stats.currentTopic || "Your current topic";
  const reviewMentorHref = reviewMentor ? `/dashboard/mentors/${reviewMentor.id}?action=practice` : "#";
  const reviewConfidence = reviewMentor ? Math.max(70, 100 - reviewMentor.stats.progressPercent) : 0;
  const reviewEstMins = reviewMentor?.stats.currentTopicEstMinutes ?? 15;
  const reviewXp = reviewMentor?.stats.currentTopicDifficulty
    ? XP_BY_DIFFICULTY[reviewMentor.stats.currentTopicDifficulty] ?? 100
    : 100;

  const knowledgeMentorHref = knowledgeMentor ? `/dashboard/mentors/${knowledgeMentor.id}` : "#";
  const totalSources = knowledgeSources || mentors.reduce((sum, m) => sum + (m.stats.filesUploaded ?? 0), 0);

  // No mentors at all → show empty state
  if (mentors.length === 0) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="flex items-center gap-3 group cursor-default mb-6 mt-4">
          <div className="text-[10px] mr-1">
            <SingleGlassIcon item={{ icon: <Wand2 className="w-full h-full" />, color: "green", label: "" }} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white/90">AI Recommendations</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center gap-3 group cursor-default mb-6 mt-4">
        <div className="text-[10px] mr-1">
          <SingleGlassIcon item={{ icon: <Wand2 className="w-full h-full" />, color: "green", label: "" }} />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white/90 group-hover:text-white transition-colors">
          AI Recommendations
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6 relative z-10">
        {/* Review Card — driven by real mentor topic */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full relative group cursor-default"
        >
          <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-amber-500/10 to-transparent blur-2xl opacity-60 pointer-events-none transform translate-y-4 translate-x-4" />

          <div className="relative h-full flex flex-col justify-between rounded-[32px] bg-white/[0.02] backdrop-blur-2xl border border-white/[0.06] p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_10px_10px_40px_rgba(0,0,0,0.5),_20px_20px_80px_rgba(245,158,11,0.08)] overflow-hidden transition-all duration-500 hover:bg-white/[0.03]">
            <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

            <div className="absolute top-8 right-8 pointer-events-none">
              <div className="text-[10px] drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <SingleGlassIcon item={{ icon: <Brain className="w-full h-full" />, color: "orange", label: "" }} />
              </div>
            </div>

            <div className="relative z-10 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(245,158,11,0.1)] mb-6">
                <Flame className="h-3.5 w-3.5" />
                AI Review
              </div>

              <div className="max-w-[85%]">
                <h4 className="text-2xl font-semibold tracking-tight text-white mb-3 drop-shadow-sm">
                  Solidify: {reviewTopic}
                </h4>
                <p className="text-gray-400/90 text-[15px] leading-relaxed font-light mb-8">
                  {reviewMentor
                    ? `Based on your progress with ${reviewMentor.name}, a focused review of ${reviewTopic} will reinforce your understanding and accelerate your roadmap completion.`
                    : "Start a session with your mentor to get personalized AI review recommendations."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mt-auto">
                <div className="flex flex-wrap items-center gap-3">
                  {reviewMentor && (
                    <>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] text-xs font-medium text-gray-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                        <Target className="h-3.5 w-3.5 text-amber-500/80" />
                        <span>Confidence {reviewConfidence}%</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] text-xs font-medium text-gray-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                        <Clock className="h-3.5 w-3.5 text-amber-500/80" />
                        <span>{reviewEstMins} min est.</span>
                      </div>
                    </>
                  )}
                </div>

                <Link href={reviewMentorHref} className="w-full sm:w-auto">
                  <CommandButton
                    size="lg"
                    className="w-full sm:w-auto !rounded-full !bg-amber-500/15 !bg-none text-amber-200 hover:text-white border-amber-500/30 hover:border-amber-500/50 transition-all hover:bg-amber-500/25 font-medium shadow-[0_0_20px_-5px_rgba(245,158,11,0.3),_inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-md px-7 cursor-pointer"
                    rightIcon={<Play className="h-4 w-4 fill-current" />}
                    sweepClassName="bg-gradient-to-r from-amber-400/0 via-amber-400/30 to-amber-400/0"
                  >
                    {reviewMentor ? "Start Practice" : "Open Mentor"}
                  </CommandButton>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Knowledge Base Card — driven by real resource count */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="h-full relative group cursor-default"
        >
          <div className="relative h-full flex flex-col justify-between rounded-[32px] bg-white/[0.02] backdrop-blur-2xl border border-white/[0.04] p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),_10px_10px_40px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-500 hover:bg-white/[0.03]">
            <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

            <div className="absolute top-8 right-8 pointer-events-none">
              <div className="text-[10px] drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <SingleGlassIcon item={{ icon: <BookOpen className="w-full h-full" />, color: "blue", label: "" }} />
              </div>
            </div>

            <div className="relative z-10 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(59,130,246,0.1)] mb-6">
                <Lightbulb className="h-3.5 w-3.5" />
                Knowledge Base
              </div>

              <div className="max-w-[85%]">
                <h4 className="text-2xl font-semibold tracking-tight text-white mb-3 drop-shadow-sm">
                  {knowledgeMentor ? `${knowledgeMentor.name}'s Resources` : "Build Your Knowledge Base"}
                </h4>
                <p className="text-gray-400/90 text-[15px] leading-relaxed font-light mb-8">
                  {totalSources > 0
                    ? `You have ${totalSources} knowledge source${totalSources > 1 ? "s" : ""} uploaded across your mentors. Generate a dynamic quiz to test your understanding of the material.`
                    : "Upload PDFs, docs, or notes to your mentor's knowledge base. Your AI will use them to give you personalized, context-aware answers."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mt-auto">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] text-xs font-medium text-gray-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-500/80" />
                    <span>{totalSources > 0 ? `${totalSources} source${totalSources > 1 ? "s" : ""} ready` : "No sources yet"}</span>
                  </div>
                  {totalSources > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] text-xs font-medium text-gray-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                      <Clock className="h-3.5 w-3.5 text-blue-500/80" />
                      <span>10 mins</span>
                    </div>
                  )}
                </div>

                <Link href={knowledgeMentorHref} className="w-full sm:w-auto">
                  <CommandButton
                    size="lg"
                    className="w-full sm:w-auto !rounded-full !bg-blue-500/15 !bg-none text-blue-200 hover:text-white border-blue-500/30 hover:border-blue-500/50 transition-all hover:bg-blue-500/25 font-medium shadow-[0_0_20px_-5px_rgba(59,130,246,0.3),_inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-md px-7 cursor-pointer"
                    rightIcon={<FileQuestion className="h-4 w-4" />}
                    sweepClassName="bg-gradient-to-r from-blue-400/0 via-blue-400/30 to-blue-400/0"
                  >
                    {totalSources > 0 ? "Generate Quiz" : "Upload Source"}
                  </CommandButton>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
