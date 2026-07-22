"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, LayoutDashboard, FileText, Target, TrendingUp, Settings, Bell, Search } from "lucide-react";

export function DashboardPreview() {
  return (
    <section className="py-24 relative w-full overflow-hidden">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6 lg:px-8">
        
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Experience the <span className="text-gradient-primary">Future</span> of Learning
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            A command center designed for ultimate focus and productivity.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full aspect-[16/10] max-h-[800px] rounded-2xl glass-card overflow-hidden border border-white/20 dark:border-white/10 shadow-2xl flex"
        >
          {/* Top Bar (MacOS style) */}
          <div className="absolute top-0 left-0 right-0 h-10 bg-background/50 backdrop-blur-sm border-b border-border/50 flex items-center px-4 z-20">
            <div className="flex gap-2">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
            </div>
            <div className="mx-auto text-xs text-muted-foreground font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> app.supermentor.ai
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-64 h-full bg-background/60 border-r border-border/50 pt-16 flex flex-col justify-between hidden md:flex">
            <div className="px-4 flex flex-col gap-2">
              {[
                { icon: LayoutDashboard, label: "Dashboard", active: true },
                { icon: FileText, label: "Resumes" },
                { icon: Target, label: "Interviews" },
                { icon: TrendingUp, label: "Analytics" },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
              ))}
            </div>
            <div className="px-4 pb-6 flex flex-col gap-2">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                <Settings className="h-4 w-4" /> Settings
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 h-full pt-14 flex flex-col bg-background/40">
            {/* Header */}
            <div className="px-8 py-4 flex justify-between items-center border-b border-border/30">
              <div className="text-xl font-semibold">Welcome back, Alex</div>
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center relative">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
                </div>
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500" />
              </div>
            </div>

            {/* Dashboard Content Grid */}
            <div className="p-8 grid grid-cols-3 gap-6 overflow-y-auto">
              
              {/* Main Chart */}
              <div className="col-span-3 lg:col-span-2 glass rounded-xl p-6 flex flex-col gap-4">
                <div className="text-sm font-medium text-muted-foreground">Learning Velocity</div>
                <div className="flex-1 min-h-[200px] flex items-end gap-2">
                  {[20, 35, 25, 45, 60, 50, 75, 65, 85, 70, 95, 80].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.05 }}
                      className="flex-1 bg-gradient-to-t from-primary/20 to-primary/60 rounded-t-sm"
                    />
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div className="col-span-3 lg:col-span-1 glass rounded-xl p-6 flex flex-col gap-4">
                <div className="text-sm font-medium text-muted-foreground">Up Next</div>
                <div className="flex flex-col gap-3">
                  {[
                    { title: "React Context API", type: "Lesson", time: "15 min" },
                    { title: "Mock Interview: System Design", type: "Practice", time: "45 min" },
                    { title: "Update Resume", type: "Task", time: "10 min" }
                  ].map((task, i) => (
                    <div key={i} className="flex flex-col gap-1 p-3 rounded-lg bg-background/50 border border-border/50">
                      <div className="text-sm font-medium">{task.title}</div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{task.type}</span>
                        <span>{task.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
