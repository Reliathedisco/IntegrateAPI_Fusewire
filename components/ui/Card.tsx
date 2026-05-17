import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "default" | "soft" | "ink";

const variants: Record<Variant, string> = {
  default: "bg-card border border-line",
  soft: "bg-paper-soft border border-line",
  ink: "bg-ink text-paper border border-ink",
};

export function Card({
  children,
  variant = "default",
  hover = false,
  className,
}: {
  children: ReactNode;
  variant?: Variant;
  hover?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-7",
        variants[variant],
        hover &&
          "transition duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md",
        className,
      )}
    >
      {children}
    </div>
  );
}
