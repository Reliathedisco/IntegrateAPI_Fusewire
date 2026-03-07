import CodeBlock from "../CodeBlock"

const docs = [
  { command: "login", description: "Authenticate with Templates to link your account.", example: "npx integrateapi login" },
  { command: "list", description: "List all available integrations.", example: "npx integrateapi list" },
  { command: "add", description: "Add an integration to your project. Run from your Next.js app root.", example: "npx integrateapi add stripe" },
  { command: "upgrade", description: "Upgrade an existing integration to the latest template.", example: "npx integrateapi upgrade stripe" },
  { command: "account", description: "Show your account info and plan.", example: "npx integrateapi account" },
  { command: "scan", description: "Scan your project for existing integrations and suggest updates.", example: "npx integrateapi scan" },
  { command: "stack", description: "Install a preset stack (e.g. saas-starter, ai-saas).", example: "npx integrateapi stack saas-starter" },
  { command: "doctor", description: "Check your setup: env vars, dependencies, and config.", example: "npx integrateapi doctor" },
]

export default function DocsPage() {
  return (
    <div className="container">
      <h1>CLI Docs</h1>
      <p className="pageLead">
        Reference for the Templates CLI. Run commands from your Next.js project root.
      </p>
      <div className="docsList">
        {docs.map((d) => (
          <section key={d.command} className="docSection">
            <h2><code>npx integrateapi {d.command}</code></h2>
            <p>{d.description}</p>
            <CodeBlock code={d.example} />
          </section>
        ))}
      </div>
    </div>
  )
}
