"use client";

import { MentorWorkspace } from "@/components/mentors/MentorWorkspace";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Select from "@/components/ui/smoothui/select";
import { Plus, Volume1, Volume2, Save, Wand2, Archive, Trash2 } from "lucide-react";
import Scrubber from "@/components/ui/smoothui/scrubber";
import SlideTextButton from "@/components/kokonutui/slide-text-button";
import { Switch } from "@/components/ui/switch";
import ElasticSlider from "@/components/ElasticSlider";
import { Settings, Brain, MessageSquare, Mic, FolderOpen, AlertTriangle, Loader2, Zap, BrainCircuit, Sliders, Globe, Code, Activity, Clock, Speech } from "lucide-react";
import type { Mentor, MentorStats } from "@/types/mentor";
import type { MentorRoadmap } from "@/types/roadmap";
import { updateMentorAction, deleteMentorAction } from "@/actions/mentorActions";
import { updateMentorVoiceSettingsAction } from "@/actions/mentorActions";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useVoicePreferences } from "./voice/useVoicePreferences";

interface MentorSettingsContentProps {
  mentor: Mentor;
  stats: MentorStats;
  roadmap?: MentorRoadmap;
}

export function MentorSettingsContent({ mentor, stats, roadmap }: MentorSettingsContentProps) {
  const router = useRouter();
  const { global, mentor: voiceMentor, session, updateGlobal, updateMentor, updateSession } = useVoicePreferences(mentor.id);
  // using actions directly

  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: mentor.name,
    role: mentor.role,
    learningGoal: mentor.learningGoal,
  });
  const voiceSpeedInputRef = useRef<HTMLInputElement>(null);

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
          <TabsList className="w-full relative justify-start overflow-x-auto h-auto p-1 bg-muted/50 rounded-lg">
            <TabsTrigger value="general" className="gap-2 z-10">
              <Settings className="h-4 w-4" /> General
            </TabsTrigger>
            <TabsTrigger value="style" className="gap-2 z-10">
              <Brain className="h-4 w-4" /> Teaching Style
            </TabsTrigger>
            <TabsTrigger value="conversation" className="gap-2 z-10">
              <MessageSquare className="h-4 w-4" /> Conversation
            </TabsTrigger>
            <TabsTrigger value="voice" className="gap-2 z-10">
              <Mic className="h-4 w-4" /> Voice
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-2 z-10">
              <FolderOpen className="h-4 w-4" /> Resources
            </TabsTrigger>
            <TabsTrigger value="danger" className="gap-2 z-10 text-destructive data-active:text-destructive-foreground">
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
                <div className="flex justify-start">
                  <SlideTextButton
                    as="button"
                    onClick={handleSaveGeneral}
                    text={isSaving ? "Saving..." : "Save Changes"}
                    hoverText={isSaving ? "Saving..." : "Confirm"}
                    icon={<Save className="h-3.5 w-3.5" />}
                    disabled={isSaving}
                  />
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
              <CardContent className="space-y-6">
                <div className="space-y-5">
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2"><Zap className="w-4 h-4 text-muted-foreground" /> Response Length</Label>
                    <div className="flex bg-muted/50 p-1 rounded-xl">
                      {["Short", "Balanced", "Detailed"].map((len) => (
                        <button
                          key={len}
                          type="button"
                          onClick={() => updateMentor("responseLength", len as any)}
                          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${voiceMentor.responseLength === len ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          {len}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px w-full bg-border/50" />

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-muted-foreground" /> Teaching Style</Label>
                    <div className="grid grid-cols-2 gap-2 bg-muted/50 p-1.5 rounded-xl">
                      {["Explain Simply", "Interview Mode", "Senior Developer", "Pair Programmer", "Socratic Mentor"].map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => updateMentor("teachingStyle", style as any)}
                          className={`py-2 px-3 text-xs font-medium rounded-lg transition-all text-left ${voiceMentor.teachingStyle === style ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px w-full bg-border/50" />

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2"><Sliders className="w-4 h-4 text-muted-foreground" /> Correction Level</Label>
                    <div className="flex bg-muted/50 p-1 rounded-xl">
                      {["Gentle", "Balanced", "Strict"].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => updateMentor("correctionLevel", level as any)}
                          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${voiceMentor.correctionLevel === level ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Environment</CardTitle>
                <CardDescription>Configure language and coding preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-5">
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2"><Globe className="w-4 h-4 text-muted-foreground" /> Preferred Language</Label>
                    <div className="flex bg-muted/50 p-1 rounded-xl">
                      {["English", "Hindi", "Hinglish"].map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => updateGlobal("preferredLanguage", lang as any)}
                          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${global.preferredLanguage === lang ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px w-full bg-border/50" />

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2"><Code className="w-4 h-4 text-muted-foreground" /> Code Style</Label>
                    <div className="flex flex-wrap gap-2 bg-muted/50 p-1.5 rounded-xl">
                      {["Beginner", "Production", "FAANG", "Startup"].map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => updateMentor("codeStyle", style as any)}
                          className={`flex-1 min-w-[70px] py-2 px-2 text-xs font-medium rounded-lg transition-all text-center ${voiceMentor.codeStyle === style ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
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
                    voiceGreeting: formData.get("voiceGreeting"),
                    voiceId: formData.get("voiceId")
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
                    <div className="space-y-2 md:col-span-1">
                      <Label>Voice Identity & Tone</Label>
                      <Select
                        name="voiceId"
                        defaultValue={mentor.voiceId || "21m00Tcm4TlvDq8ikWAM"}
                        placeholder="Select voice identity"
                        options={[
                          { label: "Rachel (Female, Friendly & Clear)", value: "21m00Tcm4TlvDq8ikWAM" },
                          { label: "Drew (Male, Professional & News)", value: "29vD33N1CtxCmqQRPOHJ" },
                          { label: "Bella (Female, Soft & Encouraging)", value: "EXAVITQu4vr4xnSDxMaL" },
                          { label: "Adam (Male, Deep & Strict)", value: "pNInz6obpgDQGcFmaJgB" },
                          { label: "Elli (Female, Young & Energetic)", value: "MF3mGyEYCl7XYWbV9V6O" },
                          { label: "Josh (Male, Casual & Relaxed)", value: "TxGEqnHWrfWFTfGW9XjX" }
                        ]}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-1">
                      <Label>AI Model</Label>
                      <Select
                        name="voiceModel"
                        defaultValue={mentor.voiceModel || "gpt-4-turbo-preview"}
                        placeholder="Select model"
                        options={[
                          { label: "GPT-4 Turbo (Stable)", value: "gpt-4-turbo-preview" },
                          { label: "GPT-4o (Fast)", value: "gpt-4o" },
                          { label: "GPT-3.5 Turbo (Fastest)", value: "gpt-3.5-turbo" }
                        ]}
                      />
                    </div>

                    <div className="space-y-2 col-span-1 md:col-span-2 mt-4">
                      <Label className="mb-8 block">Speaking Speed</Label>
                      <div className="pt-2 pb-6 px-12 md:px-24 flex items-center gap-4">
                        <Volume1 className="h-4 w-4 text-muted-foreground shrink-0" />
                        <Scrubber
                          className="flex-1"
                          min={0.5}
                          max={2.0}
                          step={0.01}
                          decimals={1}
                          defaultValue={mentor.voiceSpeed || 1.0}
                          onValueChange={(v) => {
                            if (voiceSpeedInputRef.current) {
                              voiceSpeedInputRef.current.value = v.toString();
                            }
                          }}
                        />
                        <input type="hidden" name="voiceSpeed" ref={voiceSpeedInputRef} defaultValue={mentor.voiceSpeed || 1.0} />
                        <Volume2 className="h-4 w-4 text-muted-foreground shrink-0" />
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
                    <SlideTextButton
                      as="button"
                      type="submit"
                      text="Save Voice Settings"
                      hoverText="Confirm"
                      icon={<Wand2 className="h-3.5 w-3.5" />}
                    />
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
                  <div className="shrink-0">
                    <SlideTextButton
                      as="button"
                      variant="ghost"
                      text="Archive"
                      hoverText="Archiving..."
                      icon={<Archive className="h-3.5 w-3.5" />}
                      disabled={true}
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Delete Mentor</h4>
                    <p className="text-xs text-muted-foreground mt-1">Permanently remove this mentor and all conversation history.</p>
                  </div>
                  <div className="shrink-0">
                    <SlideTextButton
                      as="button"
                      variant="danger"
                      onClick={handleDelete}
                      text="Delete"
                      hoverText="Confirm"
                      icon={<Trash2 className="h-3.5 w-3.5" />}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MentorWorkspace>
  );
}
