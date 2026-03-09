import type { Integration } from "./types"

export const CATEGORIES = [
  "Payments",
  "Auth",
  "AI",
  "Analytics",
  "Email",
  "Database",
  "Storage",
  "Realtime",
  "Communication",
  "Productivity",
  "Monitoring",
] as const

const makeIntegration = (
  id: string,
  name: string,
  category: string,
  tier: "free" | "pro",
  shortDesc: string,
  description: string,
  features: string[],
  envVars: { name: string; description?: string }[],
  exampleCode?: string,
  comingSoon?: boolean
): Integration => ({
  id,
  name,
  slug: id,
  category,
  tier,
  description,
  shortDescription: shortDesc,
  installCommand: `npx integrateapi add ${id}`,
  features,
  envVars,
  exampleCode,
  comingSoon,
})

export const integrations: Integration[] = [
  makeIntegration(
    "stripe",
    "Stripe",
    "Payments",
    "free",
    "Accept payments and manage subscriptions.",
    "Add Stripe to your Next.js app for payments, subscriptions, and invoicing. Includes typed client and webhook helpers.",
    ["Payments API", "Subscriptions", "Webhooks", "Customer portal"],
    [
      { name: "STRIPE_SECRET_KEY", description: "Secret key from Stripe dashboard" },
      { name: "STRIPE_WEBHOOK_SECRET", description: "Webhook signing secret" },
    ],
    'import { stripeClient } from "@/lib/integrations/stripe"\n\nconst session = await stripeClient.checkout.sessions.create({...})'
  ),
  makeIntegration(
    "resend",
    "Resend",
    "Email",
    "free",
    "Send transactional email from your app.",
    "Resend integration for sending emails. Typed client and React email support.",
    ["Transactional email", "React Email", "Domains"],
    [{ name: "RESEND_API_KEY", description: "API key from Resend" }],
    'import { resend } from "@/lib/integrations/resend"\nawait resend.emails.send({ from: "...", to: "...", subject: "...", react: <Template /> })'
  ),
  makeIntegration(
    "supabase-basic",
    "Supabase",
    "Database",
    "free",
    "Postgres database, auth, and realtime.",
    "Supabase client for database, auth, storage, and realtime. Preconfigured for Next.js.",
    ["Postgres", "Auth", "Realtime", "Storage"],
    [
      { name: "NEXT_PUBLIC_SUPABASE_URL", description: "Project URL" },
      { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", description: "Anon public key" },
    ],
    'import { createClient } from "@/lib/integrations/supabase"\nconst supabase = createClient()'
  ),
  makeIntegration(
    "vercel",
    "Vercel",
    "Storage",
    "free",
    "Deploy and integrate with Vercel platform.",
    "Vercel SDK for deployments, env, and project APIs.",
    ["Deployments", "Environment", "Analytics"],
    [
      { name: "VERCEL_TOKEN", description: "Vercel API token" },
    ]
  ),
  makeIntegration(
    "github",
    "GitHub",
    "Productivity",
    "free",
    "GitHub API and OAuth integration.",
    "GitHub API client and OAuth for repos, issues, and actions.",
    ["REST API", "OAuth", "Webhooks"],
    [
      { name: "GITHUB_CLIENT_ID", description: "OAuth app client ID" },
      { name: "GITHUB_CLIENT_SECRET", description: "OAuth app secret" },
    ]
  ),
  makeIntegration(
    "openai",
    "OpenAI",
    "AI",
    "free",
    "Build AI-powered applications.",
    "OpenAI SDK with typed chat, embeddings, and streaming.",
    ["Chat", "Embeddings", "Streaming", "Assistants"],
    [{ name: "OPENAI_API_KEY", description: "OpenAI API key" }],
    'import { openai } from "@/lib/integrations/openai"\nconst stream = await openai.chat.completions.create({ model: "gpt-4", messages: [...] })'
  ),
  makeIntegration(
    "anthropic",
    "Anthropic",
    "AI",
    "free",
    "Claude API for advanced AI features.",
    "Anthropic Claude client for chat and long-context use cases.",
    ["Chat", "Long context", "Streaming"],
    [{ name: "ANTHROPIC_API_KEY", description: "Anthropic API key" }]
  ),
  makeIntegration(
    "clerk",
    "Clerk",
    "Auth",
    "free",
    "Complete authentication solution.",
    "Clerk for auth: sign-in, sign-up, orgs, and webhooks.",
    ["Auth", "Organizations", "Webhooks", "SSO"],
    [
      { name: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", description: "Publishable key" },
      { name: "CLERK_SECRET_KEY", description: "Secret key" },
    ],
    'import { auth } from "@clerk/nextjs/server"\nconst { userId } = await auth()'
  ),
  makeIntegration(
    "liveblocks",
    "Liveblocks",
    "Realtime",
    "free",
    "Real-time collaboration (cursors, presence).",
    "Liveblocks for realtime collaboration: presence, cursors, and Yjs.",
    ["Presence", "Cursors", "Storage"],
    [
      { name: "NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY", description: "Public key" },
      { name: "LIVEBLOCKS_SECRET_KEY", description: "Secret key" },
    ]
  ),
  makeIntegration(
    "posthog",
    "PostHog",
    "Analytics",
    "free",
    "Product analytics and feature flags.",
    "PostHog for product analytics, feature flags, and session replay.",
    ["Analytics", "Feature flags", "Session replay"],
    [
      { name: "NEXT_PUBLIC_POSTHOG_KEY", description: "Project API key" },
      { name: "NEXT_PUBLIC_POSTHOG_HOST", description: "PostHog host (e.g. app.posthog.com)" },
    ]
  ),
  makeIntegration(
    "uploadthing",
    "UploadThing",
    "Storage",
    "free",
    "File uploads with a simple API.",
    "UploadThing for file uploads: images, docs, with route handlers.",
    ["Upload", "Image handling", "App router"],
    [
      { name: "UPLOADTHING_TOKEN", description: "UploadThing token" },
    ]
  ),
  makeIntegration(
    "sendgrid",
    "SendGrid",
    "Email",
    "free",
    "Email delivery and templates.",
    "SendGrid for transactional and marketing email.",
    ["Transactional", "Templates", "Tracking"],
    [{ name: "SENDGRID_API_KEY", description: "SendGrid API key" }]
  ),
  makeIntegration(
    "planetscale",
    "PlanetScale",
    "Database",
    "free",
    "Serverless MySQL with branching.",
    "PlanetScale serverless MySQL client with Drizzle or Prisma.",
    ["MySQL", "Branching", "Serverless"],
    [
      { name: "DATABASE_URL", description: "PlanetScale connection string" },
    ]
  ),
  makeIntegration(
    "ably",
    "Ably",
    "Realtime",
    "free",
    "Real-time messaging at scale.",
    "Ably for realtime pub/sub and presence.",
    ["Pub/Sub", "Presence", "Channels"],
    [
      { name: "ABLY_API_KEY", description: "Ably API key" },
    ]
  ),
  makeIntegration(
    "lemon-squeezy",
    "Lemon Squeezy",
    "Payments",
    "pro",
    "Sell digital products and subscriptions.",
    "Lemon Squeezy for digital products, subscriptions, and payouts.",
    ["Checkout", "Subscriptions", "Webhooks"],
    [
      { name: "LEMON_SQUEEZY_API_KEY", description: "API key" },
      { name: "LEMON_SQUEEZY_WEBHOOK_SECRET", description: "Webhook secret" },
    ]
  ),
  makeIntegration(
    "twilio",
    "Twilio",
    "Communication",
    "free",
    "SMS, voice, and WhatsApp.",
    "Twilio for SMS, voice, and WhatsApp messaging.",
    ["SMS", "Voice", "WhatsApp"],
    [
      { name: "TWILIO_ACCOUNT_SID", description: "Account SID" },
      { name: "TWILIO_AUTH_TOKEN", description: "Auth token" },
    ]
  ),
  makeIntegration(
    "slack",
    "Slack",
    "Communication",
    "free",
    "Slack API and bot integration.",
    "Slack client for posting messages, apps, and events.",
    ["Messages", "Apps", "Events API"],
    [
      { name: "SLACK_BOT_TOKEN", description: "Bot token" },
      { name: "SLACK_SIGNING_SECRET", description: "Signing secret" },
    ]
  ),
  makeIntegration(
    "linear",
    "Linear",
    "Productivity",
    "free",
    "Issue tracking and project management.",
    "Linear API for issues, cycles, and projects.",
    ["Issues", "Cycles", "Projects"],
    [{ name: "LINEAR_API_KEY", description: "Linear API key" }]
  ),
  makeIntegration(
    "notion",
    "Notion",
    "Productivity",
    "free",
    "Notion API and OAuth.",
    "Notion client for pages, databases, and blocks.",
    ["Pages", "Databases", "OAuth"],
    [
      { name: "NOTION_API_KEY", description: "Internal integration token" },
      { name: "NOTION_OAUTH_CLIENT_ID", description: "OAuth client ID (optional)" },
    ]
  ),
  makeIntegration(
    "intercom",
    "Intercom",
    "Communication",
    "pro",
    "Customer messaging and support.",
    "Intercom for chat, bots, and support workflows.",
    ["Messenger", "Bots", "Articles"],
    [
      { name: "INTERCOM_ACCESS_TOKEN", description: "Access token" },
      { name: "NEXT_PUBLIC_INTERCOM_APP_ID", description: "App ID" },
    ]
  ),
  makeIntegration(
    "segment",
    "Segment",
    "Analytics",
    "free",
    "Customer data platform and pipelines.",
    "Segment for event tracking and data pipelines.",
    ["Track", "Identify", "Destinations"],
    [
      { name: "SEGMENT_WRITE_KEY", description: "Write key" },
    ]
  ),
  // Future / coming soon
  makeIntegration("sentry", "Sentry", "Monitoring", "free", "Error tracking and performance.", "Sentry for errors and performance.", [], [], undefined, true),
  makeIntegration("upstash-redis", "Upstash Redis", "Database", "free", "Serverless Redis.", "Upstash Redis serverless client.", [], [], undefined, true),
  makeIntegration("algolia", "Algolia", "Storage", "free", "Search and discovery.", "Algolia search client.", [], [], undefined, true),
  makeIntegration("cloudinary", "Cloudinary", "Storage", "free", "Image and video management.", "Cloudinary for media.", [], [], undefined, true),
  makeIntegration("authjs", "Auth.js", "Auth", "free", "Next.js auth.", "Auth.js (NextAuth) integration.", [], [], undefined, true),
  makeIntegration("auth0", "Auth0", "Auth", "free", "Enterprise auth.", "Auth0 for Next.js.", [], [], undefined, true),
  makeIntegration("better-stack", "Better Stack", "Monitoring", "free", "Logging and uptime.", "Better Stack (Logtail) for logs.", [], [], undefined, true),
  makeIntegration("trigger-dev", "Trigger.dev", "Productivity", "free", "Background jobs.", "Trigger.dev for background jobs.", [], [], undefined, true),
  makeIntegration("qstash", "QStash", "Communication", "free", "Serverless messaging.", "Upstash QStash for messaging.", [], [], undefined, true),
  makeIntegration("plausible", "Plausible", "Analytics", "free", "Privacy-friendly analytics.", "Plausible analytics.", [], [], undefined, true),
  makeIntegration("mixpanel", "Mixpanel", "Analytics", "free", "Product analytics.", "Mixpanel for events.", [], [], undefined, true),
  makeIntegration("polar", "Polar", "Payments", "free", "Monetization for developers.", "Polar for sponsorships and shop.", [], [], undefined, true),
  makeIntegration("railway", "Railway", "Storage", "free", "Deploy and databases.", "Railway client.", [], [], undefined, true),
  makeIntegration("flyio", "Fly.io", "Storage", "free", "Deploy globally.", "Fly.io apps and machines.", [], [], undefined, true),
  makeIntegration("replicate", "Replicate", "AI", "free", "Run ML models.", "Replicate for running models.", [], [], undefined, true),
  makeIntegration("firebase", "Firebase", "Database", "free", "Google backend services.", "Firebase for Next.js.", [], [], undefined, true),
]

export function getIntegrations(): Integration[] {
  return integrations
}

export function getIntegrationBySlug(slug: string): Integration | undefined {
  return integrations.find((i) => i.slug === slug || i.id === slug)
}

export function getIntegrationsByCategory(category: string): Integration[] {
  return integrations.filter((i) => i.category === category)
}
