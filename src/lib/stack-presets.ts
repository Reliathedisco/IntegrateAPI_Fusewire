export interface StackPreset {
  id: string
  name: string
  slug: string
  description: string
  integrationIds: string[]
}

export const stackPresets: StackPreset[] = [
  {
    id: "saas-starter",
    name: "SaaS Starter",
    slug: "saas-starter",
    description: "Auth, payments, analytics, email, and error tracking for a typical SaaS.",
    integrationIds: ["clerk", "stripe", "posthog", "resend", "sentry"],
  },
  {
    id: "ai-saas",
    name: "AI SaaS",
    slug: "ai-saas",
    description: "Auth, AI, payments, analytics, and email for an AI product.",
    integrationIds: ["clerk", "openai", "stripe", "posthog", "resend"],
  },
  {
    id: "marketplace",
    name: "Marketplace",
    slug: "marketplace",
    description: "Auth, payments, database, and analytics for a marketplace.",
    integrationIds: ["clerk", "stripe", "supabase-basic", "posthog", "resend"],
  },
  {
    id: "internal-tool",
    name: "Internal Tool",
    slug: "internal-tool",
    description: "Auth, database, and project management for internal tools.",
    integrationIds: ["clerk", "supabase-basic", "linear", "posthog"],
  },
]
