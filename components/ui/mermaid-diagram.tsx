"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Loader2 } from "lucide-react";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
  fontFamily: "var(--font-sans)",
});

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isRendering, setIsRendering] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useRef(`mermaid-${Math.random().toString(36).substring(7)}`);

  useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      try {
        setIsRendering(true);
        setError("");
        
        // Wait for next tick to ensure container is ready
        await new Promise(resolve => setTimeout(resolve, 0));
        
        const { svg: svgCode } = await mermaid.render(id.current, chart);
        
        if (isMounted) {
          setSvg(svgCode);
          setIsRendering(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || "Failed to render diagram");
          setIsRendering(false);
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
      const el = document.getElementById(id.current);
      if (el) el.remove();
    };
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 border border-destructive/20 bg-destructive/10 text-destructive text-sm rounded-lg overflow-auto font-mono whitespace-pre">
        {error}
      </div>
    );
  }

  return (
    <div className="relative min-h-[100px] flex items-center justify-center bg-black/20 rounded-xl border border-white/10 p-4 overflow-x-auto overflow-y-hidden my-5">
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm z-10">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      )}
      <div 
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: svg }} 
        className="mermaid-container w-full max-w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
      />
    </div>
  );
}
