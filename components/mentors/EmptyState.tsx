import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrainCircuit } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-20 text-center overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 mb-6 shadow-sm ring-1 ring-primary/20">
        <BrainCircuit className="h-10 w-10 text-primary" />
      </div>
      <h3 className="relative text-xl font-bold tracking-tight">{title}</h3>
      <p className="relative mt-2 text-base text-muted-foreground max-w-sm">{description}</p>
      {actionLabel && actionHref && (
        <div className="relative mt-8">
          <Link href={actionHref}>
            <Button size="lg" className="rounded-full font-medium shadow-md hover:shadow-lg transition-all">
              {actionLabel}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
