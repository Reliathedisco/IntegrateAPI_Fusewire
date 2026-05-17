import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Pill } from "@/components/ui/Pill";
import { LinkButton } from "@/components/ui/Button";
import CodeBlock from "@/components/CodeBlock";
import { getIntegrationBySlug } from "@/lib/data";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export default async function IntegrationDetailPage({ params }: Props) {
  const { slug } = await params;
  const integration = getIntegrationBySlug(slug);

  if (!integration) {
    notFound();
  }

  const user = await currentUser();
  const isPro = user?.publicMetadata?.isPro === true;

  if (integration.tier === "pro" && !isPro) {
    return (
      <section className="py-16 md:py-20">
        <Container size="md">
          <Link
            href="/integrations"
            className="text-sm text-mute transition-colors hover:text-ink"
          >
            ← Back to integrations
          </Link>
          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <h1 className="font-sans text-4xl/[1.05] font-semibold tracking-tight text-ink md:text-5xl/[1.05]">
              {integration.name}
            </h1>
            <Pill variant="accent">pro</Pill>
          </div>
          <p className="mt-4 max-w-prose text-base/7 text-mute">
            {integration.description}
          </p>
          <div className="mt-8 max-w-md rounded-2xl border border-line bg-card p-7">
            <Eyebrow>Pro required</Eyebrow>
            <p className="mt-3 text-sm/6 text-mute">
              This template is part of the Pro tier. Upgrade once for $29
              (lifetime) or $9/month.
            </p>
            <LinkButton href="/account" variant="accent" className="mt-6">
              Upgrade to Pro
            </LinkButton>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20">
      <Container size="md">
        <Link
          href="/integrations"
          className="text-sm text-mute transition-colors hover:text-ink"
        >
          ← Back to integrations
        </Link>

        <header className="mt-6 flex flex-wrap items-start justify-between gap-6">
          <div>
            <Eyebrow>{integration.category}</Eyebrow>
            <h1 className="mt-2 font-sans text-4xl/[1.05] font-semibold tracking-tight text-ink md:text-5xl/[1.05]">
              {integration.name}
            </h1>
            <p className="mt-4 max-w-prose text-base/7 text-mute">
              {integration.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Pill variant={integration.tier === "pro" ? "accent" : "default"}>
              {integration.tier}
            </Pill>
            {integration.comingSoon && <Pill>Coming soon</Pill>}
          </div>
        </header>

        <div className="mt-10 grid gap-10 md:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-10">
            <section>
              <Eyebrow>Install</Eyebrow>
              <div className="mt-3">
                <CodeBlock code={integration.installCommand} variant="terminal" />
              </div>
            </section>

            {integration.features.length > 0 && (
              <section>
                <Eyebrow>What you get</Eyebrow>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {integration.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-sm/6 text-mute"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {integration.exampleCode && (
              <section>
                <Eyebrow>Example</Eyebrow>
                <div className="mt-3">
                  <CodeBlock
                    code={integration.exampleCode}
                    label={`${integration.slug} usage`}
                  />
                </div>
              </section>
            )}
          </div>

          <aside>
            {integration.envVars.length > 0 && (
              <div className="rounded-2xl border border-line bg-card p-6">
                <Eyebrow>Environment variables</Eyebrow>
                <ul className="mt-4 flex flex-col divide-y divide-line">
                  {integration.envVars.map((ev) => (
                    <li key={ev.name} className="flex flex-col gap-1 py-3 first:pt-0">
                      <code className="font-mono text-[12.5px] font-medium text-ink">
                        {ev.name}
                      </code>
                      <span className="text-xs text-mute">
                        {ev.description ?? "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </Container>
    </section>
  );
}
