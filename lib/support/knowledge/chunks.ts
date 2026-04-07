import type { KnowledgeChunk } from "../types";

/**
 * Ground-truth knowledge for IntegrateAPI support RAG.
 * Keep in sync with product marketing and /docs where possible.
 */
export const KNOWLEDGE_CHUNKS: KnowledgeChunk[] = [
  {
    id: "overview-what",
    title: "What is IntegrateAPI?",
    source: "Product overview",
    text: `IntegrateAPI is a CLI-based developer toolkit for shipping SaaS integrations faster. It installs production-ready TypeScript code into your Next.js (and similar) projects—think Stripe, Clerk, Supabase, OpenAI, and many other providers. You own the code: no runtime SDK lock-in. The workflow is optimized for real teams building real products, not toy demos.`,
  },
  {
    id: "overview-how",
    title: "How does IntegrateAPI work?",
    source: "Product overview",
    text: `You authenticate once, pick an integration or stack, and the CLI copies templates and wiring into your repo under predictable paths (for example lib/integrations). Commands are run from your project root with npx integrateapi. After install, you configure provider keys in your environment and follow any README notes added by the template.`,
  },
  {
    id: "cli-login",
    title: "CLI: login",
    source: "CLI documentation",
    text: `Command: npx integrateapi login. Authenticates your machine with IntegrateAPI and links your account so you can add integrations and manage templates. Run this first on a new machine or after clearing credentials.`,
  },
  {
    id: "cli-list",
    title: "CLI: list integrations",
    source: "CLI documentation",
    text: `Command: npx integrateapi list. Lists integrations available to your account/plan so you can choose what to install.`,
  },
  {
    id: "cli-add",
    title: "CLI: add integration",
    source: "CLI documentation",
    text: `Command: npx integrateapi add <integration>. Example: npx integrateapi add stripe. Run from your app root. The CLI installs the integration template, generates helpers, webhook handlers or API routes as needed, and adds TypeScript types when applicable.`,
  },
  {
    id: "cli-upgrade",
    title: "CLI: upgrade integration",
    source: "CLI documentation",
    text: `Command: npx integrateapi upgrade <integration>. Upgrades an existing integration folder to the latest published template while aiming to preserve your local edits where possible. Review the diff after upgrading.`,
  },
  {
    id: "cli-account",
    title: "CLI: account",
    source: "CLI documentation",
    text: `Command: npx integrateapi account. Shows account information and plan details tied to your logged-in user.`,
  },
  {
    id: "cli-scan",
    title: "CLI: scan",
    source: "CLI documentation",
    text: `Command: npx integrateapi scan. Scans the project for existing integrations and can suggest updates or fixes based on what it finds.`,
  },
  {
    id: "cli-stack",
    title: "CLI: stack presets",
    source: "CLI documentation",
    text: `Command: npx integrateapi stack <preset>. Installs a preset bundle such as saas-starter or ai-saas—multiple integrations wired for a common architecture. Choose a preset that matches your product shape.`,
  },
  {
    id: "cli-doctor",
    title: "CLI: doctor",
    source: "CLI documentation",
    text: `Command: npx integrateapi doctor. Checks local setup: environment variables, dependencies, and project config. Use it when something fails mysteriously after install.`,
  },
  {
    id: "tools-templates",
    title: "Templates area",
    source: "Product: Templates",
    text: `The Templates section of the product helps you browse installable integrations before running the CLI. It highlights what each template installs and links to get-started flows.`,
  },
  {
    id: "tools-stress-test",
    title: "Stress Test tool",
    source: "Product: Stress Test",
    text: `Stress Test analyzes SaaS architecture risks—auth, billing, scaling seams—and produces scores and recommendations. It complements templates: templates install code; stress test evaluates whether the overall system shape is production-safe.`,
  },
  {
    id: "tools-registry",
    title: "Registry",
    source: "Product: Registry",
    text: `The Registry is a deeper catalog of integration patterns, mistakes, and reference notes for modern SaaS APIs—useful when designing how your app talks to providers.`,
  },
  {
    id: "pricing-free",
    title: "Pricing: Free tier",
    source: "Pricing",
    text: `Free plan includes a limited number of integrations (for example 5 integrations), access to free-tier templates, registry access, stress test tooling, and CLI access. Exact limits may change—check the pricing page in the app for the current numbers.`,
  },
  {
    id: "pricing-pro",
    title: "Pricing: Pro tier",
    source: "Pricing",
    text: `Pro plan is billed monthly (commonly around $9/month) or as a lifetime option (commonly around $29 one-time in Fusewire marketing). Pro typically unlocks unlimited integrations and pro-tier templates. Confirm current figures on the in-app pricing section before purchasing.`,
  },
  {
    id: "philosophy-code-ownership",
    title: "Code ownership philosophy",
    source: "Product philosophy",
    text: `IntegrateAPI emphasizes owning integration code: generated files live in your repository, readable and editable. There is no hidden middleware that proxies all API calls in production unless you choose to add one.`,
  },
  {
    id: "faq-env-vars",
    title: "Environment variables after install",
    source: "FAQ",
    text: `After adding an integration, you usually need provider API keys in .env.local or your host's env settings (for example STRIPE_SECRET_KEY, CLERK_SECRET_KEY). The installed README and npx integrateapi doctor help verify which keys are missing.`,
  },
  {
    id: "faq-nextjs",
    title: "Framework support",
    source: "FAQ",
    text: `Documentation and templates target modern Next.js App Router patterns. Other frameworks may work with manual adaptation, but official examples assume a Next.js-style project layout.`,
  },
  {
    id: "support-security-keys",
    title: "Secrets and security",
    source: "Support policy",
    text: `Never paste live API keys into chat, email, or public forums. Rotate keys if they are exposed. IntegrateAPI support can explain which variables are needed but will not ask you to share secret values.`,
  },
];
