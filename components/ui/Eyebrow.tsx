import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-sans text-xs font-semibold uppercase tracking-[0.12em] text-faint",
        className,
      )}
    >
      {children}
    </p>
  );
}
