import { Link } from "react-router-dom"
import { getIntegrations } from "@/lib/data"
import IntegrationCard from "../IntegrationCard"

export default function HomePage() {
  const featured = getIntegrations().filter((i) => !i.comingSoon).slice(0, 8)

  return (
    <div className="container">
      <section className="hero">
        <h1>
          Ship API integrations in <span>minutes</span> — not days.
        </h1>
        <p>
          Install production-ready integrations for your Next.js app with one CLI command.
        </p>
        <div className="heroButtons">
          <Link to="/integrations" className="primary">
            Get Started
          </Link>
          <Link to="/integrations">View Integrations</Link>
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
          <Link to="/integrations">View all integrations →</Link>
        </p>
      </section>
    </div>
  )
}
