import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Eyebrow } from "./Eyebrow";

export function SectionHeading({
  eyebrow,
  title,
  subhead,
  align = "left",
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subhead?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="font-sans text-3xl/[1.1] font-semibold tracking-tight text-ink md:text-4xl/[1.05]">
        {title}
      </h2>
      {subhead && (
        <p
          className={cn(
            "max-w-xl text-base/7 text-mute",
            align === "center" && "mx-auto",
          )}
        >
          {subhead}
        </p>
      )}
    </header>
  );
}
