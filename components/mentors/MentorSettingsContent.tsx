"use client";

import { MentorWorkspace } from "@/components/mentors/MentorWorkspace";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Select from "@/components/ui/smoothui/select";
import { Switch } from "@/components/ui/switch";
import ElasticSlider from "@/components/ElasticSlider";
import { Settings, Brain, MessageSquare, Mic, FolderOpen, AlertTriangle, Loader2 } from "lucide-react";
import type { Mentor, MentorStats } from "@/types/mentor";
import type { MentorRoadmap } from "@/types/roadmap";
import { updateMentorAction, deleteMentorAction } from "@/actions/mentorActions";
import { updateMentorVoiceSettingsAction } from "@/actions/mentorActions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface MentorSettingsContentProps {
  mentor: Mentor;
  stats: MentorStats;
  roadmap?: MentorRoadmap;
}

export function MentorSettingsContent({ mentor, stats, roadmap }: MentorSettingsContentProps) {
  const router = useRouter();
  // using actions directly

  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: mentor.name,
    role: mentor.role,
    learningGoal: mentor.learningGoal,
  });

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    try {
      await updateMentorAction(mentor.id, {
        name: formData.name,
        role: formData.role,
        learning_goal: formData.learningGoal,
      });
      toast.success("Settings saved successfully.");
      router.refresh();
    } catch (e) {
      toast.error("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to permanently delete this mentor? All chat history and roadmaps will be lost.")) {
      try {
        await deleteMentorAction(mentor.id);
        toast.success("Mentor deleted.");
        router.push("/dashboard");
      } catch (e) {
        toast.error("Failed to delete mentor.");
      }
    }
  };

  return (
    <MentorWorkspace mentor={mentor} stats={stats} roadmap={roadmap} view="settings">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mentor Settings</h1>
          <p className="text-muted-foreground">Manage {mentor.name}&apos;s configuration, personality, and data.</p>
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
                <CardDescription>Update your mentor&apos;s basic details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input 
                    value={formData.role} 
                    onChange={e => setFormData(f => ({ ...f, role: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Learning Goal</Label>
                  <Textarea 
                    value={formData.learningGoal} 
                    onChange={e => setFormData(f => ({ ...f, learningGoal: e.target.value }))}
                  />
                </div>
                <Button onClick={handleSaveGeneral} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
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
                <CardDescription>Configure Voice AI settings and preferences for this mentor.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form action={async (formData) => {
                  const settings = {
                    voiceProvider: formData.get("voiceProvider"),
                    voiceModel: formData.get("voiceModel"),
                    voiceLanguage: formData.get("voiceLanguage"),
                    voiceSpeed: parseFloat(formData.get("voiceSpeed") as string || "1"),
                    voiceTemperature: parseFloat(formData.get("voiceTemperature") as string || "0.7"),
                    voiceInterruptions: formData.get("voiceInterruptions") === "on",
                    voiceAutoStart: formData.get("voiceAutoStart") === "on",
                    voiceGreeting: formData.get("voiceGreeting")
                  };
                  const promise = updateMentorVoiceSettingsAction(mentor.id, settings).then((res) => {
                    if (res?.error) throw new Error(res.error);
                    return res;
                  });

                  toast.promise(promise, {
                    loading: "Saving voice settings...",
                    success: "Voice settings updated successfully!",
                    error: (err) => err.message || "Failed to update voice settings"
                  });
                }} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Voice Provider</Label>
                      <Select 
                        name="voiceProvider" 
                        defaultValue={mentor.voiceProvider || "vapi"}
                        placeholder="Select provider"
                        options={[
                          { label: "Vapi", value: "vapi" },
                          { label: "ElevenLabs", value: "elevenlabs" }
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Model</Label>
                      <Select 
                        name="voiceModel" 
                        defaultValue={mentor.voiceModel || "gpt-4-turbo-preview"}
                        placeholder="Select model"
                        options={[
                          { label: "GPT-4 Turbo", value: "gpt-4-turbo-preview" },
                          { label: "GPT-4o Realtime", value: "gpt-4o" },
                          { label: "Claude 3 Sonnet", value: "claude-3-sonnet" }
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select 
                        name="voiceLanguage" 
                        defaultValue={mentor.voiceLanguage || "English"}
                        placeholder="Select language"
                        options={[
                          { label: "English", value: "English" },
                          { label: "Hindi", value: "Hindi" },
                          { label: "Hinglish", value: "Hinglish" }
                        ]}
                      />
                    </div>

                    <div className="space-y-2 col-span-1 md:col-span-2 mt-4">
                      <Label className="mb-8 block">Speaking Speed</Label>
                      <div className="pt-2 pb-6 px-12 md:px-24">
                        <ElasticSlider 
                          name="voiceSpeed" 
                          startingValue={0.5}
                          maxValue={2.0}
                          defaultValue={mentor.voiceSpeed || 1.0}
                          isStepped={true}
                          stepSize={0.1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Custom Greeting (Optional)</Label>
                    <Textarea 
                      name="voiceGreeting"
                      placeholder="e.g. Hi! I'm your mentor. Are you ready to begin?" 
                      defaultValue={mentor.voiceGreeting || ""}
                      className="resize-none h-20"
                    />
                    <p className="text-xs text-muted-foreground">If left blank, the system will automatically generate a dynamic greeting based on your roadmap progress.</p>
                  </div>

                  <div className="flex flex-col gap-4 py-4 border-y">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Allow Interruptions</Label>
                        <p className="text-xs text-muted-foreground">Allow the user to interrupt the mentor while it is speaking.</p>
                      </div>
                      <Switch name="voiceInterruptions" defaultChecked={mentor.voiceInterruptions ?? true} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto Start</Label>
                        <p className="text-xs text-muted-foreground">Automatically start the voice session when opening the chat.</p>
                      </div>
                      <Switch name="voiceAutoStart" defaultChecked={mentor.voiceAutoStart ?? false} />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" className="w-full sm:w-auto">Save Voice Settings</Button>
                  </div>
                </form>
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
                  <Button variant="destructive" className="shrink-0" onClick={handleDelete}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MentorWorkspace>
  );
}
