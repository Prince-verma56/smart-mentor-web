"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Sparkles, Code2, Dumbbell, Briefcase, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

const TEMPLATES = [
  { icon: Code2, label: "React Expert", color: "text-blue-400" },
  { icon: Briefcase, label: "Career Coach", color: "text-emerald-400" },
  { icon: Dumbbell, label: "Fitness Guide", color: "text-orange-400" },
];

export function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="relative flex flex-col items-center justify-center rounded-2xl border border-muted/30 bg-background/40 backdrop-blur-md px-6 py-24 text-center overflow-hidden shadow-sm">
      {/* Animated Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3] 
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
        className="absolute top-1/4 right-1/4 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"
      />
      
      {/* Animated Orb/Icon */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-8 shadow-inner ring-1 ring-primary/20"
      >
        <BrainCircuit className="h-12 w-12 text-primary" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-2xl border border-primary/20 border-t-primary/50"
        />
      </motion.div>
      
      <motion.h3 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative text-2xl font-bold tracking-tight text-foreground"
      >
        {title}
      </motion.h3>
      
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative mt-3 text-base text-muted-foreground max-w-md"
      >
        {description}
      </motion.p>
      
      {/* Template Suggestions */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-3"
      >
        {TEMPLATES.map((t, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-muted/30 text-xs font-medium text-muted-foreground">
            <t.icon className={`h-3.5 w-3.5 ${t.color}`} />
            {t.label}
          </div>
        ))}
      </motion.div>

      {actionLabel && actionHref && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative mt-10"
        >
          <Link href={actionHref}>
            <Button size="lg" className="rounded-xl font-medium shadow-lg hover:shadow-primary/25 transition-all gap-2 px-8 h-12 group">
              <Sparkles className="h-4 w-4" />
              {actionLabel}
              <ChevronRight className="h-4 w-4 opacity-50 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
