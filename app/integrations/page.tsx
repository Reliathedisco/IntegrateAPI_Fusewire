"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import IntegrationCard from "@/components/IntegrationCard";
import { getIntegrations } from "@/lib/data";
import { cn } from "@/lib/cn";

export default function IntegrationsPage() {
  const all = useMemo(() => getIntegrations(), []);
  const categories = useMemo(
    () => Array.from(new Set(all.map((i) => i.category))).sort(),
    [all],
  );

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((i) => {
      const matchesQuery =
        !q ||
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.shortDescription.toLowerCase().includes(q);
      const matchesCategory = category === "all" || i.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [all, query, category]);

  return (
    <>
      <section className="border-b border-line py-16 md:py-20">
        <Container>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow>Catalog</Eyebrow>
              <h1 className="mt-3 font-sans text-4xl/[1.05] font-semibold tracking-tight text-ink md:text-5xl/[1.05]">
                Integrations
              </h1>
              <p className="mt-3 max-w-md text-base/7 text-mute">
                {all.length} templates across {categories.length} categories.
                Every one installs typed code into your project.
              </p>
            </div>
            <label className="block w-full max-w-sm">
              <span className="sr-only">Search integrations</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search integrations..."
                className="w-full rounded-full border border-line-strong bg-card px-5 py-3 text-sm text-ink outline-hidden transition focus:border-ink focus:ring-3 focus:ring-ink/5"
              />
            </label>
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium tracking-tight transition",
                category === "all"
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-card text-mute hover:border-line-strong hover:text-ink",
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium tracking-tight transition",
                  category === cat
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-card text-mute hover:border-line-strong hover:text-ink",
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-24">
        <Container>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line py-16 text-center">
              <p className="text-sm text-mute">
                No integrations match — try a different search or category.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  showInstallCommand
                />
              ))}
            </div>
          )}
          <p className="mt-8 text-xs text-faint">
            Showing {filtered.length} of {all.length}
          </p>
        </Container>
      </section>
    </>
  );
}
