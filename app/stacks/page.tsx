"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { stackPresets } from "@/lib/stack-presets";
import { getIntegrationBySlug } from "@/lib/data";
import CodeBlock from "@/components/CodeBlock";
import { cn } from "@/lib/cn";

export default function StacksPage() {
  const [selectedSlug, setSelectedSlug] = useState<string>("saas-starter");
  const preset = stackPresets.find((p) => p.slug === selectedSlug) ?? null;
  const installedIntegrations = preset
    ? preset.integrationIds
        .map((id) => getIntegrationBySlug(id))
        .filter(
          (i): i is NonNullable<ReturnType<typeof getIntegrationBySlug>> =>
            i != null,
        )
    : [];

  return (
    <>
      <section className="border-b border-line py-20 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Stack builder</Eyebrow>
            <h1 className="mt-3 font-sans text-4xl/[1.05] font-semibold tracking-tight text-ink md:text-5xl/[1.05]">
              Install a full stack with one command.
            </h1>
            <p className="mx-auto mt-5 max-w-md text-base/7 text-mute">
              Choose a preset to get a single CLI command and the list of typed
              integrations that will land in your project.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stackPresets.map((p) => {
              const active = selectedSlug === p.slug;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedSlug(p.slug)}
                  className={cn(
                    "rounded-2xl border bg-card p-6 text-left transition",
                    active
                      ? "border-ink shadow-md"
                      : "border-line hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md",
                  )}
                >
                  <h3 className="text-base font-semibold tracking-tight text-ink">
                    {p.name}
                  </h3>
                  <p className="mt-2 text-sm/6 text-mute">{p.description}</p>
                </button>
              );
            })}
          </div>

          {preset && (
            <div className="mt-12 grid gap-10 md:grid-cols-[1fr_1fr]">
              <div>
                <Eyebrow>Install command</Eyebrow>
                <div className="mt-3">
                  <CodeBlock
                    code={`npx integrateapi stack ${preset.slug}`}
                    variant="inline"
                  />
                </div>
              </div>
              <div>
                <Eyebrow>Installed integrations</Eyebrow>
                <ul className="mt-3 flex flex-col gap-2">
                  {installedIntegrations.map((i) => (
                    <li key={i.slug}>
                      <Link
                        href={`/integrations/${i.slug}`}
                        className="group flex items-center justify-between rounded-lg border border-line bg-card px-4 py-3 transition hover:border-line-strong hover:bg-paper-soft"
                      >
                        <span className="text-sm font-medium text-ink">
                          {i.name}
                        </span>
                        <span className="text-xs text-faint transition-colors group-hover:text-mute">
                          {i.category} →
                        </span>
                      </Link>
                    </li>
                  ))}
                  {installedIntegrations.length === 0 && (
                    <li className="text-sm text-faint">
                      No integrations matched in this stack preset.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
