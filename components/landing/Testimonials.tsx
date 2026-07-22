"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Frontend Developer @ Vercel",
    image: "SJ",
    content: "SuperMentor completely changed how I learn. The AI mentor explained React Server Components better than any tutorial I could find. I landed my dream job within 3 months.",
  },
  {
    name: "David Chen",
    role: "CS Student @ Stanford",
    image: "DC",
    content: "The roadmap generator is insanely good. It broke down complex algorithms into manageable daily chunks. The mock interviews were terrifyingly realistic, but exactly what I needed.",
  },
  {
    name: "Elena Rodriguez",
    role: "Fullstack Engineer",
    image: "ER",
    content: "I use the resume analyzer before every application. It caught so many missing keywords that I didn't even realize were in the job description. Worth every penny.",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 relative w-full overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Loved by <span className="text-gradient-primary">thousands</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Don't just take our word for it. Here's what our community has to say.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="glass-card rounded-2xl p-8 flex flex-col gap-6 relative group border border-white/10 dark:border-white/5 hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              
              <p className="text-foreground/80 leading-relaxed text-sm md:text-base flex-1">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-white font-semibold text-sm shadow-inner">
                  {testimonial.image}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-foreground">{testimonial.name}</span>
                  <span className="text-xs text-muted-foreground">{testimonial.role}</span>
                </div>
              </div>

              {/* Hover Glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
