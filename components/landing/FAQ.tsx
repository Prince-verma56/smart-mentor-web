"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How does the AI Mentor differ from ChatGPT?",
    answer: "SuperMentor AI is fine-tuned specifically for learning and career growth. It has full context of your codebase, your learning roadmap, and your resume. It doesn't just give you the answer; it guides you to understand the concepts, just like a real mentor.",
  },
  {
    question: "Can I use SuperMentor for interview preparation?",
    answer: "Yes! Our Mock Interview feature uses voice and text to simulate real technical and behavioral interviews. It evaluates your answers, provides a detailed score, and highlights areas for improvement based on industry standards.",
  },
  {
    question: "Do I need prior coding experience to start?",
    answer: "Not at all. The Roadmap Generator assesses your current skill level and creates a curriculum tailored to you, whether you're a complete beginner writing your first HTML tag or a senior engineer learning Rust.",
  },
  {
    question: "How accurate is the Resume Analyzer?",
    answer: "Our Resume Analyzer uses the same parsing technology and keyword matching algorithms used by modern Applicant Tracking Systems (ATS) at top tech companies. It identifies missing keywords, formatting issues, and impact statement improvements.",
  },
  {
    question: "Can I cancel my Pro subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time from your account settings. You'll retain access to Pro features until the end of your current billing period.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 relative w-full">
      <div className="mx-auto w-full max-w-3xl px-4 md:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about the product and billing.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${
                openIndex === index ? "border-primary/30 shadow-md" : "border-white/10 dark:border-white/5 hover:border-white/20"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className="font-medium text-foreground pr-4">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex-shrink-0 h-6 w-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </button>
              
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 pt-0 text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
