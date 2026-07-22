"use client";

import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export default function GlobalSettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and global settings.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how SuperMentor.ai looks on your device.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              className="flex-1 justify-start gap-3 h-14"
              onClick={() => setTheme("light")}
            >
              <Sun className="h-5 w-5" />
              <div className="text-left">
                <p className="font-semibold">Light</p>
                <p className="text-xs font-normal opacity-80">Always use light mode</p>
              </div>
            </Button>
            
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              className="flex-1 justify-start gap-3 h-14"
              onClick={() => setTheme("dark")}
            >
              <Moon className="h-5 w-5" />
              <div className="text-left">
                <p className="font-semibold">Dark</p>
                <p className="text-xs font-normal opacity-80">Always use dark mode</p>
              </div>
            </Button>
            
            <Button
              variant={theme === "system" ? "default" : "outline"}
              className="flex-1 justify-start gap-3 h-14"
              onClick={() => setTheme("system")}
            >
              <Monitor className="h-5 w-5" />
              <div className="text-left">
                <p className="font-semibold">System</p>
                <p className="text-xs font-normal opacity-80">Match your OS</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
