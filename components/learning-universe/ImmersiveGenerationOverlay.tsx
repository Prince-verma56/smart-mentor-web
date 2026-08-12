import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Workflow, Database, Cpu, Network, Lightbulb, Code2, BrainCircuit, BookOpen } from 'lucide-react';

interface ImmersiveGenerationOverlayProps {
  isGenerating: boolean;
  status: string;
  nodeCount?: number;
  edgeCount?: number;
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
  <BrainCircuit key="brain" className="w-6 h-6 text-primary" />,
  <Database key="db" className="w-6 h-6 text-blue-500" />,
  <Network key="net" className="w-6 h-6 text-purple-500" />,
  <Workflow key="wf" className="w-6 h-6 text-amber-500" />,
  <Lightbulb key="lb" className="w-6 h-6 text-yellow-500" />,
  <Code2 key="c2" className="w-6 h-6 text-emerald-500" />,
  <Cpu key="cpu" className="w-6 h-6 text-indigo-500" />,
  <BookOpen key="bk" className="w-6 h-6 text-orange-500" />,
  <Database key="db2" className="w-6 h-6 text-teal-500" />,
  <Sparkles key="sp" className="w-6 h-6 text-primary" />,
];

export const ImmersiveGenerationOverlay = ({
  isGenerating,
  status,
  nodeCount = 0,
  edgeCount = 0,
}: ImmersiveGenerationOverlayProps) => {
  const [thinkingIndex, setThinkingIndex] = useState(0);

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setThinkingIndex((prev) => (prev + 1) % THINKING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const isGenericStatus =
    status?.includes('Synthesizing') || status?.includes('Executing') || !status;
  const displayStatus = isGenericStatus ? THINKING_MESSAGES[thinkingIndex] : status;
  const Icon = THINKING_ICONS[thinkingIndex];
  const hasNodes = nodeCount > 0;

  return (
    <AnimatePresence>
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          // Semi-transparent gradient so the canvas building up behind is visible
          className="absolute inset-0 z-[100] flex flex-col items-end justify-end p-6 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, hsl(var(--background) / 0.85) 0%, hsl(var(--background) / 0.05) 60%)',
          }}
        >
          {/* Bottom-right compact status card */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, delay: 0.1 }}
            className="pointer-events-auto relative bg-card/90 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-4 w-80 overflow-hidden"
          >
            {/* Accent bar */}
            <div className="absolute top-0 left-0 w-full h-0.5 rounded-t-2xl bg-gradient-to-r from-primary/20 via-primary to-primary/20 animate-pulse" />

            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted/60 border border-border shrink-0">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={thinkingIndex}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ type: 'spring', damping: 14 }}
                  >
                    {Icon}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">Synthesizing Universe</p>
                <div className="h-4 overflow-hidden">
                  <AnimatePresence mode="popLayout">
                    <motion.p
                      key={displayStatus}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-[11px] text-muted-foreground truncate"
                    >
                      {displayStatus}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Live counters */}
            <div className="flex gap-2 mb-3">
              <motion.div
                animate={{ scale: hasNodes ? [1, 1.04, 1] : 1 }}
                className="flex-1 flex flex-col items-center py-2 rounded-xl bg-muted/40 border border-border"
              >
                <motion.span
                  key={nodeCount}
                  initial={{ scale: 1.4, color: 'hsl(var(--primary))' }}
                  animate={{ scale: 1, color: 'hsl(var(--foreground))' }}
                  className="text-xl font-bold tabular-nums"
                >
                  {nodeCount}
                </motion.span>
                <span className="text-[10px] text-muted-foreground">Nodes</span>
              </motion.div>
              <div className="flex-1 flex flex-col items-center py-2 rounded-xl bg-muted/40 border border-border">
                <motion.span
                  key={edgeCount}
                  initial={{ scale: 1.4 }}
                  animate={{ scale: 1 }}
                  className="text-xl font-bold tabular-nums text-foreground"
                >
                  {edgeCount}
                </motion.span>
                <span className="text-[10px] text-muted-foreground">Connections</span>
              </div>
            </div>

            {/* Indeterminate progress bar */}
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden relative">
              <motion.div
                className="absolute h-full bg-primary rounded-full w-1/3"
                animate={{ left: ['-33%', '110%'] }}
                transition={{ duration: 1.8, ease: 'linear', repeat: Infinity }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
