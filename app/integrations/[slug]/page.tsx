import Link from "next/link";
import { notFound } from "next/navigation";
import { getIntegrationBySlug } from "@/lib/data";
import CodeBlock from "@/components/CodeBlock";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export default async function IntegrationDetailPage({ params }: Props) {
  const { slug } = await params;
  const integration = getIntegrationBySlug(slug);

  if (!integration) {
    notFound();
  }

  return (
    <div className="container">
      <Link href="/integrations" className="backLink">
        ← Back to Integrations
      </Link>

      <div className="detailHeader">
        <h1>{integration.name}</h1>
        <span className={`tier tier-${integration.tier}`}>
          {integration.tier}
        </span>
        {integration.comingSoon && (
          <span className="badgeComingSoon">Coming soon</span>
        )}
      </div>

      <p className="detailDescription">{integration.description}</p>

      <section className="detailSection">
        <h2>Install</h2>
        <CodeBlock code={integration.installCommand} />
      </section>

      {integration.features.length > 0 && (
        <section className="detailSection">
          <h2>Features</h2>
          <ul>
            {integration.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
      )}

      {integration.envVars.length > 0 && (
        <section className="detailSection">
          <h2>Environment variables</h2>
          <table className="envTable">
            <thead>
              <tr>
                <th>Variable</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {integration.envVars.map((ev) => (
                <tr key={ev.name}>
                  <td>
                    <code>{ev.name}</code>
                  </td>
                  <td>{ev.description ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {integration.exampleCode && (
        <section className="detailSection">
          <h2>Example</h2>
          <CodeBlock code={integration.exampleCode} />
        </section>
      )}
    </div>
  );
}
