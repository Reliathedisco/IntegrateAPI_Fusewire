"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";

const terminalLines = [
  { text: "$ npx integrateapi login", class: "", delay: 0 },
  { text: "", class: "t-blank", delay: 600 },
  { text: "✓ Authentication successful", class: "t-check", delay: 900 },
  { text: "", class: "t-blank", delay: 1100 },
  { text: "$ npx integrateapi list", class: "", delay: 1400 },
  { text: "", class: "t-blank", delay: 1900 },
  { text: "  Stripe", class: "t-item", delay: 2100 },
  { text: "  Clerk", class: "t-item", delay: 2250 },
  { text: "  Supabase", class: "t-item", delay: 2400 },
  { text: "  OpenAI", class: "t-item", delay: 2550 },
  { text: "  PostHog", class: "t-item", delay: 2700 },
  { text: "  Resend", class: "t-item", delay: 2850 },
  { text: "", class: "t-blank", delay: 3100 },
  { text: "$ npx integrateapi add stripe", class: "", delay: 3400 },
  { text: "", class: "t-blank", delay: 3900 },
  { text: "✓ Installing Stripe integration", class: "t-check", delay: 4100 },
  { text: "✓ Generating client", class: "t-check", delay: 4350 },
  { text: "✓ Adding webhook handler", class: "t-check", delay: 4600 },
  { text: "✓ Creating types", class: "t-check", delay: 4850 },
  { text: "", class: "t-blank", delay: 5100 },
  { text: "Integration ready.", class: "t-success", delay: 5300 },
];

function TerminalAnimation() {
  const [lines, setLines] = useState<Array<{ text: string; class: string }>>([]);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    const runTerminal = () => {
      setLines([]);
      timeoutRefs.current.forEach(clearTimeout);
      timeoutRefs.current = [];

      terminalLines.forEach((line, i) => {
        const timeout = setTimeout(() => {
          setLines((prev) => [...prev, { text: line.text, class: line.class }]);
        }, line.delay);
        timeoutRefs.current.push(timeout);
      });

      const loopTimeout = setTimeout(runTerminal, 8500);
      timeoutRefs.current.push(loopTimeout);
    };

    runTerminal();

    return () => {
      timeoutRefs.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="terminal">
      <div className="terminal-bar">
        <div className="t-dot red"></div>
        <div className="t-dot yellow"></div>
        <div className="t-dot green"></div>
        <span className="terminal-title">integrateapi — bash</span>
      </div>
      <div className="terminal-body">
        {lines.map((line, i) => {
          if (line.class === "t-blank") {
            return <span key={i} className="t-blank t-line visible"></span>;
          }
          if (line.class === "t-item" || line.class === "t-check" || line.class === "t-success") {
            return (
              <span key={i} className="t-line visible">
                <span className={line.class}>{line.text}</span>
              </span>
            );
          }
          if (line.text.startsWith("$ ")) {
            return (
              <span key={i} className="t-line visible">
                <span className="t-prompt">$ </span>
                <span className="t-cmd">{line.text.slice(2)}</span>
              </span>
            );
          }
          return (
            <span key={i} className="t-line visible">
              {line.text}
            </span>
          );
        })}
        <span className="cursor"></span>
      </div>
    </div>
  );
}

function CtaTerminal() {
  const [text, setText] = useState("");
  const fullText = "npx integrateapi add stripe";

  useEffect(() => {
    let index = 0;
    let direction = 1;
    let timeout: NodeJS.Timeout;

    const type = () => {
      if (direction === 1) {
        if (index <= fullText.length) {
          setText(fullText.slice(0, index));
          index++;
          timeout = setTimeout(type, 60 + Math.random() * 40);
        } else {
          timeout = setTimeout(() => {
            direction = -1;
            timeout = setTimeout(type, 3000);
          }, 0);
        }
      } else {
        index = 0;
        direction = 1;
        setText("");
        timeout = setTimeout(type, 600);
      }
    };

    timeout = setTimeout(type, 1200);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="cta-terminal">
      <span className="t-prompt">$ </span>
      <span className="t-cmd">{text}</span>
      <span className="cursor"></span>
    </div>
  );
}

const logos = [
  "Stripe", "Clerk", "Supabase", "OpenAI", "PostHog", "Resend",
  "Anthropic", "UploadThing", "Twilio", "Segment", "Notion", "Linear",
  "Slack", "PlanetScale", "Neon", "Trigger.dev", "Inngest", "Upstash",
];

const fileTreeItems = [
  "stripe.ts", "clerk.ts", "supabase.ts", "openai.ts", "resend.ts", "posthog.ts"
];

export default function LandingPage() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [newsletterMessage, setNewsletterMessage] = useState<string | null>(null);

  const submitNewsletter = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const email = newsletterEmail.trim();
    if (!email) return;

    setNewsletterStatus("loading");
    setNewsletterMessage(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await res.json().catch(() => ({}))) as
        | { ok?: boolean; status?: "subscribed" | "already_subscribed"; error?: string }
        | undefined;

      if (!res.ok || !data?.ok) {
        setNewsletterStatus("error");
        setNewsletterMessage(data?.error || "Couldn’t subscribe. Please try again.");
        return;
      }

      setNewsletterStatus("success");
      setNewsletterEmail("");
      setNewsletterMessage(
        data.status === "already_subscribed"
          ? "You’re already subscribed."
          : "Subscribed — check your inbox."
      );
    } catch {
      setNewsletterStatus("error");
      setNewsletterMessage("Couldn’t subscribe. Please try again.");
    }
  };

  return (
    <div className="landing">
      <div className="grid-bg"></div>

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-left reveal visible">
          <div className="hero-badge">CLI-based developer toolkit</div>
          <h1>
            Build SaaS integrations <em>faster</em>
          </h1>
          <p className="hero-sub">
            Install integrations, analyze your stack, and explore modern API architecture. Choose how you want to start.
          </p>
          <div className="hero-buttons">
            <Link href="/templates" className="btn-primary">Explore Templates</Link>
            <Link href="/stress-test" className="btn-ghost">Run Stress Test</Link>
            <Link href="/registry" className="btn-ghost">Browse Registry</Link>
          </div>
        </div>

        <div className="hero-right reveal visible">
          <TerminalAnimation />
        </div>
      </section>

      <div className="divider-wrap"><div className="divider"></div></div>

      {/* Choose Your Path */}
      <section className="paths">
        <div className="paths-header reveal visible">
          <div className="section-label">Tools</div>
          <h2 className="section-title">
            Everything you need to work<br />with modern SaaS APIs
          </h2>
          <p className="section-sub">Three ways to work with IntegrateAPI. Choose based on what you need to get done.</p>
        </div>

        <div className="cards-grid reveal visible">
          <Link href="/templates" className="path-card">
            <div className="card-glow"></div>
            <div className="card-num">01 / Templates</div>
            <div className="card-title">Install integrations instantly</div>
            <div className="card-desc">Production-ready code directly into your project.</div>
            <code className="card-cmd">$ npx integrateapi add stripe</code>
            <ul className="card-features">
              <li>Production-ready TypeScript</li>
              <li>No SDK lock-in</li>
              <li>CLI-based workflow</li>
              <li>Instant setup</li>
            </ul>
            <span className="card-link">Open Templates <span>→</span></span>
          </Link>

          <Link href="/stress-test" className="path-card">
            <div className="card-glow"></div>
            <div className="card-num">02 / Stress Test</div>
            <div className="card-title">Analyze your SaaS architecture</div>
            <div className="card-desc">Detect scaling risks before they become incidents.</div>
            <code className="card-cmd">$ integrateapi stress-test</code>
            <ul className="card-features">
              <li>Detect scaling risks</li>
              <li>Evaluate auth & billing</li>
              <li>Architecture scoring</li>
              <li>Actionable recommendations</li>
            </ul>
            <span className="card-link">Run Stress Test <span>→</span></span>
          </Link>

          <Link href="/registry" className="path-card">
            <div className="card-glow"></div>
            <div className="card-num">03 / Registry</div>
            <div className="card-title">Explore API integrations</div>
            <div className="card-desc">Learn how modern SaaS integrations actually work.</div>
            <code className="card-cmd">$ npx integrateapi registry</code>
            <ul className="card-features">
              <li>Architecture patterns</li>
              <li>Common mistakes</li>
              <li>Example implementations</li>
              <li>Deep API docs</li>
            </ul>
            <span className="card-link">Browse Registry <span>→</span></span>
          </Link>
        </div>
      </section>

      {/* Logos */}
      <section className="logos-section">
        <div className="logos-header reveal visible">
          <div className="section-label center">Integrations</div>
          <h2 className="section-title center">Works with modern SaaS APIs</h2>
        </div>

        <div className="logos-grid reveal visible">
          {logos.map((logo) => (
            <div key={logo} className="logo-cell">{logo}</div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="why-section">
        <div className="why-inner">
          <div className="reveal visible">
            <div className="section-label">Why IntegrateAPI</div>
            <h2 className="section-title">Stop wiring integrations manually.</h2>
            <p className="section-sub">
              Developers lose hours reading docs, copying snippets, and debugging APIs. IntegrateAPI installs production-ready integration code directly into your project.
            </p>
            <ul className="why-list">
              <li>TypeScript first — typed, safe, and modern by default</li>
              <li>No runtime SDK lock-in — you own the code</li>
              <li>Install in seconds — not hours</li>
              <li>Works with modern SaaS stacks out of the box</li>
              <li>Focused on real patterns, not toy examples</li>
            </ul>
          </div>

          <div className="reveal visible">
            <div className="stat-grid">
              <div className="stat-cell">
                <div className="stat-num">12+</div>
                <div className="stat-label">Integrations</div>
              </div>
              <div className="stat-cell">
                <div className="stat-num">&lt;30s</div>
                <div className="stat-label">Install time</div>
              </div>
              <div className="stat-cell">
                <div className="stat-num">0</div>
                <div className="stat-label">Runtime deps</div>
              </div>
              <div className="stat-cell">
                <div className="stat-num">100%</div>
                <div className="stat-label">TypeScript</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Code Ownership */}
      <section className="ownership-section">
        <div className="ownership-inner">
          <div className="ownership-text reveal visible">
            <div className="section-label">Philosophy</div>
            <h2 className="section-title">Own the code.</h2>
            <p>
              IntegrateAPI installs <strong>real TypeScript code</strong> directly into your project. No runtime dependency. No hidden SDK layer wrapping your API calls.
            </p>
            <p>
              When you run <code className="inline-code">npx integrateapi add stripe</code>, you get working Stripe code in your <code className="inline-code-dim">/lib</code> folder. Read it. Edit it. Extend it. Ship it.
            </p>
            <p className="philosophy-quote">It&apos;s your code, not a black box.</p>
          </div>

          <div className="file-tree reveal visible">
            <div className="file-tree-header">
              <span>📁</span> /lib/integrations
            </div>
            {fileTreeItems.map((file) => (
              <div key={file} className="file-item">
                <span className="file-icon">TS</span> {file}
              </div>
            ))}
            <div className="file-item more">+ more on install</div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter-section">
        <div className="newsletter-inner reveal visible">
          <div className="section-label center">Newsletter</div>
          <div className="newsletter-title">FuseWire</div>
          <h2 className="section-title">The API integration newsletter.</h2>
          <ul className="newsletter-list">
            <li>SaaS architecture</li>
            <li>API design patterns</li>
            <li>Integration strategies</li>
            <li>New developer tools</li>
          </ul>
          <form className="newsletter-form" onSubmit={submitNewsletter}>
            <input
              type="email"
              className="newsletter-input"
              placeholder="you@company.com"
              value={newsletterEmail}
              onChange={(e) => {
                setNewsletterEmail(e.target.value);
                if (newsletterStatus !== "idle") {
                  setNewsletterStatus("idle");
                  setNewsletterMessage(null);
                }
              }}
              autoComplete="email"
              inputMode="email"
              required
            />
            <button
              type="submit"
              className="newsletter-btn"
              disabled={newsletterStatus === "loading"}
            >
              {newsletterStatus === "loading" ? "Sending..." : "Subscribe"}
            </button>
          </form>
          {newsletterMessage && (
            <p
              className={`newsletter-message ${
                newsletterStatus === "error" ? "error" : "success"
              }`}
            >
              {newsletterMessage}
            </p>
          )}
          <p className="newsletter-note">Weekly. No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        style={{
          padding: "80px 40px",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="reveal visible" style={{ textAlign: "center", marginBottom: "48px" }}>
            <div className="section-label center">Pricing</div>
            <h2 className="section-title center">Simple pricing.</h2>
            <p className="section-sub" style={{ margin: "0 auto" }}>
              Choose monthly or lifetime. No seat fees.
            </p>
          </div>

          <div
            className="reveal visible"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1px",
              background: "var(--border)",
              border: "1px solid var(--border)",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            {/* Free tier */}
            <div style={{ background: "var(--bg-card)", padding: "36px 32px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "12px" }}>Free</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: "40px", fontWeight: 400, lineHeight: 1, marginBottom: "24px" }}>$0</div>
              <ul className="card-features">
                <li>5 integrations</li>
                <li>All free-tier templates</li>
                <li>Registry access</li>
                <li>Stress Test tool</li>
                <li>CLI access</li>
              </ul>
              <Link
                href="/sign-up"
                className="btn-ghost"
                style={{ marginTop: "28px", display: "inline-block" }}
              >
                Get started free
              </Link>
            </div>

            {/* Pro tier */}
            <div style={{ background: "var(--bg-card)", padding: "36px 32px", borderLeft: "1px solid var(--accent)", position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: "var(--accent)",
                }}
              />
              <div style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "12px" }}>Pro</div>
              <div style={{ marginBottom: "24px" }}>
                <span style={{ fontFamily: "var(--serif)", fontSize: "40px", fontWeight: 400, lineHeight: 1 }}>$9</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-dim)", marginLeft: "8px" }}>/ month</span>
                <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-dim)", marginTop: "6px" }}>
                  or $29 lifetime
                </div>
              </div>
              <ul className="card-features">
                <li>Unlimited integrations</li>
                <li>All pro-tier templates</li>
                <li>Registry access</li>
                <li>Stress Test tool</li>
                <li>Future templates included</li>
              </ul>
              <Link
                href="/sign-up"
                className="btn-primary"
                style={{ marginTop: "28px", display: "inline-block" }}
              >
                Get Pro →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner reveal visible">
          <div className="section-label center">Get started</div>
          <h2 className="section-title">Start building faster.</h2>
          <CtaTerminal />
          <Link href="/templates" className="btn-primary large">Get Started →</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <Link href="/" className="footer-logo">IntegrateAPI</Link>
        <div className="footer-links">
          <Link href="/templates">Templates</Link>
          <Link href="/stress-test">Stress Test</Link>
          <Link href="/registry">Registry</Link>
          <Link href="/docs">Docs</Link>
          <a href="https://github.com/Reliathedisco/IntegrateAPI_Fusewire" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
        <span className="footer-copy">© 2026 Reli Music LLC</span>
      </footer>
    </div>
  );
}
