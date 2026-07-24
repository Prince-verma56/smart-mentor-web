"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { setTheme, theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9 rounded-full bg-slate-200/50 dark:bg-muted/50 animate-pulse" />;
  }

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-foreground0 transition-colors hover:bg-slate-200 hover:text-foreground dark:bg-muted dark:text-muted-foreground dark:hover:bg-slate-700 dark:hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
      aria-label="Toggle theme"
    >
      <Sun className="h-[1.125rem] w-[1.125rem] rotate-0 scale-100 transition-transform duration-300 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.125rem] w-[1.125rem] rotate-90 scale-0 transition-transform duration-300 dark:rotate-0 dark:scale-100" />
    </button>
  );
}
