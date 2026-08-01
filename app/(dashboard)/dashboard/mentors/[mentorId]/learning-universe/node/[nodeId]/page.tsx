"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLearningUniverseStore } from '@/stores/learningUniverseStore';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, BookOpen, Brain, Code2, ExternalLink, 
  FileText, Flame, Folder, Layers, Layout, Lightbulb, 
  ListChecks, Target, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';

export default function NodeWorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const mentorId = params.mentorId as string;
  const nodeId = params.nodeId as string;
  
  const { nodes } = useLearningUniverseStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const node = nodes.find(n => n.id === nodeId);

  if (!node) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <Layers className="w-12 h-12 mb-4 opacity-20" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Node Not Found</h2>
        <p className="mb-6">The learning node you are looking for does not exist or hasn't been generated yet.</p>
        <Button onClick={() => router.push(`/dashboard/mentors/${mentorId}/learning-universe`)} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Learning Universe
        </Button>
      </div>
    );
  }

  const { data } = node;

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-white/10 flex items-center px-6 shrink-0 bg-muted/20">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push(`/dashboard/mentors/${mentorId}/learning-universe`)}
          className="mr-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Universe
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer transition-colors">Learning Universe</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">{data.title}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8" data-lenis-prevent="true">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Core Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Title & Overview */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 uppercase text-xs">
                  {data.type.replace('_', ' ')}
                </Badge>
                {data.status === 'completed' && (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
                  </Badge>
                )}
                <Badge variant="outline" className="bg-white/5 text-muted-foreground border-white/10">
                  {data.difficulty || 'Intermediate'}
                </Badge>
              </div>
              
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                {data.title}
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                {data.description || "No description provided for this node."}
              </p>
            </motion.section>

            <Separator className="bg-white/5" />

            {/* AI Summary Placeholder */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" /> AI Summary & Objectives
              </h3>
              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-muted-foreground text-sm italic flex flex-col items-center text-center justify-center min-h-[150px]">
                <Lightbulb className="w-8 h-8 text-primary/40 mb-3" />
                <p>Waiting for LangGraph AI to generate a comprehensive summary and learning objectives for this specific node.</p>
                <Button variant="outline" size="sm" className="mt-4 bg-background border-white/10" disabled>
                  Generate Summary
                </Button>
              </div>
            </section>

            {/* Content & Resources Placeholder */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" /> Study Materials
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer flex items-start gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">Resource Placeholder {i}</h4>
                      <p className="text-xs text-muted-foreground mt-1">Mock learning material reference.</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: AI Tools & Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Stats */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-primary" /> Node Metrics
              </h3>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Reward</span>
                <span className="font-semibold text-purple-400">{data.xp || 100} XP</span>
              </div>
              <Separator className="bg-white/5" />
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Est. Time</span>
                <span className="font-semibold text-blue-400">{data.estimated_time || 45} mins</span>
              </div>
              <Separator className="bg-white/5" />
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{data.progress || 0}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${data.progress || 0}%` }} />
                </div>
              </div>
              <Button className="w-full mt-2" variant="default">
                Mark as Completed
              </Button>
            </div>

            {/* AI Workspace Tools */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-emerald-400" /> AI Learning Tools
              </h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-muted-foreground border-white/5 bg-background hover:bg-white/5 hover:text-foreground">
                  <ListChecks className="w-4 h-4 mr-3" /> Practice Quiz
                </Button>
                <Button variant="outline" className="w-full justify-start text-muted-foreground border-white/5 bg-background hover:bg-white/5 hover:text-foreground">
                  <Brain className="w-4 h-4 mr-3" /> AI Flashcards
                </Button>
                <Button variant="outline" className="w-full justify-start text-muted-foreground border-white/5 bg-background hover:bg-white/5 hover:text-foreground">
                  <Code2 className="w-4 h-4 mr-3" /> Coding Challenges
                </Button>
                <Button variant="outline" className="w-full justify-start text-muted-foreground border-white/5 bg-background hover:bg-white/5 hover:text-foreground">
                  <Layout className="w-4 h-4 mr-3" /> Micro-Projects
                </Button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
