import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { LinkButton } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import CodeBlock from "@/components/CodeBlock";

const steps: Array<{
  num: string;
  title: string;
  body: string;
  code?: string;
}> = [
  {
    num: "01",
    title: "Sign up & authenticate",
    body: "Create an account, then link your CLI so installs are tied to your plan.",
    code: "npx integrateapi login",
  },
  {
    num: "02",
    title: "Browse integrations",
    body: "See every available integration — or search by name. All templates are listed with tier and category.",
    code: "npx integrateapi list",
  },
  {
    num: "03",
    title: "Install an integration",
    body: "Run one command from your project root. The CLI drops typed, production-ready code into your /lib folder — no SDK dependency.",
    code: "npx integrateapi add stripe",
  },
  {
    num: "04",
    title: "Add your env vars",
    body: "Each integration tells you exactly which environment variables are required. Add them to your .env.local and you're live.",
    code: "# check .env.example after install",
  },
  {
    num: "05",
    title: "Ship it",
    body: "The code is yours. Read it, edit it, extend it. Deploy when ready — no runtime dependency, no lock-in.",
    code: "npx integrateapi doctor",
  },
];

export default function GetStartedPage() {
  return (
    <>
      <section className="border-b border-line py-20 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Pill>Quick start</Pill>
            <h1 className="mt-5 font-sans text-4xl/[1.05] font-semibold tracking-tight text-ink md:text-5xl/[1.05]">
              Zero to a working integration in under a minute.
            </h1>
            <p className="mx-auto mt-5 max-w-md text-base/7 text-mute">
              Five steps, one CLI, full code ownership. Works on any Next.js or
              Node project.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-24">
        <Container size="md">
          <ol className="flex flex-col gap-4">
            {steps.map((step) => (
              <li
                key={step.num}
                className="rounded-2xl border border-line bg-card p-7 transition hover:border-line-strong"
              >
                <div className="flex items-start gap-5 md:gap-7">
                  <span className="font-mono text-xs font-medium tracking-[0.18em] text-faint">
                    {step.num}
                  </span>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold tracking-tight text-ink">
                      {step.title}
                    </h2>
                    <p className="mt-2 text-sm/6 text-mute">{step.body}</p>
                    {step.code && (
                      <div className="mt-4">
                        <CodeBlock code={step.code} variant="inline" />
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="border-t border-line bg-paper-soft py-20 md:py-24">
        <Container size="md">
          <SectionHeading
            align="center"
            eyebrow="What's next"
            title="Pick where you go from here."
          />
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <LinkButton href="/templates" variant="accent">
              Browse templates
            </LinkButton>
            <LinkButton href="/stress-test" variant="secondary">
              Run stress test
            </LinkButton>
            <LinkButton href="/docs" variant="secondary">
              CLI docs
            </LinkButton>
            <LinkButton href="/registry" variant="ghost">
              Explore registry
            </LinkButton>
          </div>
        </Container>
      </section>
    </>
  );
}
