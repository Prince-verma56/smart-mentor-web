"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Loader2,
} from "lucide-react";
import type { MentorSubject } from "@/types/mentor";
import { createMentorAction } from "@/actions/mentorActions";
import { toast } from "sonner";

const SUBJECTS: { value: MentorSubject; label: string }[] = [
  { value: "frontend", label: "Frontend Development" },
  { value: "backend", label: "Backend Development" },
  { value: "fullstack", label: "Full Stack" },
  { value: "devops", label: "DevOps & Cloud" },
  { value: "machine-learning", label: "Machine Learning" },
  { value: "data-science", label: "Data Science" },
  { value: "dsa", label: "Data Structures & Algorithms" },
  { value: "system-design", label: "System Design" },
  { value: "career", label: "Career Growth" },
  { value: "interview", label: "Interview Preparation" },
  { value: "communication", label: "Communication Skills" },
  { value: "english", label: "English Speaking" },
  { value: "resume", label: "Resume & LinkedIn" },
  { value: "startup", label: "Startup & Entrepreneurship" },
  { value: "fitness", label: "Fitness & Health" },
  { value: "custom", label: "Custom" },
];

export function MentorWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  // Simplified state
  const [name, setName] = useState("");
  const [subject, setSubject] = useState<MentorSubject | "">("");
  const [learningGoal, setLearningGoal] = useState("");

  const isStep1Valid = name.trim().length > 0 && subject !== "";
  const isStep2Valid = learningGoal.trim().length > 10;

  async function handleCreate() {
    setIsCreating(true);
    
    // Auto-generate defaults based on requirements
    const formData = new FormData();
    formData.append("name", name);
    formData.append("subject", subject);
    formData.append("role", `${subject} Expert`); // Auto-generated
    formData.append("learningGoal", learningGoal);
    
    // Intelligent Defaults
    formData.append("difficultyLevel", "intermediate");
    formData.append("teachingStyle", "hands-on");
    formData.append("conversationStyle", "encouraging");
    formData.append("teachingSpeed", "moderate");
    formData.append("responseLength", "detailed");
    formData.append("preferredLanguage", "English");
    formData.append("sessionDuration", "45");
    formData.append("knowledgeFocus", "General mastery"); // Could be better but suffices

    try {
      const res = await createMentorAction(formData);
      if (res?.error) {
        toast.error(res.error);
        setIsCreating(false);
      } else {
        toast.success("Mentor created successfully!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (e) {
      toast.error("An unexpected error occurred");
      setIsCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      {/* Step indicator */}
      <div className="mb-6 flex items-center justify-between px-2">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-primary">
            Step {step} of 2
          </p>
          <h2 className="text-2xl font-bold tracking-tight">
            {step === 1 ? "Let's build your mentor" : "Define your goal"}
          </h2>
        </div>
      </div>

      {/* Step card */}
      <Card className="border-muted shadow-sm overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-base font-semibold">What should we call your mentor?</Label>
                <Input
                  id="name"
                  placeholder="e.g. Dan Abramov, Senior Architect, Frontend Coach"
                  className="h-12 text-base px-4"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="subject" className="text-base font-semibold">What will they teach you?</Label>
                <Select value={subject} onValueChange={(v) => setSubject(v as MentorSubject)}>
                  <SelectTrigger id="subject" className="h-12 text-base px-4">
                    <SelectValue placeholder="Select a core subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s.value} value={s.value} className="py-3 cursor-pointer">
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-3">
                <Label htmlFor="learningGoal" className="text-base font-semibold">What is your ultimate goal?</Label>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Be as specific as possible. Your mentor will design its entire curriculum, tone, and teaching style around this objective.
                </p>
                <Textarea
                  id="learningGoal"
                  placeholder="e.g. I want to build production-ready fullstack applications and get hired as a Mid-Level React Developer in the next 6 months."
                  className="min-h-[160px] text-base p-4 resize-none leading-relaxed"
                  value={learningGoal}
                  onChange={(e) => setLearningGoal(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="mt-8 flex justify-between items-center">
        {step === 1 ? (
          <div></div> // Spacer
        ) : (
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground hover:bg-transparent"
            disabled={isCreating}
            onClick={() => setStep(1)}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}

        {step === 1 ? (
          <Button
            size="lg"
            className="rounded-full px-8 font-medium h-12 shadow-sm"
            disabled={!isStep1Valid}
            onClick={() => setStep(2)}
          >
            Continue
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button 
            size="lg"
            className="rounded-full px-8 font-medium h-12 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0"
            onClick={handleCreate} 
            disabled={!isStep2Valid || isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2 text-yellow-300" />
                Create AI Mentor
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
