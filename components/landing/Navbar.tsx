"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Sparkles, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const { theme, setTheme } = useTheme();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "AI Mentor", href: "#ai-mentor" },
    { name: "Roadmaps", href: "#roadmaps" },
    { name: "Pricing", href: "#pricing" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-6 pb-4 transition-all duration-300 ${
        isScrolled ? "pt-4" : "pt-6"
      }`}
    >
      <div
        className={`flex w-full max-w-5xl items-center justify-between rounded-full px-6 py-3 transition-all duration-300 ${
          isScrolled
            ? "glass-card shadow-lg"
            : "bg-transparent border border-transparent"
        }`}
      >
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5 transition-transform group-hover:scale-110" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            SuperMentor<span className="text-primary">.ai</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
               href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            <span className="sr-only">Toggle theme</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="dark:hidden"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="hidden dark:block"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          </Button>
          <Link href="/login">
            <Button variant="ghost" className="rounded-full font-medium">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="rounded-full bg-primary font-medium text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-105">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute left-4 right-4 top-24 rounded-2xl glass-card p-4 shadow-xl md:hidden flex flex-col gap-4 border border-border"
        >
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="h-px w-full bg-border" />
          <div className="flex flex-col gap-2">
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full justify-center">
                Sign In
              </Button>
            </Link>
            <Link href="/signup" className="w-full">
              <Button className="w-full justify-center bg-primary">
                Get Started
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
