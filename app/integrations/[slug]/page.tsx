import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
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

  const user = await currentUser();
  const isPro = user?.publicMetadata?.isPro === true;

  if (integration.tier === "pro" && !isPro) {
    return (
      <div className="container">
        <Link href="/integrations" className="backLink">
          ← Back to Integrations
        </Link>
        <div className="detailHeader">
          <h1>{integration.name}</h1>
          <span className="tier tier-pro">pro</span>
        </div>
        <p className="detailDescription">{integration.description}</p>
        <div
          style={{
            marginTop: "32px",
            padding: "24px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            maxWidth: "420px",
          }}
        >
          <p style={{ marginBottom: "16px", color: "var(--text-mid)" }}>
            This integration requires a Pro account.
          </p>
          <Link href="/account" className="primary" style={{ display: "inline-block" }}>
            Upgrade to Pro — $29 →
          </Link>
        </div>
      </div>
    );
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
