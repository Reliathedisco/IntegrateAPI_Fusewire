import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { LinkButton } from "@/components/ui/Button";
import IntegrationCard from "@/components/IntegrationCard";
import { getIntegrations } from "@/lib/data";

export default function TemplatesPage() {
  const featured = getIntegrations()
    .filter((i) => !i.comingSoon)
    .slice(0, 9);

  return (
    <>
      <section className="border-b border-line py-20 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Featured templates</Eyebrow>
            <h1 className="mt-3 font-sans text-4xl/[1.05] font-semibold tracking-tight text-ink md:text-5xl/[1.05]">
              Ship API integrations in minutes — not days.
            </h1>
            <p className="mx-auto mt-5 max-w-md text-base/7 text-mute">
              Install production-ready integrations into your Next.js app with one
              CLI command. Typed, tested, framework-aware.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <LinkButton href="/integrations" variant="accent">
                Browse all integrations
              </LinkButton>
              <LinkButton href="/get-started" variant="secondary">
                Get started
              </LinkButton>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-24">
        <Container>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
          <p className="mt-12 text-center text-sm text-mute">
            <Link
              href="/integrations"
              className="font-medium text-accent transition-colors hover:text-accent-hover"
            >
              View all integrations →
            </Link>
          </p>
        </Container>
      </section>
    </>
  );
}
