"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

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
    description: "Complete payments platform for internet businesses. Accept payments, manage subscriptions, and handle complex payment flows.",
    category: "payments",
    envVars: ["STRIPE_SECRET_KEY", "STRIPE_PUBLISHABLE_KEY", "STRIPE_WEBHOOK_SECRET"],
    installCommand: "npx integrateapi add stripe",
    docs: "https://stripe.com/docs",
  },
  {
    id: "lemon-squeezy",
    name: "Lemon Squeezy",
    description: "All-in-one platform for running your SaaS business. Payments, subscriptions, and global tax compliance built-in.",
    category: "payments",
    envVars: ["LEMON_SQUEEZY_API_KEY", "LEMON_SQUEEZY_STORE_ID", "LEMON_SQUEEZY_WEBHOOK_SECRET"],
    installCommand: "npx integrateapi add lemon-squeezy",
    docs: "https://docs.lemonsqueezy.com",
  },
  {
    id: "clerk",
    name: "Clerk",
    description: "Complete user management and authentication. Drop-in auth with social logins, MFA, and user profiles.",
    category: "auth",
    envVars: ["CLERK_SECRET_KEY", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"],
    installCommand: "npx integrateapi add clerk",
    docs: "https://clerk.com/docs",
  },
  {
    id: "auth0",
    name: "Auth0",
    description: "Flexible authentication and authorization platform. Secure access for applications and APIs.",
    category: "auth",
    envVars: ["AUTH0_SECRET", "AUTH0_BASE_URL", "AUTH0_ISSUER_BASE_URL", "AUTH0_CLIENT_ID", "AUTH0_CLIENT_SECRET"],
    installCommand: "npx integrateapi add auth0",
    docs: "https://auth0.com/docs",
  },
  {
    id: "supabase",
    name: "Supabase",
    description: "Open source Firebase alternative. Postgres database, authentication, instant APIs, and realtime subscriptions.",
    category: "database",
    envVars: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
    installCommand: "npx integrateapi add supabase",
    docs: "https://supabase.com/docs",
  },
  {
    id: "neon",
    name: "Neon",
    description: "Serverless Postgres built for the cloud. Instant branching, autoscaling, and bottomless storage.",
    category: "database",
    envVars: ["DATABASE_URL", "NEON_API_KEY"],
    installCommand: "npx integrateapi add neon",
    docs: "https://neon.tech/docs",
  },
  {
    id: "resend",
    name: "Resend",
    description: "Email API for developers. Build, test, and send transactional emails at scale.",
    category: "email",
    envVars: ["RESEND_API_KEY"],
    installCommand: "npx integrateapi add resend",
    docs: "https://resend.com/docs",
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "AI models for natural language, code, and images. GPT-4, DALL-E, Whisper, and embeddings.",
    category: "ai",
    envVars: ["OPENAI_API_KEY", "OPENAI_ORG_ID"],
    installCommand: "npx integrateapi add openai",
    docs: "https://platform.openai.com/docs",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Claude AI models for safe, accurate, and helpful assistance. Advanced reasoning and analysis.",
    category: "ai",
    envVars: ["ANTHROPIC_API_KEY"],
    installCommand: "npx integrateapi add anthropic",
    docs: "https://docs.anthropic.com",
  },
  {
    id: "sentry",
    name: "Sentry",
    description: "Application monitoring and error tracking. Real-time crash reporting with context and stack traces.",
    category: "monitoring",
    envVars: ["SENTRY_DSN", "SENTRY_AUTH_TOKEN", "SENTRY_ORG", "SENTRY_PROJECT"],
    installCommand: "npx integrateapi add sentry",
    docs: "https://docs.sentry.io",
  },
  {
    id: "posthog",
    name: "PostHog",
    description: "Product analytics, feature flags, and session recording. All-in-one platform for understanding users.",
    category: "analytics",
    envVars: ["NEXT_PUBLIC_POSTHOG_KEY", "NEXT_PUBLIC_POSTHOG_HOST"],
    installCommand: "npx integrateapi add posthog",
    docs: "https://posthog.com/docs",
  },
  {
    id: "uploadthing",
    name: "UploadThing",
    description: "File uploads for modern web apps. Simple API for handling uploads with built-in CDN and optimization.",
    category: "storage",
    envVars: ["UPLOADTHING_SECRET", "UPLOADTHING_APP_ID"],
    installCommand: "npx integrateapi add uploadthing",
    docs: "https://docs.uploadthing.com",
  },
  {
    id: "vercel",
    name: "Vercel",
    description: "Platform for frontend frameworks and static sites. Deploy instantly with automatic HTTPS, global CDN, and edge functions.",
    category: "deployment",
    envVars: ["VERCEL_TOKEN", "VERCEL_PROJECT_ID", "VERCEL_ORG_ID"],
    installCommand: "npx integrateapi add vercel",
    docs: "https://vercel.com/docs",
  },
  {
    id: "railway",
    name: "Railway",
    description: "Deploy infrastructure without the complexity. Provision databases, deploy backends, and scale with zero DevOps.",
    category: "deployment",
    envVars: ["RAILWAY_TOKEN", "RAILWAY_PROJECT_ID"],
    installCommand: "npx integrateapi add railway",
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

function CommandBlock({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
    }
  };

  return (
    <div className="registry-command">
      <code>{command}</code>
      <button onClick={handleCopy} className="registry-copy-btn">
        {copied ? "✓" : "Copy"}
      </button>
    </div>
  );
}

function IntegrationCard({
  integration,
  onClick,
}: {
  integration: Integration;
  onClick: () => void;
}) {
  return (
    <div className="registry-card" onClick={onClick}>
      <div className="registry-card-header">
        <h3>{integration.name}</h3>
        <span className="registry-badge">{integration.category}</span>
      </div>
      <p>{integration.description}</p>
      <div className="registry-card-meta">
        <span>{integration.envVars.length} env vars</span>
        <span>•</span>
        <span>{integration.installCommand.split(" ")[0]}</span>
      </div>
    </div>
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
    <div className="registry-modal-overlay" onClick={onClose}>
      <div className="registry-modal" onClick={(e) => e.stopPropagation()}>
        <button className="registry-modal-close" onClick={onClose}>
          ×
        </button>
        <div className="registry-modal-header">
          <h2>{integration.name}</h2>
          <span className="registry-badge">{integration.category}</span>
        </div>
        <p className="registry-modal-desc">{integration.description}</p>

        <div className="registry-modal-section">
          <h4>Install Command</h4>
          <CommandBlock command={integration.installCommand} />
        </div>

        <div className="registry-modal-section">
          <h4>Environment Variables</h4>
          <div className="registry-env-list">
            {integration.envVars.map((envVar) => (
              <div key={envVar} className="registry-env-item">
                <code>{envVar}</code>
              </div>
            ))}
          </div>
        </div>

        {integration.docs && (
          <div className="registry-modal-section">
            <a
              href={integration.docs}
              target="_blank"
              rel="noopener noreferrer"
              className="registry-docs-link"
            >
              📖 View Documentation →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegistryPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory | "all">("all");
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

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
    <div className="registry-page">
      <div className="registry-hero">
        <div className="registry-hero-grid"></div>
        <div className="registry-hero-content">
          <h1>Registry</h1>
          <p>CLI Integration Registry for SaaS Developers</p>
          <CommandBlock command="npx integrateapi list" />
        </div>
      </div>

      <div className="registry-main">
        <div className="registry-filters">
          <input
            type="text"
            placeholder="Search integrations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="registry-search"
          />

          <div className="registry-categories">
            <button
              className={`registry-category-btn ${selectedCategory === "all" ? "active" : ""}`}
              onClick={() => setSelectedCategory("all")}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.value}
                className={`registry-category-btn ${selectedCategory === category.value ? "active" : ""}`}
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {filteredIntegrations.length === 0 ? (
          <div className="registry-empty">
            <p>No integrations found. Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="registry-grid">
            {filteredIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onClick={() => setSelectedIntegration(integration)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedIntegration && (
        <IntegrationDetail
          integration={selectedIntegration}
          onClose={() => setSelectedIntegration(null)}
        />
      )}

      <div className="registry-footer">
        <p>
          <Link href="/templates">Browse Templates</Link> •{" "}
          <Link href="/stress-test">Run Stress Test</Link> •{" "}
          <Link href="/">Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
