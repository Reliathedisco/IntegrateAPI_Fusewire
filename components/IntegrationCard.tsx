"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/cn";
import type { Integration } from "@/lib/types";

interface Props {
  integration: Integration;
  showInstallCommand?: boolean;
}

export default function IntegrationCard({
  integration,
  showInstallCommand = false,
}: Props) {
  const pathname = usePathname();
  const isActive = pathname === `/integrations/${integration.slug}`;

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold tracking-tight text-ink">
            {integration.name}
          </h3>
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-faint">
            {integration.category}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Pill variant={integration.tier === "pro" ? "accent" : "default"}>
            {integration.tier}
          </Pill>
          {integration.comingSoon && (
            <Pill className="opacity-70">Soon</Pill>
          )}
        </div>
      </div>
      <p className="mt-3 text-sm/6 text-mute">
        {integration.shortDescription || integration.description}
      </p>
      {showInstallCommand && !integration.comingSoon && (
        <code className="mt-4 block overflow-x-auto rounded-md bg-paper-soft px-3 py-2 font-mono text-[12px] text-ink">
          {integration.installCommand}
        </code>
      )}
    </>
  );

  const baseClasses =
    "block rounded-2xl border bg-card p-6 transition";

  if (integration.comingSoon) {
    return (
      <div
        className={cn(baseClasses, "cursor-not-allowed border-line opacity-70")}
        aria-disabled
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/integrations/${integration.slug}`}
      className={cn(
        baseClasses,
        "hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md",
        isActive ? "border-ink" : "border-line",
      )}
    >
      {content}
    </Link>
  );
}
