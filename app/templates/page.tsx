import Link from "next/link";
import { getIntegrations } from "@/lib/data";
import IntegrationCard from "@/components/IntegrationCard";

export default function TemplatesPage() {
  const featured = getIntegrations()
    .filter((i) => !i.comingSoon)
    .slice(0, 8);

  return (
    <div className="container">
      <section className="hero">
        <h1>
          Ship API integrations in <span>minutes</span> — not days.
        </h1>
        <p>
          Install production-ready integrations for your Next.js app with one
          CLI command.
        </p>
        <div className="heroButtons">
          <Link href="/integrations" className="primary">
            Get Started
          </Link>
          <Link href="/integrations">View Integrations</Link>
        </div>
      </section>

      <section>
        <h2>Integrations</h2>
        <div className="grid">
          {featured.map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
        </div>
        <p className="sectionFooter">
          <Link href="/integrations">View all integrations →</Link>
        </p>
      </section>
    </div>
  );
}
