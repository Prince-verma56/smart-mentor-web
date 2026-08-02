"use client";

import React, { use } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileDown, FileJson, Image as ImageIcon, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useWorkspaceStore, useCanvasStore } from '@/stores/learningUniverseStore';

export default function WorkspaceExportPage({ params }: { params: Promise<{ mentorId: string }> }) {
  const { mentorId } = use(params);

  // We fetch the active canvas for export, or we could export the whole workspace.
  // For now, we export the active canvas if there is one.
  const activeCanvasId = useWorkspaceStore(s => s.activeCanvasId);
  const canvases = useWorkspaceStore(s => s.canvases);
  const activeCanvas = canvases.find(c => c.id === activeCanvasId) || canvases[0];

  const handleExportLuv = async () => {
    try {
      const { LuvExportEngine } = await import('@/lib/export/LuvExportEngine');
      const { nodes, edges, viewport } = useCanvasStore.getState();
      const luvData = LuvExportEngine.export({
        canvasName: activeCanvas?.title || activeCanvas?.name || 'My Canvas',
        canvasId: activeCanvas?.id || undefined,
        nodes, edges, viewport,
        layoutMode: require('@/stores/learningUniverseStore').useLayoutStore.getState().layoutMode,
      });
      LuvExportEngine.downloadAsLuv(luvData);
      toast.success('Exported as .luv file');
    } catch (err: any) {
      toast.error('Failed to export: ' + err.message);
    }
  };

  const handleExportMarkdown = async () => {
    try {
      const { LuvExportEngine } = await import('@/lib/export/LuvExportEngine');
      const { nodes, edges } = useCanvasStore.getState();
      const md = LuvExportEngine.exportAsMarkdown({
        canvasName: activeCanvas?.title || activeCanvas?.name || 'My Canvas',
        nodes, edges,
      });
      LuvExportEngine.downloadAsMarkdown(md, activeCanvas?.title || 'canvas');
      toast.success('Exported rich Markdown');
    } catch (err: any) {
      toast.error('Failed to export: ' + err.message);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-10 bg-gradient-to-b from-zinc-950 to-black h-full w-full">
      <div className="max-w-4xl mx-auto space-y-10">
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white/90">Export Workspace</h1>
          <p className="text-muted-foreground mt-2">Download your canvases and data in multiple formats for sharing or backup.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <Card className="bg-white/[0.02] border-emerald-500/20 shadow-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
            <CardHeader>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <CardTitle className="text-emerald-400">.LUV Format</CardTitle>
              <CardDescription>Our proprietary format containing the full knowledge graph, metadata, and exact canvas state.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleExportLuv} className="w-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20">
                <Download className="w-4 h-4 mr-2" />
                Export as .luv
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.02] border-white/5 shadow-none">
            <CardHeader>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 mb-2">
                <FileDown className="w-5 h-5 text-muted-foreground" />
              </div>
              <CardTitle>Markdown</CardTitle>
              <CardDescription>A human-readable markdown file with a structured outline of all nodes, topics, and descriptions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={handleExportMarkdown} className="w-full border-white/10 hover:bg-white/5">
                <FileDown className="w-4 h-4 mr-2" />
                Export as Markdown
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.02] border-white/5 shadow-none opacity-50">
            <CardHeader>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 mb-2">
                <FileJson className="w-5 h-5 text-muted-foreground" />
              </div>
              <CardTitle>Raw JSON (Coming Soon)</CardTitle>
              <CardDescription>Export the raw ReactFlow node and edge data structures for programmatic use.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" disabled className="w-full border-white/10">
                <FileJson className="w-4 h-4 mr-2" />
                Export as JSON
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.02] border-white/5 shadow-none opacity-50">
            <CardHeader>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 mb-2">
                <ImageIcon className="w-5 h-5 text-muted-foreground" />
              </div>
              <CardTitle>Image (Coming Soon)</CardTitle>
              <CardDescription>Generate a high-resolution PNG or SVG image of the current canvas layout.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" disabled className="w-full border-white/10">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  PNG
                </Button>
                <Button variant="outline" disabled className="w-full border-white/10">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  SVG
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
