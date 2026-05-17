import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "default" | "accent" | "success" | "ink";

const variants: Record<Variant, string> = {
  default: "bg-card border border-line text-mute",
  accent: "bg-accent-tint text-accent border border-accent/20",
  success: "bg-success/10 text-success border border-success/25",
  ink: "bg-ink text-paper border border-ink",
};

export function Pill({
  children,
  variant = "default",
  className,
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
