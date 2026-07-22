"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Map, CheckCircle2, Circle, Lock } from "lucide-react";

const roadmapNodes = [
  { title: "HTML & CSS Fundamentals", status: "completed", duration: "1 week" },
  { title: "JavaScript Basics", status: "completed", duration: "2 weeks" },
  { title: "React & Hooks", status: "in-progress", duration: "3 weeks", active: true },
  { title: "Next.js App Router", status: "locked", duration: "2 weeks" },
  { title: "Backend Integration", status: "locked", duration: "2 weeks" },
];

export function RoadmapShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end center"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="roadmaps" className="py-24 relative w-full bg-zinc-50/50 dark:bg-black/20" ref={containerRef}>
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left: Interactive Roadmap */}
          <div className="relative pl-8 md:pl-12 py-8">
            {/* Background Line */}
            <div className="absolute top-0 bottom-0 left-[23px] w-0.5 bg-border rounded-full" />
            
            {/* Animated Progress Line */}
            <motion.div 
              className="absolute top-0 left-[23px] w-0.5 bg-gradient-to-b from-primary to-blue-500 rounded-full origin-top"
              style={{ height: lineHeight, boxShadow: "0 0 10px 2px rgba(168, 85, 247, 0.4)" }}
            />

            <div className="flex flex-col gap-10">
              {roadmapNodes.map((node, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative group cursor-pointer"
                >
                  {/* Node Icon */}
                  <div className={`absolute -left-[35px] top-1.5 h-6 w-6 rounded-full flex items-center justify-center bg-background border-2 transition-all duration-300 z-10 ${
                    node.status === "completed" ? "border-primary text-primary" :
                    node.status === "in-progress" ? "border-blue-500 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-110" :
                    "border-muted text-muted-foreground"
                  }`}>
                    {node.status === "completed" && <CheckCircle2 className="h-4 w-4" />}
                    {node.status === "in-progress" && <Circle className="h-4 w-4 fill-current" />}
                    {node.status === "locked" && <Lock className="h-3 w-3" />}
                  </div>

                  {/* Content Card */}
                  <div className={`glass-card rounded-xl p-5 ml-4 transition-all duration-300 ${
                    node.active ? "border-blue-500/50 shadow-lg shadow-blue-500/10 scale-[1.02]" : "hover:border-primary/30 hover:shadow-md"
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`font-semibold text-base ${node.status === "locked" ? "text-muted-foreground" : "text-foreground"}`}>
                        {node.title}
                      </h4>
                      <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                        {node.duration}
                      </span>
                    </div>
                    
                    {node.active && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 pt-4 border-t border-border/50 flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium text-blue-500">65%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "65%" }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Current topic: useEffect dependencies
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Text Content */}
          <div className="flex flex-col gap-6 lg:pl-12">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary font-medium">
              <Map className="h-4 w-4" />
              <span>Smart Curriculum</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              Your personalized path to <span className="text-gradient-primary">mastery</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Don't waste time figuring out what to learn next. SuperMentor generates an optimized, dynamic roadmap based on your goals, current skill level, and available time.
            </p>
            <ul className="flex flex-col gap-4 mt-4">
              {[
                "Adapts to your learning speed",
                "Includes curated projects & quizzes",
                "Fills knowledge gaps automatically",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
