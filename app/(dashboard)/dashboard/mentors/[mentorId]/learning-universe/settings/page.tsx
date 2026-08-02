import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Sliders, Database, ShieldAlert, Sparkles } from 'lucide-react';

export default async function WorkspaceSettingsPage({ params }: { params: Promise<{ mentorId: string }> }) {
  const { mentorId } = await params;

  return (
    <div className="flex-1 overflow-y-auto p-10 bg-gradient-to-b from-zinc-950 to-black h-full w-full">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white/90">Workspace Settings</h1>
          <p className="text-muted-foreground mt-2">Manage preferences, collaboration, and advanced configurations for this workspace.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 pb-20">
          {/* Navigation Column */}
          <div className="w-full md:w-64 shrink-0 space-y-1">
            <Button variant="ghost" className="w-full justify-start gap-3 bg-white/5 text-white font-medium rounded-xl h-10">
              <Settings className="w-4 h-4" /> General
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-white rounded-xl h-10 transition-colors">
              <Sparkles className="w-4 h-4" /> AI Preferences
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-white rounded-xl h-10 transition-colors">
              <Sliders className="w-4 h-4" /> Canvas Preferences
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-white rounded-xl h-10 transition-colors">
              <Database className="w-4 h-4" /> Export Options
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-xl h-10 transition-colors mt-4">
              <ShieldAlert className="w-4 h-4" /> Danger Zone
            </Button>
          </div>

          {/* Content Column */}
          <div className="flex-1 space-y-8">
            {/* General Settings */}
            <Card className="bg-white/[0.03] border-white/10 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-white/[0.02] border-b border-white/10 px-6 py-4">
                <CardTitle className="text-lg text-white/90">General</CardTitle>
                <CardDescription>Basic information about this workspace.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 p-6">
                <div className="space-y-2.5">
                  <Label htmlFor="name" className="text-white/70">Workspace Name</Label>
                  <Input id="name" defaultValue="Official Workspace" className="bg-black/50 border-white/10 h-11 rounded-xl" />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="description" className="text-white/70">Description</Label>
                  <Input id="description" placeholder="A brief description of this workspace..." className="bg-black/50 border-white/10 h-11 rounded-xl" />
                </div>
              </CardContent>
            </Card>

            {/* AI Preferences */}
            <Card className="bg-white/[0.03] border-white/10 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-white/[0.02] border-b border-white/10 px-6 py-4">
                <CardTitle className="text-lg text-white/90">AI Preferences</CardTitle>
                <CardDescription>Configure AI generation behavior for this workspace.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 pr-4">
                    <Label className="text-white/90">Auto-Generate Topics</Label>
                    <p className="text-sm text-muted-foreground">Allow AI to suggest subtopics when expanding nodes.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1 pr-4">
                    <Label className="text-white/90">Strict Mode</Label>
                    <p className="text-sm text-muted-foreground">AI will stick closely to the syllabus and avoid expanding out of scope.</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            {/* Canvas Preferences */}
            <Card className="bg-white/[0.03] border-white/10 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-white/[0.02] border-b border-white/10 px-6 py-4">
                <CardTitle className="text-lg text-white/90">Canvas Preferences</CardTitle>
                <CardDescription>Default behaviors for new canvases in this workspace.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 pr-4">
                    <Label className="text-white/90">Auto-Save</Label>
                    <p className="text-sm text-muted-foreground">Automatically save changes to the cloud every 30 seconds.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1 pr-4">
                    <Label className="text-white/90">Snap to Grid</Label>
                    <p className="text-sm text-muted-foreground">Force nodes to align to the grid when dragged.</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-900/30 bg-red-950/10 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-red-950/30 border-b border-red-900/30 px-6 py-4">
                <CardTitle className="text-lg text-red-400">Danger Zone</CardTitle>
                <CardDescription className="text-red-400/70">Irreversible and destructive actions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between p-4 rounded-xl border border-red-900/30 bg-red-950/20">
                  <div>
                    <h4 className="font-medium text-white/90">Archive Workspace</h4>
                    <p className="text-sm text-red-200/50 mt-1">Make this workspace read-only and hide it from the active list.</p>
                  </div>
                  <Button variant="outline" className="border-red-900/50 hover:bg-red-900/40 text-red-400 transition-colors">Archive Workspace</Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-red-900/30 bg-red-950/20">
                  <div>
                    <h4 className="font-medium text-white/90">Delete Workspace</h4>
                    <p className="text-sm text-red-200/50 mt-1">Permanently remove this workspace and all its canvases. This cannot be undone.</p>
                  </div>
                  <Button variant="destructive" className="bg-red-600 hover:bg-red-700 transition-colors">Delete Workspace</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
