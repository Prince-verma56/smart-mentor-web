"use client";

import React, { useEffect, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { useRef } from "react";

const stats = [
  { value: 25000, label: "Active Students", suffix: "+" },
  { value: 500000, label: "AI Conversations", suffix: "+" },
  { value: 1200, label: "Roadmaps Generated", suffix: "+" },
  { value: 96, label: "Success Rate", suffix: "%" },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      let startTimestamp: number;
      const duration = 2000; // 2 seconds

      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // easeOutQuart
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        
        setDisplayValue(Math.floor(easeProgress * value));

        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          setDisplayValue(value);
        }
      };

      window.requestAnimationFrame(step);
    }
  }, [isInView, value]);

  const formattedValue = new Intl.NumberFormat("en-US").format(displayValue);

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground mb-2">
      {formattedValue}{suffix}
    </div>
  );
}

export function Stats() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="py-24 relative w-full overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 dark:bg-primary/5 mask-image:linear-gradient(to_bottom,transparent,black,transparent)]" />
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
        >
          {stats.map((stat, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              className="flex flex-col items-center justify-center text-center p-6 rounded-2xl glass transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30"
            >
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              <div className="text-sm md:text-base font-medium text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
