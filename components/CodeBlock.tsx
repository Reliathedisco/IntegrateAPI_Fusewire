"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

type Variant = "default" | "terminal" | "inline";

const variants: Record<Variant, string> = {
  default:
    "rounded-xl border border-line bg-card font-mono text-[13px] text-ink",
  terminal:
    "rounded-xl border border-ink/80 bg-ink font-mono text-[13px] text-paper",
  inline:
    "rounded-xl border border-line bg-paper-soft font-mono text-[13px] text-ink",
};

interface Props {
  code: string;
  variant?: Variant;
  label?: string;
  className?: string;
}

export default function CodeBlock({
  code,
  variant = "default",
  label,
  className,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setError(false);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError(true);
    }
  };

  const isTerminal = variant === "terminal";

  return (
    <div
      className={cn(
        "group relative overflow-hidden",
        variants[variant],
        className,
      )}
    >
      {label && (
        <div
          className={cn(
            "flex items-center justify-between border-b px-4 py-2 text-[11px] font-medium uppercase tracking-[0.12em]",
            isTerminal
              ? "border-paper/10 text-paper/50"
              : "border-line text-faint",
          )}
        >
          <span>{label}</span>
        </div>
      )}
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy code"
        className={cn(
          "absolute top-3 right-3 z-10 rounded-md px-2.5 py-1 text-[11px] font-medium opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100",
          isTerminal
            ? "bg-paper/10 text-paper hover:bg-paper/15"
            : "bg-paper-soft text-mute hover:text-ink",
        )}
      >
        {error ? "Failed" : copied ? "Copied" : "Copy"}
      </button>
      <pre className="overflow-x-auto px-4 py-4 text-[13px]/6">
        <code>{code}</code>
      </pre>
    </div>
  );
}
