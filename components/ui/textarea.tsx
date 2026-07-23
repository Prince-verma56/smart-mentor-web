import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-[100px] w-full rounded-lg border border-border/60 bg-muted/20 px-3.5 py-3 text-base shadow-sm transition-all outline-none placeholder:text-muted-foreground/60 hover:border-primary/40 focus-visible:border-primary focus-visible:ring-[4px] focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[4px] aria-invalid:ring-destructive/20 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
