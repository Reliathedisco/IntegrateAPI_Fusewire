import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";

const steps = [
  {
    num: "01",
    title: "Sign up & authenticate",
    description:
      "Create an account, then link your CLI so installs are tied to your plan.",
    code: "npx integrateapi login",
  },
  {
    num: "02",
    title: "Browse integrations",
    description:
      "See every available integration — or search by name. All templates are listed with tier and category.",
    code: "npx integrateapi list",
  },
  {
    num: "03",
    title: "Install an integration",
    description:
      "Run one command from your Next.js project root. The CLI drops typed, production-ready code into your /lib folder — no SDK dependency.",
    code: "npx integrateapi add stripe",
  },
  {
    num: "04",
    title: "Add your env vars",
    description:
      "Each integration tells you exactly which environment variables are required. Add them to your .env.local and you're live.",
    code: "# check .env.example after install",
  },
  {
    num: "05",
    title: "Ship it",
    description:
      "The code is yours. Read it, edit it, extend it. Deploy when ready — no runtime dependency, no lock-in.",
    code: "npx integrateapi doctor",
  },
];

export default function GetStartedPage() {
  return (
    <div className="get-started-page">
      <section className="get-started-hero">
        <div className="get-started-hero-grid"></div>
        <div className="get-started-hero-content">
          <div className="stress-badge">Quick start</div>
          <h1>Get Started</h1>
          <p className="get-started-sub">
            Go from zero to a working integration in under a minute. Five steps,
            one CLI, full code ownership.
          </p>
        </div>
      </section>

      <section className="get-started-steps">
        {steps.map((step) => (
          <div key={step.num} className="get-started-step">
            <div className="get-started-step-num">{step.num}</div>
            <div className="get-started-step-body">
              <h2>{step.title}</h2>
              <p>{step.description}</p>
              <CodeBlock code={step.code} />
            </div>
          </div>
        ))}
      </section>

      <section className="get-started-next">
        <h2>What&apos;s next?</h2>
        <div className="get-started-links">
          <Link href="/templates" className="btn-primary">
            Browse Templates
          </Link>
          <Link href="/stress-test" className="btn-ghost">
            Run Stress Test
          </Link>
          <Link href="/docs" className="btn-ghost">
            CLI Docs
          </Link>
          <Link href="/registry" className="btn-ghost">
            Explore Registry
          </Link>
        </div>
      </section>
    </div>
  );
}
