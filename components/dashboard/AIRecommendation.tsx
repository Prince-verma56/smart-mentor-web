"use client";

import { motion } from "framer-motion";
import CommandButton from "@/components/kokonutui/command-button";
import { Sparkles, Play, Flame, Clock, Target, Brain, Search, BookOpen, Cog, Lightbulb, CheckCircle2 } from "lucide-react";

export function AIRecommendation() {
  return (
    <div className="w-full relative">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-emerald-500/10 rounded-xl ring-1 ring-emerald-500/20">
          <Sparkles className="h-5 w-5 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">AI Recommendations</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6 relative z-10">
        {/* Review Mistakes Card - Focused/Active */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full relative group cursor-default"
        >
          {/* Subtle light-bleed edge highlight & gradient shadow */}
          <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-amber-500/10 to-transparent blur-2xl opacity-60 pointer-events-none transform translate-y-4 translate-x-4" />
          
          <div className="relative h-full flex flex-col justify-between rounded-[32px] bg-white/[0.02] backdrop-blur-2xl border border-white/[0.06] p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_10px_10px_40px_rgba(0,0,0,0.5),_20px_20px_80px_rgba(245,158,11,0.08)] overflow-hidden transition-all duration-500 hover:bg-white/[0.03]">
            
            {/* Fine frosted texture overlay */}
            <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

            {/* Single Premium Icon */}
            <div className="absolute top-8 right-8 pointer-events-none">
              <div className="relative w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-xl">
                <Brain className="w-8 h-8 text-amber-500/80 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]" strokeWidth={1.5} />
              </div>
            </div>

            <div className="relative z-10 flex-1">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-amber-500/10 border border-amber-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] mb-6">
                <Flame className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-500">AI Review</span>
              </div>

              <div className="max-w-[85%]">
                <h4 className="text-2xl font-semibold tracking-tight text-white mb-3 drop-shadow-sm">
                  Solidify Authentication
                </h4>
                <p className="text-gray-400/90 text-[15px] leading-relaxed font-light mb-8">
                  Based on your recent session, a quick review of JWT tokens will help solidify your understanding and fix common security implementation flaws.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mt-auto">
                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] text-xs font-medium text-gray-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                    <Target className="h-3.5 w-3.5 text-amber-500/80" />
                    <span>Confidence 94%</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] text-xs font-medium text-gray-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                    <Clock className="h-3.5 w-3.5 text-amber-500/80" />
                    <span>8 min est.</span>
                  </div>
                </div>

                {/* Translucent Amber Glass CTA */}
                <CommandButton
                  size="lg"
                  className="w-full sm:w-auto !rounded-full !bg-amber-500/15 !bg-none text-amber-200 hover:text-white border-amber-500/30 hover:border-amber-500/50 transition-all hover:bg-amber-500/25 font-medium shadow-[0_0_20px_-5px_rgba(245,158,11,0.3),_inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-md px-7"
                  rightIcon={<Play className="h-4 w-4 fill-current" />}
                  sweepClassName="bg-gradient-to-r from-amber-400/0 via-amber-400/30 to-amber-400/0"
                >
                  Start Practice
                </CommandButton>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Knowledge Base Card - Inactive/Resting */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="h-full relative group cursor-default"
        >
          <div className="relative h-full flex flex-col justify-between rounded-[32px] bg-white/[0.02] backdrop-blur-2xl border border-white/[0.04] p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),_10px_10px_40px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-500 hover:bg-white/[0.03]">
            
            {/* Fine frosted texture overlay */}
            <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

            {/* Single Premium Icon */}
            <div className="absolute top-8 right-8 pointer-events-none">
              <div className="relative w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-xl">
                <BookOpen className="w-8 h-8 text-blue-500/80 drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]" strokeWidth={1.5} />
              </div>
            </div>

            <div className="relative z-10 flex-1">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-blue-500/10 border border-blue-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] mb-6">
                <Lightbulb className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-blue-500">Knowledge Base</span>
              </div>

              <div className="max-w-[85%]">
                <h4 className="text-2xl font-semibold tracking-tight text-white mb-3 drop-shadow-sm">
                  System Architecture
                </h4>
                <p className="text-gray-400/90 text-[15px] leading-relaxed font-light mb-8">
                  You uploaded a new PDF recently. I've prepared a 10-question dynamic quiz based on its contents to test your deep system knowledge.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mt-auto">
                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] text-xs font-medium text-gray-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-500/80" />
                    <span>Ready to generate</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] text-xs font-medium text-gray-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                    <Clock className="h-3.5 w-3.5 text-blue-500/80" />
                    <span>10 mins</span>
                  </div>
                </div>

                {/* Translucent Blue Glass CTA */}
                <CommandButton
                  size="lg"
                  className="w-full sm:w-auto !rounded-full !bg-blue-500/15 !bg-none text-blue-200 hover:text-white border-blue-500/30 hover:border-blue-500/50 transition-all hover:bg-blue-500/25 font-medium shadow-[0_0_20px_-5px_rgba(59,130,246,0.3),_inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-md px-7"
                  rightIcon={<Sparkles className="h-4 w-4" />}
                  sweepClassName="bg-gradient-to-r from-blue-400/0 via-blue-400/30 to-blue-400/0"
                >
                  Generate Quiz
                </CommandButton>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
