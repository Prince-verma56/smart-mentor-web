"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Hobby",
    price: "$0",
    description: "Perfect for students getting started.",
    features: [
      "5 AI conversations per day",
      "1 Roadmap generation",
      "Basic resume analysis",
      "Community support",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mo",
    description: "For serious learners accelerating their career.",
    features: [
      "Unlimited AI conversations",
      "Unlimited dynamic roadmaps",
      "Deep resume & ATS analysis",
      "Mock interviews (Voice + Text)",
      "Project idea generation",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$49",
    period: "/mo",
    description: "For teams and coding bootcamps.",
    features: [
      "Everything in Pro",
      "Custom curriculum design",
      "Team analytics dashboard",
      "API access",
      "Dedicated success manager",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 relative w-full">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Simple, <span className="text-gradient-primary">transparent</span> pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Invest in your career with plans that scale with your ambitions.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center gap-3 mt-4">
            <span className={`text-sm ${!isAnnual ? "text-foreground font-medium" : "text-muted-foreground"}`}>Monthly</span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-12 h-6 rounded-full bg-muted-foreground/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <motion.div 
                className="absolute top-1 left-1 w-4 h-4 rounded-full bg-primary"
                animate={{ x: isAnnual ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm ${isAnnual ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              Annually <span className="text-primary text-xs ml-1 font-semibold">-20%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex flex-col p-8 rounded-3xl glass-card transition-all duration-300 ${
                plan.popular 
                  ? "border-primary/50 shadow-2xl shadow-primary/10 md:-translate-y-4 md:scale-105 z-10" 
                  : "border-white/10 dark:border-white/5 hover:border-primary/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/30">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground min-h-[40px]">{plan.description}</p>
              </div>

              <div className="mb-8 flex items-end gap-1">
                <span className="text-4xl font-bold text-foreground">
                  {isAnnual && plan.price !== "$0" 
                    ? `$${Math.floor(parseInt(plan.price.replace('$', '')) * 0.8)}` 
                    : plan.price}
                </span>
                {plan.period && <span className="text-muted-foreground mb-1">{plan.period}</span>}
              </div>

              <ul className="flex flex-col gap-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                variant={plan.popular ? "default" : "outline"} 
                className={`w-full rounded-full h-12 text-sm font-semibold transition-all ${
                  plan.popular ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] shadow-lg shadow-primary/25" : ""
                }`}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
