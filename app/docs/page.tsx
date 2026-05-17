import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import CodeBlock from "@/components/CodeBlock";

const commands: Array<{ name: string; description: string; example: string }> = [
  {
    name: "login",
    description: "Authenticate with IntegrateAPI to link your account.",
    example: "npx integrateapi login",
  },
  {
    name: "list",
    description: "List all available integrations.",
    example: "npx integrateapi list",
  },
  {
    name: "add",
    description: "Add an integration to your project. Run from your Next.js app root.",
    example: "npx integrateapi add stripe",
  },
  {
    name: "upgrade",
    description: "Upgrade an existing integration to the latest template.",
    example: "npx integrateapi upgrade stripe",
  },
  {
    name: "account",
    description: "Show your account info and plan.",
    example: "npx integrateapi account",
  },
  {
    name: "scan",
    description:
      "Scan your project for existing integrations and suggest updates.",
    example: "npx integrateapi scan",
  },
  {
    name: "stack",
    description: "Install a preset stack (e.g. saas-starter, ai-saas).",
    example: "npx integrateapi stack saas-starter",
  },
  {
    name: "doctor",
    description: "Check your setup: env vars, dependencies, and config.",
    example: "npx integrateapi doctor",
  },
];

export default function DocsPage() {
  return (
    <>
      <section className="border-b border-line py-20 md:py-24">
        <Container size="md">
          <Eyebrow>CLI reference</Eyebrow>
          <h1 className="mt-3 font-sans text-4xl/[1.05] font-semibold tracking-tight text-ink md:text-5xl/[1.05]">
            Every command, one page.
          </h1>
          <p className="mt-5 max-w-md text-base/7 text-mute">
            Run any of these from your Next.js project root. The CLI auto-detects
            your stack and writes idiomatic code into the right folders.
          </p>
        </Container>
      </section>

      <section className="py-20 md:py-24">
        <Container size="md">
          <div className="grid gap-12 md:grid-cols-[200px_1fr] md:gap-16">
            <nav aria-label="Commands" className="md:sticky md:top-20 md:self-start">
              <Eyebrow>Commands</Eyebrow>
              <ul className="mt-3 flex flex-col gap-1">
                {commands.map((c) => (
                  <li key={c.name}>
                    <a
                      href={`#${c.name}`}
                      className="block rounded-md px-2 py-1.5 font-mono text-[13px] text-mute transition hover:bg-paper-soft hover:text-ink"
                    >
                      {c.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex flex-col">
              {commands.map((c, i) => (
                <section
                  key={c.name}
                  id={c.name}
                  className={
                    i === 0
                      ? "scroll-mt-24 pb-10"
                      : "scroll-mt-24 border-t border-line py-10"
                  }
                >
                  <h2 className="font-mono text-base font-semibold text-ink">
                    integrateapi {c.name}
                  </h2>
                  <p className="mt-2 text-sm/6 text-mute">{c.description}</p>
                  <div className="mt-4">
                    <CodeBlock code={c.example} variant="inline" />
                  </div>
                </section>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
