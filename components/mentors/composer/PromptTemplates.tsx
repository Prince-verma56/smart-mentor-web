import { cn } from "@/lib/utils";

interface PromptTemplatesProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function PromptTemplates({ onSelect, disabled }: PromptTemplatesProps) {
  const templates = [
    { label: "Explain", prompt: "Can you explain this concept in simple terms?" },
    { label: "Summarize", prompt: "Please provide a concise summary of this." },
    { label: "Quiz Me", prompt: "Generate a short quiz to test my understanding." },
    { label: "Practice", prompt: "Give me a practical exercise to practice this." },
    { label: "Flashcards", prompt: "Create a set of flashcards for these topics." },
    { label: "Interview", prompt: "Conduct a mock interview with me." },
    { label: "Review", prompt: "Review my code and suggest improvements." },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
      {templates.map((t) => (
        <button
          key={t.label}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(t.prompt)}
          className={cn(
            "px-2.5 py-1 text-[11px] font-medium rounded-full transition-all duration-300 border border-border/50 bg-background/50 text-muted-foreground whitespace-nowrap",
            disabled ? "opacity-50 cursor-not-allowed" : "hover:text-foreground hover:bg-muted hover:border-border"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
