"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, Mic, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const chatSequence = [
  { role: "user", text: "Can you help me understand how React Server Components work?" },
  { role: "ai", text: "React Server Components (RSC) allow you to render components on the server before sending them to the client. This reduces bundle size and improves performance." },
  { role: "ai", isCode: true, text: `// Example of a Server Component\nexport default async function Page() {\n  const data = await fetch('https://api.example.com/data');\n  const items = await data.json();\n\n  return (\n    <ul>\n      {items.map(item => (\n        <li key={item.id}>{item.name}</li>\n      ))}\n    </ul>\n  );\n}` },
  { role: "user", text: "Ah, so they can fetch data directly without useEffect?" },
  { role: "ai", text: "Exactly! 🎉 You don't need `useEffect` or `useState` for data fetching in Server Components. They execute once on the server, making them faster and more secure since sensitive keys don't reach the browser." },
];

export function AIMentorShowcase() {
  const [messages, setMessages] = useState<{role: string, text: string, isCode?: boolean}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sequenceIndex, setSequenceIndex] = useState(0);

  useEffect(() => {
    // Only run if we haven't shown all messages
    if (sequenceIndex >= chatSequence.length) return;

    const currentMsg = chatSequence[sequenceIndex];
    
    // Simulate reading/thinking delay
    const delay = currentMsg.role === "ai" ? 1500 : 800;
    
    if (currentMsg.role === "ai") setIsTyping(true);

    const timeout = setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, currentMsg]);
      setSequenceIndex(prev => prev + 1);
    }, delay);

    return () => clearTimeout(timeout);
  }, [sequenceIndex]);

  return (
    <section id="ai-mentor" className="py-24 relative w-full overflow-hidden">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left: Text Content */}
          <div className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary font-medium">
              <Sparkles className="h-4 w-4" />
              <span>Available 24/7</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              Meet your new <span className="text-gradient-primary">AI Mentor</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Stuck on a bug? Need career advice? Or preparing for an interview? Your AI mentor has context on your entire learning journey and codebase.
            </p>
            <ul className="flex flex-col gap-4 mt-4">
              {[
                "Context-aware code reviews",
                "Personalized interview mockups",
                "Instant explanation of complex topics",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Sparkles className="h-3 w-3" />
                  </div>
                  <span className="font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Chat UI Showcase */}
          <div className="relative h-[600px] w-full flex items-center justify-center perspective-[1000px]">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/30 blur-[100px] rounded-full pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, rotateY: 10, x: 20 }}
              whileInView={{ opacity: 1, rotateY: 0, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="glass-card w-full max-w-md h-[500px] rounded-2xl flex flex-col overflow-hidden shadow-2xl relative z-10 border border-white/20 dark:border-white/10"
            >
              {/* Chat Header */}
              <div className="px-4 py-3 border-b border-border/50 bg-background/50 backdrop-blur-md flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                </div>
                <div>
                  <div className="font-semibold text-sm">SuperMentor AI</div>
                  <div className="text-xs text-muted-foreground">Online</div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
                <AnimatePresence>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "self-end flex-row-reverse" : "self-start"}`}
                    >
                      <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-gradient-to-tr from-purple-500 to-blue-500 text-white" : "bg-primary/20 text-primary"}`}>
                        {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      
                      {msg.isCode ? (
                        <div className="rounded-2xl rounded-tl-none bg-background border border-border p-4 text-xs font-mono text-zinc-300 shadow-sm w-full overflow-hidden">
                          <pre className="whitespace-pre-wrap">{msg.text}</pre>
                        </div>
                      ) : (
                        <div className={`p-3 text-sm shadow-sm ${
                          msg.role === "user" 
                            ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-none" 
                            : "bg-muted/80 backdrop-blur-sm rounded-2xl rounded-tl-none"
                        }`}>
                          {msg.text}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 max-w-[80%] self-start"
                  >
                    <div className="h-8 w-8 shrink-0 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted/80 backdrop-blur-sm p-4 rounded-2xl rounded-tl-none flex gap-1 items-center">
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-border/50 bg-background/50 backdrop-blur-md">
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-muted-foreground flex gap-2">
                    <Mic className="h-4 w-4 hover:text-primary cursor-pointer transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Ask anything..." 
                    className="w-full bg-muted/50 border border-border/50 rounded-full pl-10 pr-12 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    disabled
                  />
                  <div className="absolute right-1">
                    <Button size="icon" className="h-7 w-7 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Send className="h-3 w-3 ml-0.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
