"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Pill } from "@/components/ui/Pill";
import { Card } from "@/components/ui/Card";
import CodeBlock from "@/components/CodeBlock";

const features = [
  {
    title: "Scaling risk detection",
    body: "Find bottlenecks in your architecture before they show up as incidents under load.",
  },
  {
    title: "Auth & billing analysis",
    body: "Audit your authentication flow and billing integration for edge cases and security gaps.",
  },
  {
    title: "Architecture scoring",
    body: "Get a single number for your SaaS architecture with a detailed breakdown by category.",
  },
  {
    title: "Actionable recommendations",
    body: "Receive prioritized, specific recommendations — not generic advice.",
  },
];

const checks = [
  { category: "API rate limits", items: ["Rate limit headers", "Retry logic", "Backoff strategy"] },
  { category: "Authentication", items: ["Token refresh", "Session management", "MFA handling"] },
  { category: "Database", items: ["Connection pooling", "Query optimization", "Index usage"] },
  { category: "Error handling", items: ["Graceful degradation", "Circuit breakers", "Fallback strategies"] },
  { category: "Caching", items: ["Cache invalidation", "TTL configuration", "Cache warming"] },
  { category: "Webhooks", items: ["Idempotency", "Retry handling", "Signature verification"] },
];

const SAMPLE_OUTPUT = `$ integrateapi stress-test

Analyzing your SaaS architecture...

────────────────────────────────────────

Architecture Score: 78/100

✓ Stripe integration: webhook signatures verified
✓ Clerk auth: token refresh implemented
! Database: missing connection pooling
! API calls: no retry logic detected
✗ Rate limiting: no backoff strategy found

────────────────────────────────────────

Recommendations:
  1. Add connection pooling to database client
  2. Implement exponential backoff for API calls
  3. Add circuit breaker for external services

Run 'integrateapi fix' to auto-fix issues.`;

export default function StressTestPage() {
  return (
    <>
      <section className="border-b border-line py-20 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Pill>CLI tool</Pill>
            <h1 className="mt-5 font-sans text-4xl/[1.05] font-semibold tracking-tight text-ink md:text-5xl/[1.05]">
              Stress test your SaaS architecture.
            </h1>
            <p className="mx-auto mt-5 max-w-md text-base/7 text-mute">
              Find scaling risks, security gaps, and integration issues before
              they become production incidents.
            </p>
            <div className="mx-auto mt-8 max-w-sm">
              <CodeBlock
                code="npx integrateapi stress-test"
                variant="inline"
              />
            </div>
          </div>
        </Container>
      </section>

      <Section className="py-24 md:py-32">
        <Container>
          <SectionHeading align="center" eyebrow="What it checks" title="Four lenses on your stack." />
          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <Card key={feature.title} hover>
                <h3 className="text-base font-semibold tracking-tight text-ink">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm/6 text-mute">{feature.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-paper-soft py-24 md:py-32">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Analysis categories"
            title="Six dimensions, evaluated automatically."
            subhead="The stress test evaluates your codebase across these critical areas."
          />
          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {checks.map((check) => (
              <div
                key={check.category}
                className="rounded-2xl border border-line bg-card p-6"
              >
                <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
                  {check.category}
                </h3>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {check.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm/6 text-mute"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="py-24 md:py-32">
        <Container size="md">
          <div className="grid items-start gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <Eyebrow>How it works</Eyebrow>
              <h2 className="mt-3 font-sans text-3xl/[1.1] font-semibold tracking-tight text-ink md:text-4xl/[1.05]">
                Run, scan, report.
              </h2>
              <ol className="mt-8 flex flex-col gap-5">
                {[
                  { t: "Run the command", b: "Execute the stress test CLI in your project root directory." },
                  { t: "Automatic analysis", b: "The tool scans your codebase, config files, and integration patterns." },
                  { t: "Get your report", b: "Receive a detailed report with scores, issues, and recommendations." },
                ].map((step, i) => (
                  <li key={step.t} className="flex items-start gap-3.5">
                    <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-paper">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-base font-semibold tracking-tight text-ink">
                        {step.t}
                      </h3>
                      <p className="mt-1 text-sm/6 text-mute">{step.b}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <Eyebrow>Sample output</Eyebrow>
              <div className="mt-3">
                <CodeBlock code={SAMPLE_OUTPUT} variant="terminal" />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <section className="border-t border-line bg-paper-soft py-20 text-center md:py-24">
        <Container size="md">
          <h2 className="font-sans text-3xl/[1.1] font-semibold tracking-tight text-ink md:text-4xl/[1.05]">
            Ready to stress test your stack?
          </h2>
          <div className="mx-auto mt-8 max-w-sm">
            <CodeBlock
              code="npx integrateapi stress-test"
              variant="inline"
            />
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm">
            <Link
              href="/templates"
              className="text-mute transition-colors hover:text-ink"
            >
              Browse templates →
            </Link>
            <Link
              href="/registry"
              className="text-mute transition-colors hover:text-ink"
            >
              Explore registry →
            </Link>
            <Link
              href="/docs"
              className="text-mute transition-colors hover:text-ink"
            >
              Read docs →
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
