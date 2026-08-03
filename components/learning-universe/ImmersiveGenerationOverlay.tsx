import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Workflow, Database, Cpu, Network, Lightbulb, Code2, BrainCircuit, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ImmersiveGenerationOverlayProps {
  isGenerating: boolean;
  status: string;
}

const THINKING_MESSAGES = [
  "Analyzing mentor's conversation history...",
  "Extracting core concepts and learning milestones...",
  "Formulating pedagogical hierarchies...",
  "Identifying prerequisite dependencies...",
  "Structuring interconnected knowledge paths...",
  "Balancing theory with practical challenges...",
  "Applying semantic relationships to graph edges...",
  "Optimizing the learning flow architecture...",
  "Finalizing node metadata and progression data...",
  "Preparing layout for immersive visualization..."
];

const THINKING_ICONS = [
  <BrainCircuit className="w-8 h-8 text-primary" />,
  <Database className="w-8 h-8 text-blue-500" />,
  <Network className="w-8 h-8 text-purple-500" />,
  <Workflow className="w-8 h-8 text-amber-500" />,
  <Lightbulb className="w-8 h-8 text-yellow-500" />,
  <Code2 className="w-8 h-8 text-emerald-500" />,
  <Cpu className="w-8 h-8 text-indigo-500" />,
  <BookOpen className="w-8 h-8 text-orange-500" />,
  <Database className="w-8 h-8 text-teal-500" />,
  <Sparkles className="w-8 h-8 text-primary" />
];

const statusIcons: Record<string, React.ReactNode> = {
  'Preparing roadmap...': <Sparkles className="w-8 h-8 text-emerald-400" />,
  'Validating Semantic Integrity...': <Cpu className="w-8 h-8 text-blue-400" />,
  'Applying Intelligent Layout...': <Workflow className="w-8 h-8 text-purple-400" />,
};

export const ImmersiveGenerationOverlay = ({ isGenerating, status }: ImmersiveGenerationOverlayProps) => {
  const [thinkingIndex, setThinkingIndex] = useState(0);

  useEffect(() => {
    if (!isGenerating) return;
    
    // Cycle through messages every 2.5 seconds
    const interval = setInterval(() => {
      setThinkingIndex((prev) => (prev + 1) % THINKING_MESSAGES.length);
    }, 2500);
    
    return () => clearInterval(interval);
  }, [isGenerating]);

  const isGenericStatus = status?.includes('Synthesizing') || status?.includes('Executing') || !status;
  const displayStatus = isGenericStatus ? THINKING_MESSAGES[thinkingIndex] : status;
  
  let Icon = <Loader2 className="w-8 h-8 text-primary animate-spin" />;
  if (!isGenericStatus && statusIcons[status]) {
    Icon = statusIcons[status];
  } else if (isGenericStatus) {
    Icon = THINKING_ICONS[thinkingIndex];
  }

  return (
    <AnimatePresence>
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-background/80"
        >
          <Card className="relative flex flex-col items-center max-w-lg w-full p-8 rounded-3xl bg-card/95 border-border shadow-2xl overflow-hidden">
            
            {/* Background effects */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30 animate-pulse" />
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-secondary/10 rounded-full blur-[80px]" />

            <CardContent className="flex flex-col items-center p-0 relative z-10 w-full">
              {/* Icon Container */}
              <div className="h-24 flex items-center justify-center">
                <AnimatePresence mode="popLayout">
                  <motion.div 
                    key={displayStatus} // changing key triggers re-animation
                    initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="flex items-center justify-center w-20 h-20 rounded-2xl bg-muted/50 border border-border shadow-inner"
                  >
                    {Icon}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Status Text */}
              <div className="relative z-10 text-center w-full mt-2">
                <motion.h2 
                  className="text-2xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-4"
                >
                  Synthesizing Learning Universe
                </motion.h2>
                
                <div className="h-10 overflow-hidden relative w-full flex justify-center items-center">
                  <AnimatePresence mode="popLayout">
                    <motion.p
                      key={displayStatus}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="text-muted-foreground text-sm font-medium absolute w-full px-4 text-center"
                    >
                      {displayStatus}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              {/* Progress Bar (Indeterminate but pulsing) */}
              <div className="w-full h-1.5 mt-6 bg-secondary rounded-full overflow-hidden relative">
                <motion.div 
                  className="absolute top-0 left-0 h-full w-1/3 bg-primary rounded-full"
                  animate={{
                    left: ['-30%', '100%']
                  }}
                  transition={{
                    duration: 2,
                    ease: "linear",
                    repeat: Infinity
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
