"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   Animated terminal (the headline "code editor" mock — Tailwind-site vibe)
   ───────────────────────────────────────────────────────────────────────── */

const terminalLines = [
  { text: "$ npx integrateapi login", class: "", delay: 0 },
  { text: "", class: "t-blank", delay: 600 },
  { text: "✓ Authentication successful", class: "t-check", delay: 900 },
  { text: "", class: "t-blank", delay: 1100 },
  { text: "$ npx integrateapi list", class: "", delay: 1400 },
  { text: "", class: "t-blank", delay: 1900 },
  { text: "  Stripe", class: "t-item", delay: 2100 },
  { text: "  Clerk", class: "t-item", delay: 2250 },
  { text: "  Supabase", class: "t-item", delay: 2400 },
  { text: "  OpenAI", class: "t-item", delay: 2550 },
  { text: "  PostHog", class: "t-item", delay: 2700 },
  { text: "  Resend", class: "t-item", delay: 2850 },
  { text: "", class: "t-blank", delay: 3100 },
  { text: "$ npx integrateapi add stripe", class: "", delay: 3400 },
  { text: "", class: "t-blank", delay: 3900 },
  { text: "✓ Installing Stripe integration", class: "t-check", delay: 4100 },
  { text: "✓ Generating client", class: "t-check", delay: 4350 },
  { text: "✓ Adding webhook handler", class: "t-check", delay: 4600 },
  { text: "✓ Creating types", class: "t-check", delay: 4850 },
  { text: "", class: "t-blank", delay: 5100 },
  { text: "Integration ready.", class: "t-success", delay: 5300 },
];

function TerminalWindow() {
  const [lines, setLines] = useState<Array<{ text: string; class: string }>>([]);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    const run = () => {
      setLines([]);
      timeoutRefs.current.forEach(clearTimeout);
      timeoutRefs.current = [];
      terminalLines.forEach((line) => {
        const t = setTimeout(() => {
          setLines((prev) => [...prev, { text: line.text, class: line.class }]);
        }, line.delay);
        timeoutRefs.current.push(t);
      });
      const loop = setTimeout(run, 8500);
      timeoutRefs.current.push(loop);
    };
    run();
    return () => timeoutRefs.current.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-stone-200/80 bg-[#0a0a0a] shadow-[0_30px_60px_-20px_rgba(15,23,42,0.25)] ring-1 ring-black/5">
      {/* title bar */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-[#111] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-[11px] tracking-wide text-stone-500">
          ~ integrateapi — zsh
        </span>
      </div>
      {/* body */}
      <pre className="overflow-x-auto px-5 py-5 font-mono text-[12.5px] leading-[1.7] text-stone-200 sm:text-[13.5px]">
        {lines.map((line, i) => {
          if (line.class === "t-blank") return <div key={i}>&nbsp;</div>;
          if (line.class === "t-check")
            return (
              <div key={i} className="text-emerald-400">
                {line.text}
              </div>
            );
          if (line.class === "t-success")
            return (
              <div key={i} className="font-semibold text-emerald-300">
                {line.text}
              </div>
            );
          if (line.class === "t-item")
            return (
              <div key={i} className="text-sky-300">
                {line.text}
              </div>
            );
          if (line.text.startsWith("$ "))
            return (
              <div key={i}>
                <span className="text-stone-500">$ </span>
                <span className="text-white">{line.text.slice(2)}</span>
              </div>
            );
          return <div key={i}>{line.text}</div>;
        })}
        <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-stone-200 align-middle" />
      </pre>
    </div>
  );
}

function CtaTerminal() {
  const [text, setText] = useState("");
  const fullText = "npx integrateapi add stripe";

  useEffect(() => {
    let index = 0;
    let direction = 1;
    let timeout: NodeJS.Timeout;

    const type = () => {
      if (direction === 1) {
        if (index <= fullText.length) {
          setText(fullText.slice(0, index));
          index++;
          timeout = setTimeout(type, 60 + Math.random() * 40);
        } else {
          timeout = setTimeout(() => {
            direction = -1;
            timeout = setTimeout(type, 3000);
          }, 0);
        }
      } else {
        index = 0;
        direction = 1;
        setText("");
        timeout = setTimeout(type, 600);
      }
    };

    timeout = setTimeout(type, 1200);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="mx-auto flex max-w-md items-center rounded-xl border border-stone-200 bg-white px-4 py-3 font-mono text-[14px] shadow-sm">
      <span className="text-stone-400">$</span>
      <span className="ml-2 text-stone-900">{text}</span>
      <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-stone-900" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Logos + data
   ───────────────────────────────────────────────────────────────────────── */

const partnerLogos: Array<{ name: string; cls?: string }> = [
  { name: "Stripe" },
  { name: "Clerk" },
  { name: "Supabase" },
  { name: "OpenAI" },
  { name: "PostHog" },
  { name: "Resend" },
  { name: "Anthropic" },
  { name: "Upstash" },
  { name: "Twilio" },
  { name: "Linear" },
  { name: "Notion" },
  { name: "Inngest" },
  { name: "PlanetScale" },
  { name: "Neon" },
  { name: "Slack" },
  { name: "Trigger.dev" },
  { name: "Segment" },
  { name: "UploadThing" },
];

const fileTreeItems = [
  "stripe.ts",
  "clerk.ts",
  "supabase.ts",
  "openai.ts",
  "resend.ts",
  "posthog.ts",
];

/* ─────────────────────────────────────────────────────────────────────────────
   Page
   ───────────────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [newsletterMessage, setNewsletterMessage] = useState<string | null>(null);

  const submitNewsletter = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = newsletterEmail.trim();
    if (!email) return;
    setNewsletterStatus("loading");
    setNewsletterMessage(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as
        | {
            ok?: boolean;
            status?: "subscribed" | "already_subscribed";
            error?: string;
          }
        | undefined;
      if (!res.ok || !data?.ok) {
        setNewsletterStatus("error");
        setNewsletterMessage(
          data?.error || "Couldn’t subscribe. Please try again.",
        );
        return;
      }
      setNewsletterStatus("success");
      setNewsletterEmail("");
      setNewsletterMessage(
        data.status === "already_subscribed"
          ? "You’re already subscribed."
          : "Subscribed — check your inbox.",
      );
    } catch {
      setNewsletterStatus("error");
      setNewsletterMessage("Couldn’t subscribe. Please try again.");
    }
  };

  return (
    <div className="tw-landing relative isolate min-h-screen bg-white text-stone-900">
      {/* faint grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(59,130,246,0.10),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[820px] [background-image:linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] [background-size:36px_36px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent_75%)]"
      />

      {/* ─────────────────────────── HEADER ─────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-[14px] font-semibold tracking-tight text-stone-900"
            >
              <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.7)]" />
              IntegrateAPI
            </Link>
            <span className="hidden rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 font-mono text-[10px] text-stone-600 sm:inline-block">
              v1.1
            </span>
          </div>
          <nav className="hidden items-center gap-7 font-mono text-[12px] text-stone-600 md:flex">
            <Link href="/templates" className="hover:text-stone-900">Templates</Link>
            <Link href="/stress-test" className="hover:text-stone-900">Stress Test</Link>
            <Link href="/registry" className="hover:text-stone-900">Registry</Link>
            <Link href="/docs" className="hover:text-stone-900">Docs</Link>
            <Link href="#pricing" className="hover:text-stone-900">Pricing</Link>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Reliathedisco/IntegrateAPI_Fusewire"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden font-mono text-[12px] text-stone-600 hover:text-stone-900 sm:inline"
              aria-label="GitHub"
            >
              GitHub
            </a>
            <Link
              href="/sign-in"
              className="inline-flex items-center rounded-full bg-stone-950 px-3.5 py-1.5 font-mono text-[12px] font-medium text-white hover:bg-stone-800"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-24 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-3 py-1 font-mono text-[11px] tracking-wide text-stone-600 shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              v1.1 — CLI for modern SaaS APIs
            </div>

            <h1 className="mt-6 text-[44px] font-extrabold leading-[1.02] tracking-[-0.025em] text-stone-950 sm:text-6xl lg:text-[76px]">
              Rapidly ship SaaS integrations
              <br />
              without ever leaving your{" "}
              <span
                className="bg-gradient-to-r from-blue-600 via-violet-600 to-pink-500 bg-clip-text font-serif italic text-transparent"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                terminal.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-relaxed text-stone-600 sm:text-xl">
              IntegrateAPI installs production-ready Stripe, Clerk, Supabase,
              OpenAI and dozens more directly into your Next.js project — one
              CLI command, real TypeScript, zero runtime SDK lock-in.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/templates"
                className="group inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-stone-800"
              >
                Explore Templates
                <svg
                  className="h-4 w-4 transition group-hover:translate-x-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M7.5 4.5 13 10l-5.5 5.5-1.4-1.4L10.2 10 6.1 5.9z" />
                </svg>
              </Link>
              <Link
                href="/stress-test"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-800 transition hover:border-stone-400 hover:bg-stone-50"
              >
                Run Stress Test
              </Link>
              <Link
                href="/registry"
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-stone-600 transition hover:text-stone-900"
              >
                Browse Registry →
              </Link>
            </div>

            <div className="mt-7 flex items-center gap-3 font-mono text-xs text-stone-500">
              <code className="rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1 text-stone-800">
                $ npx integrateapi add stripe
              </code>
              <span>copy &amp; run — that&apos;s it.</span>
            </div>
          </div>

          {/* terminal + accent card */}
          <div className="relative">
            <TerminalWindow />

            {/* floating accent card (mirrors Tailwind's "Class Warfare" callout) */}
            <div className="absolute -right-3 -top-8 hidden w-40 -rotate-2 rounded-2xl bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-500 p-px shadow-xl md:block">
              <div className="rounded-[15px] bg-stone-950 p-4 text-white">
                <div className="font-mono text-[10px] uppercase tracking-widest text-white/60">
                  Issue #08
                </div>
                <div
                  className="mt-2 text-xl leading-tight"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  Webhook Warfare
                </div>
                <div className="mt-2 font-mono text-[10px] text-white/60">
                  FuseWire · Newsletter
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────── LOGO STRIP ─────────────────────── */}
      <section className="border-y border-stone-200 bg-stone-50/60">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <h2 className="text-center text-[15px] font-medium text-stone-500">
            Supported integrations from the best in the industry.
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-stone-500/80">
            Auth, billing, data, AI, observability, comms — wired up the way
            modern teams actually ship them.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-x-8 gap-y-6 sm:grid-cols-4 md:grid-cols-6">
            {partnerLogos.map((logo) => (
              <div
                key={logo.name}
                className="flex h-10 items-center justify-center text-[15px] font-semibold tracking-tight text-stone-800/90 grayscale transition hover:grayscale-0"
              >
                <LogoPill name={logo.name} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── BUILT FOR THE MODERN API ─────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="max-w-3xl">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-blue-600">
            // tools
          </div>
          <h2 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-[-0.02em] text-stone-950 sm:text-5xl">
            Built for the{" "}
            <span
              className="font-serif italic text-stone-700"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              modern API.
            </span>
          </h2>
          <p className="mt-5 text-lg text-stone-600">
            Three ways to work with IntegrateAPI. Templates to install
            production code, Stress Test to find scaling risks, Registry to
            learn how the modern stack actually fits together.
          </p>
        </div>

        {/* feature grid — Tailwind-site rhythm: visual + caption */}
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Templates */}
          <FeatureCard
            label="01 / Templates"
            title="Install integrations instantly"
            desc="Production-ready TypeScript dropped into your /lib folder. No SDK lock-in, no runtime layer."
            href="/templates"
            visual={<TemplatesVisual />}
            tone="blue"
          />

          {/* Stress Test */}
          <FeatureCard
            label="02 / Stress Test"
            title="Find scaling risks before incidents"
            desc="Score your SaaS architecture across auth, billing, data and observability — with actionable fixes."
            href="/stress-test"
            visual={<StressVisual />}
            tone="violet"
          />

          {/* Registry */}
          <FeatureCard
            label="03 / Registry"
            title="Explore real API patterns"
            desc="Browse webhook flows, idempotency, retries and rate-limit recipes. Real implementations, not toy code."
            href="/registry"
            visual={<RegistryVisual />}
            tone="amber"
          />

          {/* TypeScript first */}
          <FeatureCard
            label="04 / TypeScript"
            title="Typed end-to-end, by default"
            desc="Every integration ships with strict, modern TypeScript. Types for events, payloads, errors — out of the box."
            visual={<TypesVisual />}
            tone="emerald"
          />

          {/* Own the code */}
          <FeatureCard
            label="05 / Ownership"
            title="It's your code, not a black box"
            desc="No hidden SDK wrapping your API calls. Read it, edit it, extend it, ship it. You keep the source forever."
            visual={<OwnershipVisual />}
            tone="pink"
          />

          {/* Speed */}
          <FeatureCard
            label="06 / Velocity"
            title="From zero to shipped in &lt;30s"
            desc="Install, generate, wire webhooks and types in a single command. The CLI does the boring parts."
            visual={<SpeedVisual />}
            tone="teal"
          />
        </div>
      </section>

      {/* ─────────────────────── SHIP FASTER ─────────────────────── */}
      <section className="border-t border-stone-200 bg-stone-50/60">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="max-w-3xl">
            <div className="font-mono text-xs uppercase tracking-[0.18em] text-blue-600">
              // philosophy
            </div>
            <h2 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-[-0.02em] text-stone-950 sm:text-5xl">
              Ship faster.{" "}
              <span
                className="font-serif italic text-stone-700"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Own the code.
              </span>
            </h2>
            <p className="mt-5 text-lg text-stone-600">
              IntegrateAPI doesn&apos;t add a layer between you and the API.
              When you run <code className="rounded bg-stone-200/70 px-1.5 py-0.5 font-mono text-[13px] text-stone-800">npx integrateapi add stripe</code>, working code lands in <code className="rounded bg-stone-200/70 px-1.5 py-0.5 font-mono text-[13px] text-stone-800">/lib/integrations</code>. That&apos;s where it stays — versioned with your repo, reviewed by your team, deployed with your app.
            </p>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            {/* Before */}
            <div className="rounded-2xl border border-stone-200 bg-white p-1 shadow-sm">
              <div className="flex items-center justify-between rounded-t-xl bg-stone-100 px-4 py-2 font-mono text-[11px] text-stone-500">
                <span>Before — hand-wired Stripe webhook</span>
                <span className="text-stone-400">stripe.ts</span>
              </div>
              <pre className="overflow-x-auto rounded-b-xl bg-white px-4 py-4 font-mono text-[12.5px] leading-[1.7] text-stone-700">
{`import Stripe from "stripe";

// TODO: idempotency? retries?
// TODO: signature verification?
const stripe = new Stripe(process.env.STRIPE_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  // 60+ lines of error-prone handler...
}`}
              </pre>
            </div>
            {/* After */}
            <div className="rounded-2xl border border-stone-900/10 bg-stone-950 p-1 shadow-[0_30px_60px_-20px_rgba(15,23,42,0.35)]">
              <div className="flex items-center justify-between rounded-t-xl bg-white/5 px-4 py-2 font-mono text-[11px] text-white/60">
                <span>After — npx integrateapi add stripe</span>
                <span className="text-white/40">stripe.ts</span>
              </div>
              <pre className="overflow-x-auto rounded-b-xl px-4 py-4 font-mono text-[12.5px] leading-[1.7] text-stone-200">
                <span className="text-violet-300">import</span>{" "}
                <span className="text-stone-300">{"{"} verifyWebhook {"}"}</span>{" "}
                <span className="text-violet-300">from</span>{" "}
                <span className="text-emerald-300">&quot;@/lib/integrations/stripe&quot;</span>;
                {"\n\n"}
                <span className="text-violet-300">export async function</span>{" "}
                <span className="text-sky-300">POST</span>(req: Request) {"{"}
                {"\n  "}
                <span className="text-violet-300">const</span> event ={" "}
                <span className="text-violet-300">await</span>{" "}
                <span className="text-sky-300">verifyWebhook</span>(req);
                {"\n  "}
                <span className="text-violet-300">return</span>{" "}
                <span className="text-sky-300">handle</span>(event);
                {"\n"}
                {"}"}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────── OWN THE CODE / FILE TREE ─────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.18em] text-blue-600">
              // ownership
            </div>
            <h2 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-[-0.02em] text-stone-950 sm:text-5xl">
              Code lives in your{" "}
              <span
                className="font-serif italic text-stone-700"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                repo.
              </span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-stone-600">
              Real TypeScript, in <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[13px] text-stone-800">/lib/integrations</code>, versioned with your project. No magic, no proxy, no upgrade dread.
            </p>
            <ul className="mt-7 space-y-3 text-stone-700">
              {[
                "TypeScript-first — strict, modern, typed end-to-end",
                "Zero runtime SDK dependency — own the source",
                "Install in seconds — copy, commit, ship",
                "Works with modern SaaS stacks out of the box",
                "Focused on real patterns, not toy demos",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-stone-950 text-white">
                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7.6 13.2 4.4 10l1.4-1.4 1.8 1.8 5.6-5.6L14.6 6z" />
                    </svg>
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-2 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.18)]">
            <div className="flex items-center gap-2 rounded-t-xl bg-stone-50 px-4 py-3 font-mono text-[11px] text-stone-500">
              <FolderIcon />
              <span className="text-stone-700">/lib/integrations</span>
            </div>
            <ul className="divide-y divide-stone-100">
              {fileTreeItems.map((file) => (
                <li
                  key={file}
                  className="flex items-center gap-3 px-4 py-3 font-mono text-[13px] text-stone-700 transition hover:bg-stone-50"
                >
                  <span className="grid h-5 w-5 place-items-center rounded bg-blue-50 font-mono text-[9px] font-bold text-blue-700">
                    TS
                  </span>
                  {file}
                </li>
              ))}
              <li className="flex items-center gap-3 px-4 py-3 font-mono text-[12px] text-stone-400">
                <span className="grid h-5 w-5 place-items-center rounded bg-stone-100 text-stone-500">+</span>
                more on install
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─────────────────────── STATS BAND ─────────────────────── */}
      <section className="border-y border-stone-200 bg-stone-950 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-white/10 sm:grid-cols-4">
          {[
            { num: "12+", label: "Integrations" },
            { num: "<30s", label: "Install time" },
            { num: "0", label: "Runtime deps" },
            { num: "100%", label: "TypeScript" },
          ].map((s) => (
            <div key={s.label} className="bg-stone-950 px-8 py-12">
              <div
                className="text-5xl tracking-tight"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {s.num}
              </div>
              <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────── NEWSLETTER (FuseWire) ─────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.18em] text-blue-600">
              // newsletter
            </div>
            <div
              className="mt-3 text-7xl tracking-[-0.02em]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              FuseWire.
            </div>
            <p className="mt-5 max-w-md text-lg text-stone-600">
              The weekly newsletter on SaaS architecture, API design and
              integration strategy. No fluff. No sponsor reads. Just patterns
              that ship.
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-2 text-sm text-stone-700">
              {["SaaS architecture", "API design patterns", "Integration strategies", "New developer tools"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
            <form onSubmit={submitNewsletter} className="flex flex-col gap-3">
              <label
                htmlFor="newsletter-email"
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-stone-500"
              >
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={newsletterEmail}
                onChange={(e) => {
                  setNewsletterEmail(e.target.value);
                  if (newsletterStatus !== "idle") {
                    setNewsletterStatus("idle");
                    setNewsletterMessage(null);
                  }
                }}
                placeholder="you@company.com"
                autoComplete="email"
                inputMode="email"
                required
                className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none ring-blue-500/20 transition focus:border-blue-500 focus:ring-4"
              />
              <button
                type="submit"
                disabled={newsletterStatus === "loading"}
                className="inline-flex items-center justify-center rounded-xl bg-stone-950 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-stone-800 disabled:opacity-50"
              >
                {newsletterStatus === "loading" ? "Sending..." : "Subscribe to FuseWire"}
              </button>
              {newsletterMessage && (
                <p
                  className={`text-sm ${
                    newsletterStatus === "error"
                      ? "text-red-600"
                      : "text-emerald-600"
                  }`}
                >
                  {newsletterMessage}
                </p>
              )}
              <p className="mt-2 text-xs text-stone-500">
                Weekly · No spam · Unsubscribe anytime.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* ─────────────────────── PRICING ─────────────────────── */}
      <section
        id="pricing"
        className="border-t border-stone-200 bg-stone-50/70"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="text-center">
            <div className="font-mono text-xs uppercase tracking-[0.18em] text-blue-600">
              // pricing
            </div>
            <h2 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-[-0.02em] text-stone-950 sm:text-5xl">
              Simple, honest{" "}
              <span
                className="font-serif italic text-stone-700"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                pricing.
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-stone-600">
              Monthly or lifetime. No seat fees. No surprise upgrades.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
            {/* Free */}
            <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
              <div className="font-mono text-xs uppercase tracking-[0.18em] text-stone-500">
                Free
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <div
                  className="text-5xl tracking-[-0.02em]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  $0
                </div>
                <div className="font-mono text-xs text-stone-500">
                  / forever
                </div>
              </div>
              <ul className="mt-6 space-y-2 text-sm text-stone-700">
                {[
                  "5 integrations",
                  "All free-tier templates",
                  "Registry access",
                  "Stress Test tool",
                  "CLI access",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-stone-400" />
                    {t}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="mt-8 inline-flex w-full items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-900 transition hover:border-stone-400 hover:bg-stone-50"
              >
                Get started free
              </Link>
            </div>

            {/* Pro */}
            <div className="relative overflow-hidden rounded-3xl bg-stone-950 p-8 text-white shadow-[0_30px_60px_-20px_rgba(15,23,42,0.45)]">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500" />
              <div className="font-mono text-xs uppercase tracking-[0.18em] text-blue-300">
                Pro
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <div
                  className="text-5xl tracking-[-0.02em]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  $9
                </div>
                <div className="font-mono text-xs text-white/60">
                  / month · or $29 lifetime
                </div>
              </div>
              <ul className="mt-6 space-y-2 text-sm text-white/85">
                {[
                  "Unlimited integrations",
                  "All pro-tier templates",
                  "Registry access",
                  "Stress Test tool",
                  "Future templates included",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-blue-400" />
                    {t}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-stone-100"
              >
                Get Pro →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────── CTA ─────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-8">
        <div className="font-mono text-xs uppercase tracking-[0.18em] text-blue-600">
          // get started
        </div>
        <h2 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-[-0.02em] text-stone-950 sm:text-6xl">
          Start building{" "}
          <span
            className="font-serif italic text-stone-700"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            faster.
          </span>
        </h2>
        <div className="mt-8">
          <CtaTerminal />
        </div>
        <div className="mt-8">
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-stone-800"
          >
            Get Started →
          </Link>
        </div>
      </section>

      {/* ─────────────────────── FOOTER ─────────────────────── */}
      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 font-mono text-sm font-semibold tracking-tight text-stone-900"
              >
                <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.7)]" />
                IntegrateAPI
              </Link>
              <p className="mt-4 max-w-sm text-sm text-stone-500">
                The CLI-first developer toolkit for shipping SaaS integrations
                without the SDK lock-in.
              </p>
            </div>
            <FooterCol
              title="Product"
              links={[
                ["Templates", "/templates"],
                ["Stress Test", "/stress-test"],
                ["Registry", "/registry"],
                ["Pricing", "#pricing"],
              ]}
            />
            <FooterCol
              title="Resources"
              links={[
                ["Docs", "/docs"],
                ["Get Started", "/get-started"],
                ["Support", "/support"],
              ]}
            />
            <FooterCol
              title="Company"
              links={[
                ["GitHub", "https://github.com/Reliathedisco/IntegrateAPI_Fusewire", true],
                ["Sign In", "/sign-in"],
                ["Account", "/account"],
              ]}
            />
          </div>
          <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-stone-200 pt-8 text-xs text-stone-500 sm:flex-row sm:items-center">
            <span>© 2026 Reli Music LLC</span>
            <span className="font-mono">Built with care · Powered by the CLI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Subcomponents
   ───────────────────────────────────────────────────────────────────────── */

function LogoPill({ name }: { name: string }) {
  return (
    <span className="font-[500] tracking-tight">
      {name}
    </span>
  );
}

function FolderIcon() {
  return (
    <svg className="h-4 w-4 text-stone-400" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 5a2 2 0 0 1 2-2h3.5l2 2H16a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" />
    </svg>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: Array<[string, string] | [string, string, boolean]>;
}) {
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-stone-500">
        {title}
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {links.map(([label, href, ext]) => (
          <li key={label}>
            {ext ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-700 transition hover:text-stone-950"
              >
                {label}
              </a>
            ) : (
              <Link
                href={href}
                className="text-stone-700 transition hover:text-stone-950"
              >
                {label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── feature cards (visual + caption — Tailwind grid rhythm) ─── */

const toneRing: Record<string, string> = {
  blue: "ring-blue-100 from-blue-50 to-white",
  violet: "ring-violet-100 from-violet-50 to-white",
  amber: "ring-amber-100 from-amber-50 to-white",
  emerald: "ring-emerald-100 from-emerald-50 to-white",
  pink: "ring-pink-100 from-pink-50 to-white",
  teal: "ring-teal-100 from-teal-50 to-white",
};

function FeatureCard({
  label,
  title,
  desc,
  href,
  visual,
  tone = "blue",
}: {
  label: string;
  title: string;
  desc: string;
  href?: string;
  visual: React.ReactNode;
  tone?: keyof typeof toneRing;
}) {
  const inner = (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`relative aspect-[16/9] overflow-hidden bg-gradient-to-br ${toneRing[tone]} ring-1 ring-inset`}
      >
        <div className="absolute inset-0 flex items-center justify-center p-5">
          {visual}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-stone-500">
          {label}
        </div>
        <h3 className="mt-2 text-xl font-bold tracking-[-0.01em] text-stone-950">
          {title}
        </h3>
        <p
          className="mt-2 text-[15px] leading-relaxed text-stone-600"
          dangerouslySetInnerHTML={{ __html: desc }}
        />
        {href && (
          <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700">
            Learn more
            <svg
              className="h-4 w-4 transition group-hover:translate-x-0.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M7.5 4.5 13 10l-5.5 5.5-1.4-1.4L10.2 10 6.1 5.9z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
  return href ? <Link href={href} className="block h-full">{inner}</Link> : inner;
}

/* ─── feature card visuals ─── */

function TemplatesVisual() {
  return (
    <div className="w-full rounded-xl border border-stone-200 bg-white p-3 font-mono text-[11px] leading-relaxed shadow-sm">
      <div className="mb-2 flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
        <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
        <span className="h-2 w-2 rounded-full bg-[#28c840]" />
      </div>
      <div className="text-stone-500">$ <span className="text-stone-900">npx integrateapi add stripe</span></div>
      <div className="text-emerald-600">✓ Installing Stripe integration</div>
      <div className="text-emerald-600">✓ Generating client</div>
      <div className="text-emerald-600">✓ Adding webhook handler</div>
      <div className="text-emerald-600">✓ Creating types</div>
      <div className="mt-1 font-semibold text-emerald-700">Integration ready.</div>
    </div>
  );
}

function StressVisual() {
  const bars = [62, 80, 45, 90, 72, 55, 78, 88];
  return (
    <div className="w-full rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
      <div className="flex items-end justify-between gap-1.5 h-20">
        {bars.map((b, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-gradient-to-t from-violet-500 to-fuchsia-400"
            style={{ height: `${b}%` }}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-stone-500">
        <span>Score 78 / 100</span>
        <span className="text-violet-700">+12 vs last run</span>
      </div>
    </div>
  );
}

function RegistryVisual() {
  return (
    <div className="w-full rounded-xl border border-stone-200 bg-white p-3 font-mono text-[11px] leading-relaxed shadow-sm">
      <div className="text-stone-400">// webhooks/stripe.ts</div>
      <div>
        <span className="text-violet-600">if</span>{" "}
        (
        <span className="text-sky-700">isIdempotent</span>(evt)) {"{"}
      </div>
      <div className="pl-3">
        <span className="text-violet-600">return</span>{" "}
        <span className="text-amber-700">ack</span>();
      </div>
      <div>{"}"}</div>
      <div>
        <span className="text-violet-600">await</span>{" "}
        <span className="text-sky-700">retryWithBackoff</span>(handle, evt);
      </div>
    </div>
  );
}

function TypesVisual() {
  return (
    <div className="w-full rounded-xl border border-stone-200 bg-white p-3 font-mono text-[11px] leading-relaxed shadow-sm">
      <div>
        <span className="text-violet-600">type</span>{" "}
        <span className="text-emerald-700">StripeEvent</span> = {"{"}
      </div>
      <div className="pl-3">
        id: <span className="text-amber-700">string</span>;
      </div>
      <div className="pl-3">
        type: <span className="text-amber-700">&quot;invoice.paid&quot;</span>{" "}
        | <span className="text-amber-700">&quot;customer.created&quot;</span>;
      </div>
      <div className="pl-3">
        data: <span className="text-emerald-700">Stripe.Event</span>;
      </div>
      <div>{"};"}</div>
    </div>
  );
}

function OwnershipVisual() {
  return (
    <div className="grid w-full grid-cols-3 gap-2">
      {["stripe.ts", "clerk.ts", "openai.ts", "supabase.ts", "resend.ts", "posthog.ts"].map(
        (f) => (
          <div
            key={f}
            className="flex items-center gap-1.5 rounded-lg border border-pink-100 bg-white p-2 font-mono text-[10px] text-stone-700 shadow-sm"
          >
            <span className="grid h-4 w-4 place-items-center rounded bg-pink-100 text-[8px] font-bold text-pink-700">
              TS
            </span>
            <span className="truncate">{f}</span>
          </div>
        ),
      )}
    </div>
  );
}

function SpeedVisual() {
  return (
    <div className="flex w-full items-center justify-center gap-3 font-mono text-[11px]">
      <div className="rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
        <div className="text-stone-400">install</div>
        <div className="text-2xl font-bold text-stone-900">
          &lt;30<span className="text-base text-stone-400">s</span>
        </div>
      </div>
      <svg className="h-4 w-4 text-stone-400" viewBox="0 0 20 20" fill="currentColor">
        <path d="M7.5 4.5 13 10l-5.5 5.5-1.4-1.4L10.2 10 6.1 5.9z" />
      </svg>
      <div className="rounded-xl border border-teal-200 bg-white px-4 py-3 shadow-sm">
        <div className="text-teal-500">ready</div>
        <div className="text-2xl font-bold text-stone-900">ship</div>
      </div>
    </div>
  );
}
