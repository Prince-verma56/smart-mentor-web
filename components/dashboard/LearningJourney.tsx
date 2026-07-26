"use client";

import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import React, { useEffect, useRef } from "react";
import { BookOpen, Mic, FileText, Bot, MessageSquare, Target, Trophy, Lock, X } from "lucide-react";
import { useRoadmapStore, Milestone } from "@/store/roadmapStore";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, any> = {
  BookOpen, Mic, FileText, Bot, MessageSquare, Target, Trophy
};

const PATH_COORDINATES = [
  { x: 50, y: 5 },
  { x: 75, y: 20 },
  { x: 25, y: 35 },
  { x: 75, y: 50 },
  { x: 25, y: 65 },
  { x: 75, y: 80 },
  { x: 50, y: 95 },
];

const SVG_VIEWBOX = "0 0 400 1200";
const SVG_PATH_D = `
  M 200 0
  L 200 60
  C 200 150, 300 150, 300 240
  C 300 330, 100 330, 100 420
  C 100 510, 300 510, 300 600
  C 300 690, 100 690, 100 780
  C 100 870, 300 870, 300 960
  C 300 1050, 200 1050, 200 1140
  L 200 1200
`;

export function LearningJourney({ data }: { data: Milestone[] }) {
  const { setMilestones, milestones, activeNodeId, setActiveNodeId } = useRoadmapStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const activeIndex = data.findIndex(m => m.status === "active");
  const fillPercentage = activeIndex === -1 ? 1 : (PATH_COORDINATES[activeIndex]?.y / 100) || 1;

  useEffect(() => {
    const initializedData = data.map((m, i) => ({
      ...m,
      coordinates: PATH_COORDINATES[i] || { x: 50, y: (i * 10) + 10 }
    }));
    setMilestones(initializedData);
  }, [data, setMilestones]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  // CRITICAL FIX: The line draws perfectly 1:1 with the scroll position, so its tip always sits at the center of the screen.
  // It stops drawing completely once it reaches the active node's exact percentage.
  const pathLength = useTransform(scrollYProgress, (pos) => Math.min(pos, fillPercentage));

  if (!milestones.length) return null;

  return (
    <div className="w-full relative py-20 min-h-screen">
      
      {/* Zero Hard Edges: Seamlessly blended background environment */}
      <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,white,transparent)] z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent" />
        
        {/* Ambient Glows */}
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[30%] right-[10%] w-[400px] h-[400px] bg-orange-900/10 rounded-full blur-[120px]" />
        <div className="absolute top-[60%] left-[30%] w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[150px]" />

        {/* Grid Pattern */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at center, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      <div className="text-center mb-16 relative z-20">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">
          Learning Adventure
        </h2>
        <p className="text-white/40 mt-2 font-medium">Follow the path and master your workspace.</p>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full max-w-lg mx-auto h-[1200px] mb-32 z-10"
      >
        <svg viewBox={SVG_VIEWBOX} className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>

          {/* Heavily Muted Background Path */}
          <path 
            d={SVG_PATH_D}
            fill="none" 
            stroke="currentColor" 
            strokeWidth="8" 
            className="text-white/5"
            strokeLinecap="round"
          />
        </svg>

        <svg viewBox={SVG_VIEWBOX} className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
          {/* Animated Gradient Path */}
          <motion.path 
            d={SVG_PATH_D}
            fill="none" 
            stroke="url(#emeraldGradient)" 
            strokeWidth="8" 
            strokeLinecap="round"
            style={{ pathLength }}
          />
        </svg>

        {milestones.map((milestone) => (
          <MilestoneNode key={milestone.id} milestone={milestone} />
        ))}

        <AnimatePresence>
          {activeNodeId && (
            <DetailPanel 
              milestone={milestones.find(m => m.id === activeNodeId)!} 
              onClose={() => setActiveNodeId(null)} 
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MilestoneNode({ milestone }: { milestone: Milestone }) {
  const { setActiveNodeId, activeNodeId } = useRoadmapStore();
  const Icon = iconMap[milestone.icon] || Trophy;
  const { x, y } = milestone.coordinates!;
  
  const isLocked = milestone.status === "locked";
  const isActive = milestone.status === "active";
  const isAvailable = milestone.status === "available";
  const isCompleted = milestone.status === "completed";
  const isSelected = activeNodeId === milestone.id;

  let bgGradient = "";
  let iconStyle = "";
  
  if (isLocked) {
    bgGradient = "linear-gradient(to bottom right, #1f2937, #111827)"; // Gray 800 to 900
    iconStyle = "text-white/30";
  } else if (isAvailable) {
    bgGradient = "linear-gradient(to bottom right, #047857, #064e3b)"; // Emerald 700 to 900
    iconStyle = "text-emerald-300";
  } else if (isActive) {
    bgGradient = "linear-gradient(to bottom right, #ea580c, #9a3412)"; // Orange 600 to 800
    iconStyle = "text-orange-200";
  } else if (isCompleted) {
    bgGradient = "linear-gradient(to bottom right, #10b981, #047857)"; // Emerald 500 to 700
    iconStyle = "text-white";
  }

  const isRightSide = x > 50;

  return (
    <div 
      className="absolute flex flex-col items-center justify-center z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className="relative group flex items-center justify-center">
        {/* React-Bits Glass Icon Implementation */}
        <button
          onClick={() => !isLocked && setActiveNodeId(isSelected ? null : milestone.id)}
          className={`relative bg-transparent outline-none border-none cursor-pointer w-[4em] h-[4em] md:w-[4.5em] md:h-[4.5em] [perspective:24em] [transform-style:preserve-3d] [-webkit-tap-highlight-color:transparent] group ${isSelected && !isActive ? 'scale-110' : ''} ${isActive ? 'scale-125' : ''} transition-transform duration-500`}
        >
          {/* Back tilted shadow/colored layer */}
          <span
            className={`absolute top-0 left-0 w-full h-full rounded-[1.25em] block transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[100%_100%] rotate-[15deg] [will-change:transform] group-hover:[transform:rotate(25deg)_translate3d(-0.5em,-0.5em,0.5em)] ${isActive ? 'animate-pulse' : ''}`}
            style={{
              background: bgGradient,
              boxShadow: isActive ? '0 0 30px rgba(249,115,22,0.5), 0.5em -0.5em 0.75em rgba(0,0,0,0.5)' : '0.5em -0.5em 0.75em rgba(0,0,0,0.5)'
            }}
          ></span>

          {/* Front Glass Layer */}
          <span
            className={`absolute top-0 left-0 w-full h-full rounded-[1.25em] bg-[hsla(0,0%,100%,0.05)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[80%_50%] flex backdrop-blur-[0.75em] [-webkit-backdrop-filter:blur(0.75em)] [-moz-backdrop-filter:blur(0.75em)] [will-change:transform] transform group-hover:[transform:translate3d(0,0,2em)] ${isSelected ? 'ring-2 ring-white/20' : ''}`}
            style={{
              boxShadow: '0 0 0 0.1em hsla(0, 0%, 100%, 0.2) inset'
            }}
          >
            <span className={`m-auto w-[2em] h-[2em] flex items-center justify-center ${iconStyle}`} aria-hidden="true">
              {isLocked ? <Lock className="w-full h-full" /> : <Icon className="w-full h-full" />}
            </span>
          </span>
        </button>

        {/* Node Labels */}
        <div className={`absolute top-1/2 -translate-y-1/2 flex flex-col pointer-events-none transition-opacity duration-300 w-36 ${isRightSide ? 'left-[5.5rem] text-left' : 'right-[5.5rem] items-end text-right'}`}>
          <span className={`text-sm font-bold leading-tight bg-gradient-to-br bg-clip-text text-transparent ${isLocked ? 'from-white/30 to-white/10' : isActive ? 'from-orange-200 to-orange-500' : 'from-white to-white/60'}`}>
            {milestone.title}
          </span>
          {!isLocked && (
            <span className={`text-xs font-semibold mt-0.5 shadow-sm ${isActive ? 'text-orange-400/90' : 'text-emerald-500/80'}`}>
              +{milestone.xp_reward} XP
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailPanel({ milestone, onClose }: { milestone: Milestone, onClose: () => void }) {
  const Icon = iconMap[milestone.icon] || Trophy;
  const isCompleted = milestone.status === 'completed';
  const isActive = milestone.status === 'active';

  const accentColor = isCompleted ? 'emerald-500' : isActive ? 'orange-500' : 'emerald-400';
  const accentText = isCompleted ? 'text-emerald-500' : isActive ? 'text-orange-400' : 'text-emerald-400';
  const accentBorder = isCompleted ? 'border-emerald-500/30' : isActive ? 'border-orange-500/30' : 'border-emerald-400/30';
  const accentBg = isCompleted ? 'bg-emerald-500/10' : isActive ? 'bg-orange-500/10' : 'bg-emerald-500/10';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-sm overflow-hidden rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_25px_50px_-12px_rgba(0,0,0,0.5)] relative z-10"
      >
        <div className={`absolute inset-x-0 top-0 h-1 bg-${accentColor}`} />
        
        <button onClick={onClose} className="absolute right-4 top-4 text-white/40 hover:text-white transition-colors">
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 pt-8 text-center">
          <div className={`mx-auto flex items-center justify-center w-16 h-16 rounded-full border mb-4 ${accentBg} ${accentBorder} ${accentText}`}>
            <Icon className="h-8 w-8" />
          </div>
          
          <h3 className="font-bold text-xl mb-1 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">{milestone.title}</h3>
          <p className={`text-xs font-bold mb-6 uppercase tracking-widest ${accentText}`}>{milestone.status}</p>

          <div className="space-y-3 text-left bg-white/[0.02] rounded-xl p-4 border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/50">Reward</span>
              <span className={`text-sm font-bold ${accentText}`}>+{milestone.xp_reward} XP</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/50">Progress</span>
              <span className="text-sm font-bold text-white/90">{milestone.summary_metric}</span>
            </div>
          </div>

          <div className="mt-6">
            <Button 
              className={`w-full font-bold text-md h-12 transition-all ${isCompleted ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10' : isActive ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)]'}`} 
              onClick={onClose}
              variant={isCompleted ? "outline" : "default"}
            >
              {isCompleted ? "Close Details" : "Continue Journey"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
