"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section className="relative min-h-[90vh] w-full overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 opacity-30 dark:opacity-20 blur-[120px] pointer-events-none">
        <div className="h-[400px] w-[600px] rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-8 lg:pr-8 relative z-10"
          >
            <motion.div variants={itemVariants} className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              <span>SuperMentor 2.0 is live</span>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex flex-col gap-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
                Learn Faster.<br />
                Build Better.<br />
                <span className="text-gradient-primary">Get Hired with AI.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-[600px] leading-relaxed">
                Your personalized AI mentor for coding, interview prep, and career growth. Generate roadmaps, build projects, and land your dream job.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 text-base shadow-lg shadow-primary/20 transition-all hover:scale-105">
                Start Building Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base border-border bg-background hover:bg-muted transition-all">
                View Demo
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-6 text-sm text-muted-foreground mt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Cancel anytime</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - 3D Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotateY: -10, rotateX: 5 }}
            animate={{ opacity: 1, x: 0, rotateY: -5, rotateX: 2 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative lg:h-[600px] w-full perspective-[1000px] z-10"
          >
            {/* Main Dashboard Card */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="glass-card absolute inset-0 rounded-2xl border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden"
              style={{
                transformStyle: "preserve-3d",
                transform: "rotateY(-15deg) rotateX(5deg) scale(0.95)",
              }}
            >
              {/* Fake UI Header */}
              <div className="flex items-center justify-between border-b border-border/50 bg-background/50 p-4">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="h-6 w-32 rounded bg-muted" />
              </div>
              
              {/* Fake UI Content */}
              <div className="flex h-full p-6 gap-6 bg-background/80">
                {/* Sidebar */}
                <div className="w-1/4 flex flex-col gap-4">
                  <div className="h-8 w-full rounded bg-primary/20" />
                  <div className="h-8 w-3/4 rounded bg-muted" />
                  <div className="h-8 w-5/6 rounded bg-muted" />
                  <div className="h-8 w-full rounded bg-muted" />
                </div>
                {/* Main Content area */}
                <div className="flex-1 flex flex-col gap-6">
                  {/* Top chart */}
                  <div className="h-40 w-full rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 p-4">
                    <div className="h-4 w-1/3 rounded bg-primary/30 mb-4" />
                    <div className="flex items-end h-20 gap-2 mt-auto">
                      {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                          className="flex-1 bg-primary/40 rounded-t-sm" 
                        />
                      ))}
                    </div>
                  </div>
                  {/* Bottom split */}
                  <div className="flex gap-6 flex-1 mb-8">
                    <div className="flex-1 rounded-xl bg-muted/50 p-4 flex flex-col gap-3">
                      <div className="h-4 w-1/2 rounded bg-muted" />
                      <div className="h-2 w-full rounded bg-muted" />
                      <div className="h-2 w-full rounded bg-muted" />
                      <div className="h-2 w-3/4 rounded bg-muted" />
                    </div>
                    <div className="flex-1 rounded-xl bg-muted/50 p-4 flex flex-col gap-3">
                      <div className="h-4 w-1/2 rounded bg-muted" />
                      <div className="h-2 w-full rounded bg-muted" />
                      <div className="h-2 w-5/6 rounded bg-muted" />
                      <div className="h-2 w-full rounded bg-muted" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating Element 1 - AI Chat */}
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute -right-8 top-1/4 w-64 glass-card rounded-xl p-4 shadow-xl border border-white/20 dark:border-white/10"
              style={{ transform: "translateZ(50px)" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="text-sm font-medium">AI Mentor</div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="rounded-lg rounded-tl-none bg-muted p-2 text-xs text-muted-foreground w-4/5">
                  How can I optimize this React component?
                </div>
                <div className="rounded-lg rounded-tr-none bg-primary/10 p-2 text-xs text-primary self-end w-5/6">
                  Try using useMemo to memoize the calculation. Here's how...
                </div>
              </div>
            </motion.div>

            {/* Floating Element 2 - Score */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 2 }}
              className="absolute -left-12 bottom-1/3 w-48 glass-card rounded-xl p-4 shadow-xl border border-white/20 dark:border-white/10 flex items-center gap-4"
              style={{ transform: "translateZ(80px)" }}
            >
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-4 border-green-500/20">
                <svg className="absolute inset-0 h-full w-full -rotate-90">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-green-500" strokeDasharray="125" strokeDashoffset="12" />
                </svg>
                <span className="text-sm font-bold text-green-500">92</span>
              </div>
              <div>
                <div className="text-sm font-semibold">Interview Score</div>
                <div className="text-xs text-muted-foreground">Top 10%</div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
