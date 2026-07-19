"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Menu, X, Sparkles, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isSignedIn, isLoaded, role } = useAuth();

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/#pricing" },
  ];

  return (
    <header
      className={`fixed top-0 z-50 w-full border-b transition-all duration-300 ${
        isScrolled
          ? "border-slate-200/50 bg-white/70 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/70"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 shadow-sm shadow-violet-600/20 group-hover:bg-violet-700 transition-colors">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                SuperMentor<span className="text-violet-600 dark:text-violet-500">.ai</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links (Hidden on small screens) */}
          <nav className="hidden md:flex md:items-center md:gap-8">
            {!isSignedIn &&
              navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-slate-600 transition-colors hover:text-violet-600 dark:text-slate-300 dark:hover:text-violet-400"
                >
                  {link.name}
                </Link>
              ))}
          </nav>

          {/* Right Section: Auth & Theme */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {isLoaded ? (
              isSignedIn ? (
                <div className="flex items-center gap-4">
                  {/* Quick dashboard link if they are on a public page */}
                  {!pathname.startsWith("/dashboard") && (
                    <Link
                      href={`/dashboard/${role === "admin" ? "admin" : role === "instructor" ? "instructor" : "student"}`}
                      className="hidden items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 sm:flex"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  )}
                  {/* Clerk UserButton: fully styled, responsive, handles profile logic */}
                  <div className="relative z-50 flex items-center">
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "h-9 w-9 ring-2 ring-slate-200 dark:ring-slate-800",
                          userButtonPopoverCard: "shadow-xl border border-slate-200 dark:border-slate-800",
                        },
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="hidden items-center gap-3 md:flex">
                  <Link
                    href="/login"
                    className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-700"
                  >
                    Get Started
                  </Link>
                </div>
              )
            ) : (
              // Loading skeleton for auth section
              <div className="flex items-center gap-3">
                <div className="hidden h-9 w-16 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800 md:block" />
                <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 top-16 border-b border-slate-200/50 bg-white/95 px-4 pb-6 pt-4 shadow-lg backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-950/95 md:hidden"
          >
            <div className="flex flex-col gap-4">
              {!isSignedIn &&
                navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-base font-medium text-slate-600 hover:text-violet-600 dark:text-slate-300 dark:hover:text-violet-400"
                  >
                    {link.name}
                  </Link>
                ))}
              {isSignedIn && (
                <Link
                  href={`/dashboard/${role === "admin" ? "admin" : role === "instructor" ? "instructor" : "student"}`}
                  className="flex items-center gap-2 text-base font-medium text-slate-600 hover:text-violet-600 dark:text-slate-300 dark:hover:text-violet-400"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Go to Dashboard
                </Link>
              )}
              <div className="mt-4 flex items-center justify-between border-t border-slate-200/50 pt-4 dark:border-slate-800/50 sm:hidden">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Theme</span>
                <ThemeToggle />
              </div>
              {!isSignedIn && isLoaded && (
                <div className="mt-4 flex flex-col gap-3 border-t border-slate-200/50 pt-4 dark:border-slate-800/50">
                  <Link
                    href="/login"
                    className="flex w-full justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="flex w-full justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
