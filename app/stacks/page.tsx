"use client";

import { useState } from "react";
import Link from "next/link";
import { stackPresets } from "@/lib/stack-presets";
import { getIntegrationBySlug } from "@/lib/data";
import CodeBlock from "@/components/CodeBlock";

export default function StacksPage() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>("saas-starter");
  const preset = selectedSlug
    ? stackPresets.find((p) => p.slug === selectedSlug)
    : null;
  const installedIntegrations = preset
    ? preset.integrationIds
        .map((id) => getIntegrationBySlug(id))
        .filter(
          (i): i is NonNullable<ReturnType<typeof getIntegrationBySlug>> =>
            i != null
        )
    : [];

  return (
    <div className="container">
      <h1>Stack Builder</h1>
      <p className="pageLead">
        Choose a preset to get a CLI command and the list of integrations that
        will be installed.
      </p>

      <div className="presetGrid">
        {stackPresets.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`presetCard ${
              selectedSlug === p.slug ? "presetCardActive" : ""
            }`}
            onClick={() => setSelectedSlug(p.slug)}
          >
            <h3>{p.name}</h3>
            <p>{p.description}</p>
          </button>
        ))}
      </div>

      {preset && (
        <div className="stackOutput">
          <h2>Install command</h2>
          <CodeBlock code={`npx integrateapi stack ${preset.slug}`} />
          <h2>Installed integrations</h2>
          <ul className="installedList">
            {installedIntegrations.map((i) => (
              <li key={i.slug}>
                <Link href={`/integrations/${i.slug}`}>{i.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
