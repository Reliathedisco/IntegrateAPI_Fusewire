import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Size = "sm" | "md" | "lg";

const widths: Record<Size, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
};

export function Container({
  children,
  size = "lg",
  className,
}: {
  children: ReactNode;
  size?: Size;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full px-6", widths[size], className)}>
      {children}
    </div>
  );
}
