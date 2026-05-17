"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Pill } from "@/components/ui/Pill";
import CodeBlock from "@/components/CodeBlock";
import { cn } from "@/lib/cn";

type IntegrationCategory =
  | "payments"
  | "auth"
  | "database"
  | "email"
  | "ai"
  | "analytics"
  | "monitoring"
  | "storage"
  | "deployment";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  envVars: string[];
  installCommand: string;
  docs?: string;
}

const integrations: Integration[] = [
  {
    id: "stripe",
    name: "Stripe",
    description:
      "Complete payments platform for internet businesses. Accept payments, manage subscriptions, and handle complex payment flows.",
    category: "payments",
    envVars: ["STRIPE_SECRET_KEY", "STRIPE_PUBLISHABLE_KEY", "STRIPE_WEBHOOK_SECRET"],
    installCommand: "npm install stripe",
    docs: "https://stripe.com/docs",
  },
  {
    id: "lemon-squeezy",
    name: "Lemon Squeezy",
    description:
      "All-in-one platform for running your SaaS business. Payments, subscriptions, and global tax compliance built-in.",
    category: "payments",
    envVars: [
      "LEMON_SQUEEZY_API_KEY",
      "LEMON_SQUEEZY_STORE_ID",
      "LEMON_SQUEEZY_WEBHOOK_SECRET",
    ],
    installCommand: "npm install @lemonsqueezy/lemonsqueezy.js",
    docs: "https://docs.lemonsqueezy.com",
  },
  {
    id: "clerk",
    name: "Clerk",
    description:
      "Complete user management and authentication. Drop-in auth with social logins, MFA, and user profiles.",
    category: "auth",
    envVars: ["CLERK_SECRET_KEY", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"],
    installCommand: "npm install @clerk/nextjs",
    docs: "https://clerk.com/docs",
  },
  {
    id: "auth0",
    name: "Auth0",
    description:
      "Flexible authentication and authorization platform. Secure access for applications and APIs.",
    category: "auth",
    envVars: [
      "AUTH0_SECRET",
      "AUTH0_BASE_URL",
      "AUTH0_ISSUER_BASE_URL",
      "AUTH0_CLIENT_ID",
      "AUTH0_CLIENT_SECRET",
    ],
    installCommand: "npm install @auth0/nextjs-auth0",
    docs: "https://auth0.com/docs",
  },
  {
    id: "supabase",
    name: "Supabase",
    description:
      "Open source Firebase alternative. Postgres database, authentication, instant APIs, and realtime subscriptions.",
    category: "database",
    envVars: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
    installCommand: "npm install @supabase/supabase-js",
    docs: "https://supabase.com/docs",
  },
  {
    id: "neon",
    name: "Neon",
    description:
      "Serverless Postgres built for the cloud. Instant branching, autoscaling, and bottomless storage.",
    category: "database",
    envVars: ["DATABASE_URL", "NEON_API_KEY"],
    installCommand: "npm install @neondatabase/serverless",
    docs: "https://neon.tech/docs",
  },
  {
    id: "resend",
    name: "Resend",
    description:
      "Email API for developers. Build, test, and send transactional emails at scale.",
    category: "email",
    envVars: ["RESEND_API_KEY"],
    installCommand: "npm install resend",
    docs: "https://resend.com/docs",
  },
  {
    id: "openai",
    name: "OpenAI",
    description:
      "AI models for natural language, code, and images. GPT-4, DALL-E, Whisper, and embeddings.",
    category: "ai",
    envVars: ["OPENAI_API_KEY", "OPENAI_ORG_ID"],
    installCommand: "npm install openai",
    docs: "https://platform.openai.com/docs",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description:
      "Claude AI models for safe, accurate, and helpful assistance. Advanced reasoning and analysis.",
    category: "ai",
    envVars: ["ANTHROPIC_API_KEY"],
    installCommand: "npm install @anthropic-ai/sdk",
    docs: "https://docs.anthropic.com",
  },
  {
    id: "sentry",
    name: "Sentry",
    description:
      "Application monitoring and error tracking. Real-time crash reporting with context and stack traces.",
    category: "monitoring",
    envVars: ["SENTRY_DSN", "SENTRY_AUTH_TOKEN", "SENTRY_ORG", "SENTRY_PROJECT"],
    installCommand: "npm install @sentry/nextjs",
    docs: "https://docs.sentry.io",
  },
  {
    id: "posthog",
    name: "PostHog",
    description:
      "Product analytics, feature flags, and session recording. All-in-one platform for understanding users.",
    category: "analytics",
    envVars: ["NEXT_PUBLIC_POSTHOG_KEY", "NEXT_PUBLIC_POSTHOG_HOST"],
    installCommand: "npm install posthog-js",
    docs: "https://posthog.com/docs",
  },
  {
    id: "uploadthing",
    name: "UploadThing",
    description:
      "File uploads for modern web apps. Simple API for handling uploads with built-in CDN and optimization.",
    category: "storage",
    envVars: ["UPLOADTHING_SECRET", "UPLOADTHING_APP_ID"],
    installCommand: "npm install uploadthing",
    docs: "https://docs.uploadthing.com",
  },
  {
    id: "vercel",
    name: "Vercel",
    description:
      "Platform for frontend frameworks and static sites. Deploy instantly with automatic HTTPS, global CDN, and edge functions.",
    category: "deployment",
    envVars: ["VERCEL_TOKEN", "VERCEL_PROJECT_ID", "VERCEL_ORG_ID"],
    installCommand: "npm install -g vercel",
    docs: "https://vercel.com/docs",
  },
  {
    id: "railway",
    name: "Railway",
    description:
      "Deploy infrastructure without the complexity. Provision databases, deploy backends, and scale with zero DevOps.",
    category: "deployment",
    envVars: ["RAILWAY_TOKEN", "RAILWAY_PROJECT_ID"],
    installCommand: "npm install -g @railway/cli",
    docs: "https://docs.railway.app",
  },
];

const categories: { value: IntegrationCategory; label: string }[] = [
  { value: "payments", label: "Payments" },
  { value: "auth", label: "Auth" },
  { value: "database", label: "Database" },
  { value: "email", label: "Email" },
  { value: "ai", label: "AI" },
  { value: "analytics", label: "Analytics" },
  { value: "monitoring", label: "Monitoring" },
  { value: "storage", label: "Storage" },
  { value: "deployment", label: "Deployment" },
];

function IntegrationCard({
  integration,
  onClick,
}: {
  integration: Integration;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col rounded-2xl border border-line bg-card p-6 text-left transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold tracking-tight text-ink">
          {integration.name}
        </h3>
        <Pill className="capitalize">{integration.category}</Pill>
      </div>
      <p className="mt-3 line-clamp-3 text-sm/6 text-mute">
        {integration.description}
      </p>
      <p className="mt-4 font-mono text-[11px] text-faint">
        {integration.envVars.length} env vars ·{" "}
        {integration.installCommand.split(" ").slice(-1)[0]}
      </p>
    </button>
  );
}

function IntegrationDetail({
  integration,
  onClose,
}: {
  integration: Integration;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-ink/70 p-5"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-line bg-paper p-8 shadow-lg"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 rounded-md p-1.5 text-mute transition hover:bg-paper-soft hover:text-ink"
        >
          ✕
        </button>
        <Eyebrow>{integration.category}</Eyebrow>
        <h2 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-ink">
          {integration.name}
        </h2>
        <p className="mt-3 text-sm/6 text-mute">{integration.description}</p>

        <section className="mt-8">
          <Eyebrow>Install command</Eyebrow>
          <div className="mt-3">
            <CodeBlock
              code={integration.installCommand}
              variant="inline"
            />
          </div>
        </section>

        <section className="mt-8">
          <Eyebrow>Environment variables</Eyebrow>
          <ul className="mt-3 flex flex-col divide-y divide-line rounded-xl border border-line bg-card">
            {integration.envVars.map((envVar) => (
              <li key={envVar} className="px-4 py-3">
                <code className="font-mono text-[12.5px] text-ink">{envVar}</code>
              </li>
            ))}
          </ul>
        </section>

        {integration.docs && (
          <p className="mt-8">
            <a
              href={integration.docs}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-accent transition-colors hover:text-accent-hover"
            >
              View documentation →
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

export default function RegistryPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    IntegrationCategory | "all"
  >("all");
  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);

  const filteredIntegrations = useMemo(() => {
    return integrations.filter((integration) => {
      const matchesSearch =
        integration.name.toLowerCase().includes(search.toLowerCase()) ||
        integration.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || integration.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  return (
    <>
      <section className="border-b border-line py-16 md:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Registry</Eyebrow>
            <h1 className="mt-3 font-sans text-4xl/[1.05] font-semibold tracking-tight text-ink md:text-5xl/[1.05]">
              CLI integration registry.
            </h1>
            <p className="mx-auto mt-5 max-w-md text-base/7 text-mute">
              Every template the CLI can install. Browse by category, copy the
              install command, ship.
            </p>
            <div className="mx-auto mt-8 max-w-sm">
              <CodeBlock code="npx integrateapi list" variant="inline" />
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="flex flex-col gap-5">
            <label className="block w-full">
              <span className="sr-only">Search registry</span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search integrations..."
                className="w-full rounded-full border border-line-strong bg-card px-5 py-3 text-sm text-ink outline-hidden transition focus:border-ink focus:ring-3 focus:ring-ink/5"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium tracking-tight transition",
                  selectedCategory === "all"
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-card text-mute hover:border-line-strong hover:text-ink",
                )}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setSelectedCategory(c.value)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium tracking-tight transition",
                    selectedCategory === c.value
                      ? "border-ink bg-ink text-paper"
                      : "border-line bg-card text-mute hover:border-line-strong hover:text-ink",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-24">
        <Container>
          {filteredIntegrations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line py-16 text-center">
              <p className="text-sm text-mute">
                No integrations found. Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredIntegrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onClick={() => setSelectedIntegration(integration)}
                />
              ))}
            </div>
          )}
        </Container>
      </section>

      {selectedIntegration && (
        <IntegrationDetail
          integration={selectedIntegration}
          onClose={() => setSelectedIntegration(null)}
        />
      )}
    </>
  );
}
