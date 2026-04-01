import CodeBlock from "@/components/CodeBlock";

const docs = [
  {
    command: "init",
    description: "Quick start for new projects.",
    example: "npx integrateapi init",
  },
  {
    command: "login",
    description:
      "Authenticate with IntegrateAPI to link your account. You can pass a CLI token manually if needed.",
    example: "npx integrateapi login --token YOUR_TOKEN",
  },
  {
    command: "list",
    description: "List all available integrations.",
    example: "npx integrateapi list",
  },
  {
    command: "add",
    description:
      "Add an integration to your project. Run from your Next.js app root.",
    example: "npx integrateapi add stripe",
  },
  {
    command: "upgrade",
    description: "Upgrade an existing integration to the latest template.",
    example: "npx integrateapi upgrade stripe",
  },
  {
    command: "account",
    description: "Show your account info and plan.",
    example: "npx integrateapi account",
  },
  {
    command: "scan",
    description:
      "Scan your project for existing integrations and suggest updates.",
    example: "npx integrateapi scan",
  },
  {
    command: "stack",
    description: "Install a preset stack (e.g. saas-starter, ai-saas).",
    example: "npx integrateapi stack saas-starter",
  },
  {
    command: "doctor",
    description: "Check your setup: env vars, dependencies, and config.",
    example: "npx integrateapi doctor",
  },
];

export default function DocsPage() {
  return (
    <div className="container">
      <h1>CLI Docs</h1>
      <p className="pageLead">
        Reference for the IntegrateAPI CLI. Run commands from your Next.js
        project root.
      </p>
      <section className="docSection">
        <h2>Get started (recommended)</h2>
        <CodeBlock code="npx integrateapi init" />
        <p>
          Installs your first integration and shows the next steps.
        </p>
      </section>
      <section className="docSection">
        <h2>Authenticate with token (recommended)</h2>
        <CodeBlock code="npx integrateapi login --token YOUR_TOKEN" />
        <p>
          Get your token from integrateapi.io/account → CLI Authentication
          section.
        </p>
      </section>
      <div className="docsList">
        {docs.map((d) => (
          <section key={d.command} className="docSection">
            <h2>
              <code>npx integrateapi {d.command}</code>
            </h2>
            <p>{d.description}</p>
            <CodeBlock code={d.example} />
          </section>
        ))}
      </div>
    </div>
  );
}
