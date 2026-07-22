import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MentorWorkspace } from "@/components/mentors/MentorWorkspace";
import { mentorService } from "@/services/mentorService";
import { MOCK_ROADMAPS } from "@/lib/mock-data/mentor-roadmap";
import { MOCK_PROGRESS } from "@/lib/mock-data/mentor-progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Brain, MessageSquare, Mic, FolderOpen, AlertTriangle } from "lucide-react";

interface SettingsPageProps {
  params: Promise<{ mentorId: string }>;
}

export async function generateMetadata({ params }: SettingsPageProps): Promise<Metadata> {
  const { mentorId } = await params;
  const mentor = await mentorService.getMentorById(mentorId, "user_2test123");
  return {
    title: mentor ? `Settings - ${mentor.name}` : "Mentor Settings",
  };
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { mentorId } = await params;

  // Real database fetch via our Service Layer
  const mentor = await mentorService.getMentorById(mentorId, "user_2test123");

  if (!mentor) {
    notFound();
  }

  const stats = MOCK_PROGRESS[mentorId] ?? mentor.stats;
  const roadmap = MOCK_ROADMAPS[mentorId];

  return (
    <MentorWorkspace mentor={mentor} stats={stats} roadmap={roadmap} view="settings">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mentor Settings</h1>
          <p className="text-muted-foreground">Manage {mentor.name}'s configuration, personality, and data.</p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-muted/50 rounded-lg">
            <TabsTrigger value="general" className="gap-2 data-[state=active]:bg-background">
              <Settings className="h-4 w-4" /> General
            </TabsTrigger>
            <TabsTrigger value="style" className="gap-2 data-[state=active]:bg-background">
              <Brain className="h-4 w-4" /> Teaching Style
            </TabsTrigger>
            <TabsTrigger value="conversation" className="gap-2 data-[state=active]:bg-background">
              <MessageSquare className="h-4 w-4" /> Conversation
            </TabsTrigger>
            <TabsTrigger value="voice" className="gap-2 data-[state=active]:bg-background">
              <Mic className="h-4 w-4" /> Voice
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-2 data-[state=active]:bg-background">
              <FolderOpen className="h-4 w-4" /> Resources
            </TabsTrigger>
            <TabsTrigger value="danger" className="gap-2 text-destructive data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive">
              <AlertTriangle className="h-4 w-4" /> Danger Zone
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>Update your mentor's basic details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/30 flex items-center justify-center text-sm text-muted-foreground h-32">
                  General settings form coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="style" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Teaching Style & Personality</CardTitle>
                <CardDescription>Configure how this mentor explains concepts.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg bg-muted/30 flex items-center justify-center text-sm text-muted-foreground h-32">
                  Teaching style configuration coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversation" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Conversation Memory</CardTitle>
                <CardDescription>Manage what this mentor remembers about you.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg bg-muted/30 flex items-center justify-center text-sm text-muted-foreground h-32">
                  Memory management coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="voice" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Voice Integration</CardTitle>
                <CardDescription>Connect a Vapi or ElevenLabs voice profile.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 border border-dashed rounded-lg bg-primary/5 flex flex-col items-center justify-center text-center space-y-3 h-40">
                  <Mic className="h-8 w-8 text-primary/50" />
                  <div>
                    <p className="text-sm font-medium">Voice AI Coming Soon</p>
                    <p className="text-xs text-muted-foreground max-w-xs mt-1">Live voice sessions will be enabled in the next phase.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resource Library</CardTitle>
                <CardDescription>Manage documents and contexts provided to this mentor.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg bg-muted/30 flex items-center justify-center text-sm text-muted-foreground h-32">
                  Resource management coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="danger" className="mt-6 space-y-4">
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions for this mentor.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 border border-destructive/20 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Archive Mentor</h4>
                    <p className="text-xs text-muted-foreground mt-1">Hide this mentor from your dashboard but keep its data.</p>
                  </div>
                  <Button variant="outline" className="shrink-0" disabled>Archive</Button>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Delete Mentor</h4>
                    <p className="text-xs text-muted-foreground mt-1">Permanently remove this mentor and all conversation history.</p>
                  </div>
                  <Button variant="destructive" className="shrink-0" disabled>Delete</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MentorWorkspace>
  );
}
