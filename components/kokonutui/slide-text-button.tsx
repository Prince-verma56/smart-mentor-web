"use client";

/**
 * @author: @kokonut-labs
 * @description: Slide Text Button with animated vertical text transition
 * @version: 1.0.0
 * @date: 2025-11-02
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { motion } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SlideTextButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  text?: string;
  hoverText?: string;
  href?: string;
  className?: string;
  variant?: "default" | "secondary" | "ghost" | "danger" | "success";
  icon?: React.ReactNode;
  as?: "link" | "button";
  onClick?: () => void;
}

export default function SlideTextButton({
  text = "Browse Components",
  hoverText,
  href = "/docs/cards/card-flip",
  className,
  variant = "default",
  icon,
  as = "link",
  onClick,
  ...props
}: SlideTextButtonProps) {
  const slideText = hoverText ?? text;
  
  // 11. Different Button Variants with Premium Details
  const getVariantStyles = () => {
    switch (variant) {
      case "secondary":
        return "bg-secondary text-secondary-foreground border border-border/50 shadow-sm hover:bg-secondary/80 active:scale-[0.98]";
      case "ghost":
        return "bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground active:scale-[0.98]";
      case "danger":
        return "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 hover:border-destructive/30 active:scale-[0.98]";
      case "success":
      case "default":
      default:
        return "bg-muted/50 border border-border/50 text-foreground border-l-4 border-l-primary shadow-sm hover:bg-muted hover:border-l-primary active:scale-[0.98]";
    }
  };

  const baseStyles = cn(
    "group relative inline-flex h-[34px] items-center justify-center overflow-hidden rounded-md px-4",
    "font-medium text-[13px] tracking-wide", 
    "transition-all duration-[160ms] ease-out", // 13. Motion System
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background", // 8. Focus State
    "active:scale-[0.98] active:translate-y-[1px] active:shadow-none active:duration-[120ms]", // 7. Press Animation
    "disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 disabled:active:translate-y-0",
    "whitespace-nowrap cursor-pointer",
    getVariantStyles(),
    className
  );

    const getSlideTextColor = () => {
      switch (variant) {
        case "danger": return "text-destructive font-bold";
        case "secondary": return "text-foreground font-bold";
        case "ghost": return "text-foreground font-bold";
        case "success":
        case "default":
        default: return "text-primary font-bold";
      }
    };
    const renderContent = () => (
    <>
      {/* Subtle inner highlight sweep on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[600ms] ease-in-out" />
      
      {icon && (
        <span className={cn(
          "mr-2 shrink-0 transition-all duration-[160ms] group-hover:-translate-y-[1px] group-hover:brightness-125",
          variant === "default" || variant === "success" ? "text-primary" : "",
          variant === "danger" ? "text-destructive" : ""
        )}>
          {icon}
        </span>
      )}
      <span className="grid overflow-hidden">
        <span className="col-start-1 row-start-1 flex items-center gap-2 transition-all duration-[160ms] ease-out group-hover:-translate-y-full group-hover:opacity-0 whitespace-nowrap">
          {text}
        </span>
        <span className={cn(
          "col-start-1 row-start-1 flex items-center gap-2 transition-all duration-[160ms] ease-out translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 whitespace-nowrap",
          getSlideTextColor()
        )}>
          {slideText}
        </span>
      </span>
    </>
  );

  return (
    <motion.div
      animate={{ x: 0, opacity: 1, transition: { duration: 0.2, ease: "easeOut" } }}
      className="relative inline-block"
      initial={{ x: 20, opacity: 0 }}
    >
      {as === "link" ? (
        <Link className={baseStyles} href={href} {...props}>
          {renderContent()}
        </Link>
      ) : (
        <button className={baseStyles} onClick={onClick} disabled={props.disabled} {...(props as any)}>
          {renderContent()}
        </button>
      )}
    </motion.div>
  );
}
