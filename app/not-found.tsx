"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Premium Background Glow */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      {/* Decorative Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none dark:opacity-10" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20z' fill='currentColor' fill-rule='evenodd'/%3E%3C/svg%3E")` }} />

      <div className="text-center space-y-8 p-8 relative z-10 flex flex-col items-center max-w-2xl">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 mb-4">
          <Sparkles className="h-12 w-12 text-primary" />
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter">404</h1>
        
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Lost in the digital void
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track with your AI Mentors.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
          <Link href="/dashboard">
            <Button size="lg" className="gap-2 rounded-full shadow-lg hover:shadow-primary/25 transition-all">
              <Home className="h-5 w-5" />
              Go to Dashboard
            </Button>
          </Link>
          <Button variant="ghost" size="lg" className="gap-2 rounded-full" onClick={() => { if (typeof window !== 'undefined') window.history.back() }}>
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
