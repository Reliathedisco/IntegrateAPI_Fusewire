"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type FormEvent, type ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { LinkButton, Button } from "@/components/ui/Button";
import RetroCliDemo from "@/components/RetroCliDemo";
import { cn } from "@/lib/cn";

const TRUST_LOGOS: Array<{ src: string; alt: string }> = [
  { src: "/logos/stripe.png", alt: "Stripe" },
  { src: "/logos/slack.png", alt: "Slack" },
  { src: "/logos/shopify.png", alt: "Shopify" },
  { src: "/logos/notion.png", alt: "Notion" },
  { src: "/logos/hubspot.png", alt: "HubSpot" },
];

const INCLUDED: Array<{ title: string; items: string[] }> = [
  {
    title: "Typed clients",
    items: ["Strict TypeScript", "Zero SDK lock-in", "You own the code"],
  },
  {
    title: "Webhooks & auth",
    items: ["Signature verification", "OAuth scaffolding", "Env templates"],
  },
  {
    title: "Framework-aware",
    items: ["Next.js App Router", "Express & Node", "Edge-compatible"],
  },
];

const WHY: Array<{ title: string; body: string }> = [
  {
    title: "You own the code",
    body: "Templates install into your repo. No runtime SDK lock-in, no licensing surprises.",
  },
  {
    title: "Real TypeScript",
    body: "Strict types, sensible defaults, no any-typed wrappers around fetch.",
  },
  {
    title: "Boring parts done",
    body: "Webhook verification, env scaffolding, error handling — handled, then handed to you.",
  },
  {
    title: "Stack-aware",
    body: "The CLI detects your framework and writes idiomatic code into the right places.",
  },
];

const STATS: Array<{ label: string; value: string }> = [
  { label: "Integrations", value: "38" },
  { label: "Avg install", value: "3.2s" },
  { label: "Frameworks", value: "4" },
  { label: "Lines you skip", value: "~600" },
];

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "Is this just code snippets?",
    a: "No. Templates install full files — typed clients, webhook handlers, env scaffolding, route handlers — directly into your project.",
  },
  {
    q: "Do I keep paying to keep the code running?",
    a: "No. Once installed, the code is yours. There is no runtime dependency on IntegrateAPI.",
  },
  {
    q: "Which frameworks are supported?",
    a: "Next.js (App Router), Express, and any Node-based stack. The CLI detects your setup and writes idiomatic code.",
  },
  {
    q: "Can I contribute templates?",
    a: "Yes — the registry is open. Submit a template via GitHub.",
  },
];

function CheckRow({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm/6 text-mute">
      <span
        aria-hidden="true"
        className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
      />
      <span>{children}</span>
    </li>
  );
}

function FlowArrow() {
  return (
    <div
      aria-hidden="true"
      className="hidden h-px w-12 self-center bg-line-strong md:block"
    />
  );
}

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    setStatus("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = (await res.json().catch(() => ({}))) as
        | { ok?: boolean; status?: "subscribed" | "already_subscribed"; error?: string }
        | undefined;
      if (!res.ok || !data?.ok) {
        setStatus("error");
        setMessage(data?.error || "Couldn't subscribe. Please try again.");
        return;
      }
      setStatus("success");
      setEmail("");
      setMessage(
        data.status === "already_subscribed"
          ? "You're already subscribed."
          : "Subscribed — check your inbox.",
      );
    } catch {
      setStatus("error");
      setMessage("Couldn't subscribe. Please try again.");
    }
  };

  return (
    <>
      {/* ────────────────────────────────  HERO  ──────────────────────────── */}
      <section className="pt-16 pb-12 md:pt-24">
        <Container>
          <div className="grid items-center gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-16">
            <div>
              <Pill variant="success" className="mb-6">
                <span className="size-1.5 rounded-full bg-success shadow-[0_0_8px_currentColor]" />
                Production-ready in minutes
              </Pill>
              <h1 className="font-sans text-4xl/[1.05] font-semibold tracking-tight text-ink md:text-6xl/[1.04]">
                Ship integrations,
                <br />
                not glue.
              </h1>
              <p className="mt-6 max-w-md text-base/7 text-mute md:text-lg/7">
                IntegrateAPI installs production-ready integrations — Stripe, Slack,
                Shopify, Notion, HubSpot — directly into your codebase with one CLI
                command. You own the code. No SDK lock-in.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <LinkButton href="/get-started" variant="accent" size="lg">
                  Install integrateapi
                </LinkButton>
                <LinkButton href="/integrations" variant="secondary" size="lg">
                  Browse integrations
                </LinkButton>
              </div>
              <p className="mt-5 font-mono text-xs text-faint">
                <span className="text-mute">$</span> npx integrateapi add stripe
              </p>
            </div>
            <aside aria-label="Live CLI demo" className="w-full">
              <RetroCliDemo />
            </aside>
          </div>
        </Container>
      </section>

      {/* ───────────────────────────  TRUST STRIP  ────────────────────────── */}
      <section className="border-y border-line bg-paper-soft py-10">
        <Container>
          <div className="flex flex-col items-center gap-6">
            <Eyebrow>Templates ship for</Eyebrow>
            <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
              {TRUST_LOGOS.map((logo) => (
                <li key={logo.alt}>
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={96}
                    height={28}
                    className="h-7 w-auto object-contain opacity-60 grayscale transition-opacity hover:opacity-100"
                  />
                </li>
              ))}
              <li className="font-mono text-xs uppercase tracking-[0.12em] text-faint">
                + 33 more
              </li>
            </ul>
          </div>
        </Container>
      </section>

      {/* ─────────────────────────────  PAIN  ─────────────────────────────── */}
      <Section className="py-24 md:py-32">
        <Container>
          <div className="grid items-start gap-12 md:grid-cols-2 md:gap-20">
            <p className="font-sans text-3xl/[1.1] font-semibold tracking-tight text-ink md:text-4xl/[1.05]">
              Most apps eventually
              <br />
              become integration apps.
            </p>
            <div className="space-y-5 text-base/7 text-mute">
              <p>
                Auth, billing, notifications, CRM, storage — each integration turns
                into a week of docs, debugging, and glue code that nobody on your
                team wants to own.
              </p>
              <p>
                <span className="text-ink">Yours doesn&apos;t have to.</span> Pick a
                template, run one command, ship before lunch.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* ─────────────────────────────  FLOW  ─────────────────────────────── */}
      <Section id="flow" className="py-24 md:py-32">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="The flow"
            title="Pick. Install. Ship."
            subhead="The CLI scans your project, picks the right template, and installs typed code directly into your codebase. No vendoring, no SDK wrappers."
          />
          <div className="mt-14 grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
            <Card>
              <p className="font-mono text-xs tracking-[0.18em] text-faint">01</p>
              <h3 className="mt-4 text-base font-semibold tracking-tight text-ink">
                Pick an integration
              </h3>
              <p className="mt-2 text-sm/6 text-mute">
                Browse the registry of production-grade templates by category.
              </p>
            </Card>
            <FlowArrow />
            <Card>
              <p className="font-mono text-xs tracking-[0.18em] text-faint">02</p>
              <h3 className="mt-4 text-base font-semibold tracking-tight text-ink">
                Run the CLI
              </h3>
              <p className="mt-2 text-sm/6 text-mute">
                <code className="rounded-sm bg-paper-soft px-1.5 py-0.5 font-mono text-[12.5px] text-ink">
                  npx integrateapi add &lt;name&gt;
                </code>{" "}
                — files land in your project.
              </p>
            </Card>
            <FlowArrow />
            <Card>
              <p className="font-mono text-xs tracking-[0.18em] text-faint">03</p>
              <h3 className="mt-4 text-base font-semibold tracking-tight text-ink">
                Ship
              </h3>
              <p className="mt-2 text-sm/6 text-mute">
                Set env keys, run dev, deploy. No runtime dependency on us.
              </p>
            </Card>
          </div>
        </Container>
      </Section>

      {/* ────────────────────────────  INCLUDED  ──────────────────────────── */}
      <Section className="py-24 md:py-32">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="What's included"
            title="A complete integration system, not just snippets."
          />
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {INCLUDED.map((card) => (
              <Card key={card.title} hover>
                <h3 className="text-base font-semibold tracking-tight text-ink">
                  {card.title}
                </h3>
                <ul className="mt-5 flex flex-col gap-2.5">
                  {card.items.map((item) => (
                    <CheckRow key={item}>{item}</CheckRow>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* ─────────────────────────────  WHY  ──────────────────────────────── */}
      <Section className="bg-paper-soft py-24 md:py-32">
        <Container>
          <SectionHeading
            align="left"
            eyebrow="Why it works"
            title="Designed around the things that actually matter."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {WHY.map((card) => (
              <Card key={card.title} hover>
                <h3 className="text-base font-semibold tracking-tight text-ink">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm/6 text-mute">{card.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* ─────────────────────────────  PROOF  ────────────────────────────── */}
      <Section className="py-24 md:py-32">
        <Container>
          <div className="grid items-start gap-12 md:grid-cols-[1.1fr_1fr] md:gap-20">
            <div>
              <Eyebrow>Real install, real time</Eyebrow>
              <h2 className="mt-3 font-sans text-3xl/[1.1] font-semibold tracking-tight text-ink md:text-4xl/[1.05]">
                One command. Files in your repo.
              </h2>
              <ol className="mt-8 flex flex-col gap-4">
                {[
                  "Detect the framework you're already using",
                  "Pull the latest template from the registry",
                  "Write typed files into the right folders",
                  "Patch package.json with verified versions",
                  "Generate env templates with safe defaults",
                ].map((step, i) => (
                  <li
                    key={step}
                    className="flex items-start gap-3 text-sm/6 text-mute"
                  >
                    <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-paper">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col gap-1.5 bg-card p-7"
                >
                  <p className="font-sans text-3xl/[1] font-semibold tracking-tight text-ink md:text-4xl/[1]">
                    {stat.value}
                  </p>
                  <p className="text-xs font-medium uppercase tracking-[0.1em] text-faint">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* ────────────────────────────  PRICING  ───────────────────────────── */}
      <Section id="pricing" className="py-24 md:py-32">
        <Container size="md">
          <SectionHeading
            align="center"
            eyebrow="Pricing"
            title="No seat fees. No surprises."
          />
          <div className="mt-14 grid gap-4 md:grid-cols-2">
            <Card hover className="flex flex-col gap-5">
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-semibold tracking-tight text-ink">
                  Free
                </h3>
                <Pill>5 integrations</Pill>
              </div>
              <p className="text-sm/6 text-mute">
                For trying it out and shipping side projects.
              </p>
              <p className="font-sans text-5xl/[1] font-semibold tracking-tight text-ink">
                $0
              </p>
              <ul className="flex flex-col gap-2.5">
                {["CLI access", "Registry access", "Community support"].map((item) => (
                  <CheckRow key={item}>{item}</CheckRow>
                ))}
              </ul>
              <LinkButton href="/sign-up" variant="secondary" className="mt-auto w-full">
                Get started free
              </LinkButton>
            </Card>
            <Card variant="ink" hover className="flex flex-col gap-5 shadow-md">
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-semibold tracking-tight text-paper">
                  Pro
                </h3>
                <Pill variant="accent">unlimited</Pill>
              </div>
              <p className="text-sm/6 text-paper/70">
                Unlimited integrations, all templates, priority support.
              </p>
              <p className="font-sans text-paper">
                <span className="text-5xl/[1] font-semibold tracking-tight">$9</span>
                <span className="ml-1 text-base text-paper/60">/mo</span>
              </p>
              <p className="text-xs text-paper/50">or $29 lifetime</p>
              <ul className="flex flex-col gap-2.5">
                {[
                  "Unlimited integrations",
                  "All current & future templates",
                  "Priority support",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm/6 text-paper/80"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-accent-soft"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <LinkButton href="/sign-up" variant="accent" className="mt-auto w-full">
                Get Pro
              </LinkButton>
            </Card>
          </div>
        </Container>
      </Section>

      {/* ─────────────────────────────  FAQ  ──────────────────────────────── */}
      <Section id="faq" className="py-24 md:py-32">
        <Container size="sm">
          <SectionHeading
            align="center"
            eyebrow="FAQ"
            title="Simple answers before you install."
          />
          <div className="mt-12 flex flex-col">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className={cn(
                  "group border-b border-line py-5",
                  "first:border-t",
                )}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-base font-medium tracking-tight text-ink [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    aria-hidden="true"
                    className="text-xl text-faint transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm/6 text-mute">{item.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </Section>

      {/* ───────────────────────────  NEWSLETTER  ─────────────────────────── */}
      <Section className="border-y border-line bg-paper-soft py-20 md:py-24">
        <Container size="sm">
          <div className="mx-auto max-w-md text-center">
            <Eyebrow>Newsletter</Eyebrow>
            <h2 className="mt-3 font-sans text-3xl/[1.1] font-semibold tracking-tight text-ink md:text-4xl/[1.05]">
              FuseWire
            </h2>
            <p className="mt-3 text-sm/6 text-mute">
              SaaS architecture, API patterns, and integration strategies. Weekly.
              No spam.
            </p>
            <form
              onSubmit={submit}
              className="mt-6 flex flex-col gap-2 sm:flex-row"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== "idle") {
                    setStatus("idle");
                    setMessage(null);
                  }
                }}
                placeholder="you@company.com"
                autoComplete="email"
                inputMode="email"
                required
                className="flex-1 rounded-full border border-line-strong bg-card px-5 py-3 text-sm text-ink outline-hidden transition focus:border-ink focus:ring-3 focus:ring-ink/5"
              />
              <Button
                type="submit"
                variant="primary"
                disabled={status === "loading"}
              >
                {status === "loading" ? "..." : "Subscribe"}
              </Button>
            </form>
            {message && (
              <p
                className={cn(
                  "mt-3 text-sm font-medium",
                  status === "error" ? "text-danger" : "text-success",
                )}
                role={status === "error" ? "alert" : "status"}
              >
                {message}
              </p>
            )}
          </div>
        </Container>
      </Section>

      {/* ─────────────────────────  FINAL CTA  ────────────────────────────── */}
      <section id="start" className="bg-ink py-24 text-center md:py-32">
        <Container size="md">
          <h2 className="font-sans text-3xl/[1.1] font-semibold tracking-tight text-paper md:text-5xl/[1.05]">
            Stop rebuilding integrations.
            <br />
            Start shipping.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base/7 text-paper/65">
            One CLI command. Production-ready code in your repo. No lock-in.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LinkButton href="/get-started" variant="accent" size="lg">
              Install integrateapi
            </LinkButton>
            <Link
              href="#pricing"
              className="inline-flex items-center justify-center rounded-full border border-paper/20 px-7 py-3.5 text-base font-medium text-paper transition hover:border-paper/40 hover:bg-paper/5"
            >
              View pricing
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
