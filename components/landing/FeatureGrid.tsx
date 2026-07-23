"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bot, FileSearch, Map, Target, TrendingUp, Code2 } from "lucide-react";

const features = [
  {
    title: "AI Mentor",
    description: "Get personalized guidance, code reviews, and instant answers to your learning blocks.",
    icon: Bot,
    className: "md:col-span-2 md:row-span-2",
    preview: (
      <div className="absolute right-0 bottom-0 w-3/4 h-3/4 bg-background/50 rounded-tl-xl border-l border-t border-border/50 p-4 shadow-2xl flex flex-col gap-2 overflow-hidden">
        <div className="w-2/3 h-6 rounded bg-primary/20" />
        <div className="w-full h-12 rounded bg-muted/50 mt-2 p-2 flex flex-col gap-1">
          <div className="w-3/4 h-2 rounded bg-muted" />
          <div className="w-1/2 h-2 rounded bg-muted" />
        </div>
        <div className="w-5/6 h-6 rounded bg-primary/10 self-end mt-1" />
      </div>
    ),
  },
  {
    title: "Resume Analyzer",
    description: "AI-driven ATS scoring and optimization suggestions.",
    icon: FileSearch,
    className: "md:col-span-1 md:row-span-1",
    preview: (
      <div className="absolute right-4 bottom-4 w-16 h-20 bg-background/80 rounded border border-border/50 shadow-lg flex flex-col gap-1 p-2">
        <div className="w-full h-2 rounded-sm bg-primary/30" />
        <div className="w-full h-1 rounded-sm bg-muted" />
        <div className="w-4/5 h-1 rounded-sm bg-muted" />
        <div className="w-full h-1 rounded-sm bg-muted" />
        <div className="w-3/4 h-1 rounded-sm bg-muted" />
        <div className="mt-auto w-full h-4 rounded-sm bg-primary/20 flex items-center justify-center">
          <div className="w-4 h-1 rounded-sm bg-primary" />
        </div>
      </div>
    ),
  },
  {
    title: "Roadmap Generator",
    description: "Custom learning paths tailored to your goals.",
    icon: Map,
    className: "md:col-span-1 md:row-span-1",
    preview: (
      <div className="absolute -right-2 -bottom-2 w-full h-1/2 flex items-center gap-2 p-4">
        <div className="w-8 h-8 rounded-full border-2 border-primary bg-background z-10" />
        <div className="h-1 flex-1 bg-gradient-to-r from-primary to-muted" />
        <div className="w-6 h-6 rounded-full border-2 border-muted bg-background z-10" />
        <div className="h-1 flex-1 bg-muted" />
      </div>
    ),
  },
  {
    title: "Mock Interview",
    description: "Practice behavioral and technical questions.",
    icon: Target,
    className: "md:col-span-1 md:row-span-1",
    preview: (
      <div className="absolute inset-x-4 bottom-4 h-12 bg-background/80 rounded-full border border-border/50 shadow-lg flex items-center justify-between px-4">
        <div className="flex gap-1 items-center h-4">
          {[1, 2, 3, 2, 1, 3, 4, 2].map((h, i) => (
            <motion.div
              key={i}
              animate={{ height: ["20%", `${h * 20}%`, "20%"] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
              className="w-1 bg-primary/60 rounded-full"
            />
          ))}
        </div>
        <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
          <div className="w-2 h-2 rounded-sm bg-red-500" />
        </div>
      </div>
    ),
  },
  {
    title: "Project Generator",
    description: "Get tailored project ideas based on your skill level.",
    icon: Code2,
    className: "md:col-span-1 md:row-span-1",
    preview: (
      <div className="absolute -right-4 bottom-4 w-3/4 h-24 bg-zinc-950 rounded-l-xl p-3 flex flex-col gap-2 font-mono text-[8px] text-zinc-400 overflow-hidden shadow-2xl border-y border-l border-zinc-800">
        <div className="text-zinc-500">{"// Generate Next.js app"}</div>
        <div className="text-purple-400">export default <span className="text-blue-400">function</span> <span className="text-yellow-200">App</span>() {'{'}</div>
        <div className="pl-2">return (</div>
        <div className="pl-4 text-primary">{"<div className='flex'>"}</div>
        <div className="pl-4 text-primary">{"</div>"}</div>
        <div className="pl-2">)</div>
        <div>{'}'}</div>
      </div>
    ),
  },
  {
    title: "Progress Analytics",
    description: "Track your learning velocity and mastery levels.",
    icon: TrendingUp,
    className: "md:col-span-2 md:row-span-1",
    preview: (
      <div className="absolute right-8 bottom-0 w-1/2 h-full flex items-end gap-2 pt-8">
        {[30, 50, 40, 70, 60, 90].map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.1, type: "spring" }}
            className="flex-1 bg-gradient-to-t from-primary/40 to-primary/80 rounded-t-sm"
          />
        ))}
      </div>
    ),
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="py-24 relative w-full">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
        
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary font-medium">
            <Bot className="h-4 w-4" />
            <span>Platform Features</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground max-w-2xl">
            Everything you need to <span className="text-gradient-primary">accelerate</span> your career.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            A complete suite of AI-powered tools designed to help you learn faster, build better projects, and ace your interviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[250px]">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`glass-card rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden group hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-500 ${feature.className}`}
            >
              <div className="relative z-10 flex flex-col h-full max-w-[70%]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 transition-transform group-hover:scale-110 group-hover:bg-primary/20">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Decorative Background Blob */}
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-[50px] group-hover:bg-primary/20 transition-colors duration-500" />
              
              {/* Feature Preview UI */}
              <div className="opacity-70 group-hover:opacity-100 transition-opacity duration-500">
                {feature.preview}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
