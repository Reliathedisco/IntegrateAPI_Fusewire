export type Tier = "free" | "pro"

export interface Integration {
  id: string
  name: string
  slug: string
  category: string
  tier: Tier
  description: string
  shortDescription: string
  installCommand: string
  cliCommand?: string
  features: string[]
  envVars: { name: string; description?: string }[]
  exampleCode?: string
  comingSoon?: boolean
}
