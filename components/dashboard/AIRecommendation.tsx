"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Play, Lightbulb, TrendingUp } from "lucide-react";

export function AIRecommendation() {
  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="h-6 w-6 text-orange-500" />
        <h2 className="text-2xl font-bold tracking-tight">AI Recommendations</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="h-full border-muted/40 bg-background/50 backdrop-blur-md shadow-sm hover:shadow-md hover:border-orange-500/30 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all duration-500 pointer-events-none" />
            <CardContent className="p-8 flex flex-col justify-between h-full relative z-10">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-orange-500">
                  <TrendingUp className="h-4 w-4" />
                  Review Mistakes
                </div>
                <h4 className="text-xl font-bold tracking-tight">Solidify Authentication Concepts</h4>
                <p className="text-muted-foreground text-base">
                  Based on your recent session in Fullstack Developer, a quick review of JWT tokens might help solidify your understanding.
                </p>
              </div>
              <Button variant="secondary" size="lg" className="w-full sm:w-auto mt-8 gap-2 bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-all">
                Start Practice <Play className="h-4 w-4 fill-current" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="h-full border-muted/40 bg-background/50 backdrop-blur-md shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-500 pointer-events-none" />
            <CardContent className="p-8 flex flex-col justify-between h-full relative z-10">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-blue-500">
                  <Sparkles className="h-4 w-4" />
                  Knowledge Base
                </div>
                <h4 className="text-xl font-bold tracking-tight">System Architecture Deep Dive</h4>
                <p className="text-muted-foreground text-base">
                  You uploaded a new PDF recently. Want me to generate a 10-question quiz based on its contents to test your knowledge?
                </p>
              </div>
              <Button variant="secondary" size="lg" className="w-full sm:w-auto mt-8 gap-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all">
                Generate Quiz <Sparkles className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
