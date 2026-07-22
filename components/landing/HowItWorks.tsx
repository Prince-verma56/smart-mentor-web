"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Target, Search, Map, BookOpen, Code, MessagesSquare, Award } from "lucide-react";

const steps = [
  { icon: Target, title: "Set Goal", desc: "Define your learning objective" },
  { icon: Search, title: "AI Analysis", desc: "Mentor evaluates your current level" },
  { icon: Map, title: "Roadmap", desc: "Get a personalized curriculum" },
  { icon: BookOpen, title: "Daily Learning", desc: "Bite-sized interactive lessons" },
  { icon: Code, title: "Projects", desc: "Build real-world applications" },
  { icon: MessagesSquare, title: "Interview Prep", desc: "Mock interviews & feedback" },
  { icon: Award, title: "Placement", desc: "Land your dream job" },
];

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  return (
    <section className="py-24 relative w-full overflow-hidden bg-zinc-50/50 dark:bg-black/20" ref={containerRef}>
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center gap-4 mb-20">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            How SuperMentor Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            A seamless journey from setting your goal to landing your dream job.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connection Line Background */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-border -translate-y-1/2 rounded-full hidden md:block" />
          
          {/* Animated Connection Line */}
          <motion.div 
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 -translate-y-1/2 rounded-full hidden md:block origin-left"
            style={{ 
              scaleX: scrollYProgress,
              boxShadow: "0 0 10px 2px rgba(168, 85, 247, 0.5)"
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-7 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-row md:flex-col items-center gap-4 md:gap-6 relative group">
                
                {/* Mobile Connection Line */}
                {index !== steps.length - 1 && (
                  <div className="absolute left-6 top-12 bottom-[-2rem] w-px bg-border md:hidden" />
                )}
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="relative"
                >
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full glass-card flex items-center justify-center border-2 border-primary/20 bg-background/50 text-foreground group-hover:border-primary group-hover:text-primary transition-colors duration-300 shadow-xl">
                    <step.icon className="w-5 h-5 md:w-7 md:h-7" />
                  </div>
                  {/* Glowing effect behind icon */}
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                  className="flex flex-col text-left md:text-center pt-2 md:pt-0 flex-1 md:flex-none"
                >
                  <h4 className="text-sm md:text-base font-semibold mb-1">{step.title}</h4>
                  <p className="text-xs md:text-sm text-muted-foreground leading-tight max-w-[120px] mx-auto hidden md:block">
                    {step.desc}
                  </p>
                  <p className="text-sm text-muted-foreground leading-tight md:hidden">
                    {step.desc}
                  </p>
                </motion.div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
