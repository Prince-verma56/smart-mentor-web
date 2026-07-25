import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-[160ms] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:scale-[0.98] active:translate-y-[1px] active:shadow-none active:duration-[120ms]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-primary to-primary/90 text-primary-foreground border border-primary/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,0.1)] hover:brightness-110 hover:shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:-translate-y-[1px]",
        secondary:
          "bg-gradient-to-b from-secondary to-secondary/80 text-secondary-foreground border border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-secondary/80 hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:-translate-y-[1px] hover:border-border",
        danger:
          "bg-gradient-to-b from-destructive to-destructive/90 text-destructive-foreground border border-destructive/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,0.1)] hover:brightness-110 hover:shadow-[0_4px_12px_rgba(239,68,68,0.2)] hover:-translate-y-[1px]",
        ghost:
          "text-muted-foreground hover:bg-muted/50 hover:text-foreground active:bg-muted/20",
      },
      size: {
        default: "h-9 px-4 py-2 [&_svg:not([class*='size-'])]:size-4",
        sm: "h-8 rounded-md px-3 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 rounded-md px-8 [&_svg:not([class*='size-'])]:size-5",
        icon: "h-9 w-9 [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const AppButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    )
  }
)
AppButton.displayName = "AppButton"

export { AppButton, buttonVariants }
