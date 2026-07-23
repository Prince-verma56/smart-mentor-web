"use client"

import * as React from "react"
import AnimatedProgressBar from "@/components/ui/smoothui/animated-progress-bar"
import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<"div"> & { value?: number | null }) {
  return (
    <AnimatedProgressBar 
      value={value || 0}
      barClassName="bg-primary"
      className={cn("h-2 w-full", className)}
    />
  )
}

export { Progress }
