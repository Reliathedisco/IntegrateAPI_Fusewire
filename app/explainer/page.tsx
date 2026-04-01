export default function ExplainerPage() {
  return (
    <div className="container">
      <div className="explainer-hero">
        <div>
          <p className="section-label">One page explainer</p>
          <h1>IntegrateAPI installs real SaaS integrations in minutes.</h1>
          <p>
            Think of it as a CLI-powered integration studio. You run a single
            command, and it drops production-ready TypeScript into your project
            with env vars, handlers, and usage examples included.
          </p>
          <div className="explainer-callout">
            <span>$</span> npx integrateapi add stripe
          </div>
        </div>
        <div className="explainer-panel">
          <h3>What you get instantly</h3>
          <ul>
            <li>Integration code written in real-world patterns</li>
            <li>Typed clients, webhook handlers, and error handling</li>
            <li>Environment variables prewired</li>
            <li>Examples you can ship from day one</li>
          </ul>
        </div>
      </div>

      <section className="explainer-section">
        <p className="section-label">Who it is for</p>
        <div className="explainer-grid">
          <div className="explainer-card">
            <h4>Founders</h4>
            <p>
              Skip weeks of integration work and ship your product faster with
              ready-to-use SaaS plumbing.
            </p>
          </div>
          <div className="explainer-card">
            <h4>Engineers</h4>
            <p>
              Start from production-grade patterns instead of copy-pasting docs
              and debugging edge cases.
            </p>
          </div>
          <div className="explainer-card">
            <h4>Agencies</h4>
            <p>
              Deliver integrations consistently across clients with predictable
              code you can customize.
            </p>
          </div>
        </div>
      </section>

      <section className="explainer-section">
        <p className="section-label">How it works</p>
        <div className="explainer-steps">
          <div className="explainer-step">
            <h4>1 / Choose an integration</h4>
            <p>
              Pick a SaaS integration from the CLI or registry. The CLI fetches
              a complete template for that provider.
            </p>
          </div>
          <div className="explainer-step">
            <h4>2 / Install into your project</h4>
            <p>
              The template is added to your codebase with env vars and helpers
              wired. You own the code immediately.
            </p>
          </div>
          <div className="explainer-step">
            <h4>3 / Ship and iterate</h4>
            <p>
              Because the code is local, you can customize it, extend it, and
              ship with confidence.
            </p>
          </div>
        </div>
      </section>

      <section className="explainer-section">
        <p className="section-label">Product scope</p>
        <div className="explainer-grid">
          <div className="explainer-card">
            <h4>CLI</h4>
            <p>
              The CLI installs integrations, manages auth, and checks your
              account plan. It is the fastest entry point.
            </p>
          </div>
          <div className="explainer-card">
            <h4>Templates</h4>
            <p>
              Each integration ships with production-ready TypeScript,
              handlers, and config.
            </p>
          </div>
          <div className="explainer-card">
            <h4>Registry</h4>
            <p>
              Browse integrations and patterns, then install them instantly with
              one command.
            </p>
          </div>
          <div className="explainer-card">
            <h4>Stress Test</h4>
            <p>
              Analyze your stack and discover gaps in auth, billing, and
              reliability before they ship.
            </p>
          </div>
        </div>
      </section>

      <section className="explainer-section">
        <p className="section-label">How you get started</p>
        <div className="explainer-callout">
          <span>$</span> npx integrateapi init
        </div>
      </section>
    </div>
  );
}
