"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionTemplate } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

function MagneticButton({ children, className }: { children: React.ReactNode, className?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

export function CTA() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);
  
  // Mouse tracking for glowing background effect
  let mouseX = useTransform(scrollYProgress, value => value * 0);
  let mouseY = useTransform(scrollYProgress, value => value * 0);
  
  return (
    <section ref={containerRef} className="py-24 relative w-full overflow-hidden flex items-center justify-center">
      <motion.div 
        style={{ scale, opacity, y }}
        className="w-[95%] max-w-6xl mx-auto rounded-[3rem] relative overflow-hidden bg-background border border-white/10 shadow-2xl p-12 md:p-24 text-center flex flex-col items-center gap-8"
      >
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/10 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(120,50,255,0.2)_0%,transparent_70%)] pointer-events-none" />
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20z' fill='%23ffffff' fill-rule='evenodd'/%3E%3C/svg%3E")` }} />

        <div className="relative z-10 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/20 px-4 py-1.5 text-sm text-primary font-medium">
          <Sparkles className="h-4 w-4" />
          <span>Ready to transform your career?</span>
        </div>

        <h2 className="relative z-10 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-3xl leading-tight">
          Start building your career with AI <span className="text-gradient-primary">Today</span>
        </h2>

        <p className="relative z-10 text-xl text-muted-foreground max-w-xl">
          Join thousands of developers and students accelerating their learning journey. It's free to get started.
        </p>

        <div className="relative z-10 mt-8 flex flex-col sm:flex-row items-center gap-4">
          <MagneticButton className="relative flex items-center justify-center gap-2 rounded-full bg-white text-black px-8 py-4 text-lg font-bold hover:bg-zinc-200 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.3)]">
            Get Started for Free
            <ArrowRight className="h-5 w-5" />
          </MagneticButton>
          <Button variant="ghost" size="lg" className="rounded-full px-8 py-4 text-lg text-white hover:bg-white/10 hover:text-white transition-colors h-[60px]">
            Book a Demo
          </Button>
        </div>

        {/* Floating Particles (CSS only for simplicity) */}
        {mounted && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(10)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-1 h-1 bg-primary/50 rounded-full animate-ping"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${Math.random() * 3 + 2}s`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}
