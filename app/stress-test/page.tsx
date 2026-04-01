"use client";

import Link from "next/link";
import { useState } from "react";

const features = [
  {
    title: "Scaling Risk Detection",
    description: "Identify bottlenecks in your architecture before they become incidents under load.",
    icon: "⚡",
  },
  {
    title: "Auth & Billing Evaluation",
    description: "Analyze your authentication flow and billing integration for edge cases and security gaps.",
    icon: "🔐",
  },
  {
    title: "Architecture Scoring",
    description: "Get a comprehensive score of your SaaS architecture with detailed breakdown.",
    icon: "📊",
  },
  {
    title: "Actionable Recommendations",
    description: "Receive specific, prioritized recommendations to improve your stack.",
    icon: "✅",
  },
];

const checkItems = [
  { category: "API Rate Limits", checks: ["Rate limit headers", "Retry logic", "Backoff strategy"] },
  { category: "Authentication", checks: ["Token refresh", "Session management", "MFA handling"] },
  { category: "Database", checks: ["Connection pooling", "Query optimization", "Index usage"] },
  { category: "Error Handling", checks: ["Graceful degradation", "Circuit breakers", "Fallback strategies"] },
  { category: "Caching", checks: ["Cache invalidation", "TTL configuration", "Cache warming"] },
  { category: "Webhooks", checks: ["Idempotency", "Retry handling", "Signature verification"] },
];

function CommandBlock({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="stress-command">
      <code>{command}</code>
      <button onClick={handleCopy} className="stress-copy-btn">
        {copied ? "✓ Copied" : "Copy"}
      </button>
    </div>
  );
}

export default function StressTestPage() {
  return (
    <div className="stress-page">
      {/* Hero */}
      <section className="stress-hero">
        <div className="stress-hero-grid"></div>
        <div className="stress-hero-content">
          <div className="stress-badge">CLI Tool</div>
          <h1>Stress Test</h1>
          <p className="stress-hero-sub">
            Analyze your SaaS architecture for scaling risks, security gaps, and integration issues before they become production incidents.
          </p>
          <CommandBlock command="npx integrateapi add stripe" />
        </div>
      </section>

      {/* Features */}
      <section className="stress-features">
        <h2>What It Checks</h2>
        <div className="stress-features-grid">
          {features.map((feature) => (
            <div key={feature.title} className="stress-feature-card">
              <span className="stress-feature-icon">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Checklist */}
      <section className="stress-checklist">
        <h2>Analysis Categories</h2>
        <p className="stress-checklist-sub">
          The stress test evaluates your codebase across these critical areas:
        </p>
        <div className="stress-checklist-grid">
          {checkItems.map((item) => (
            <div key={item.category} className="stress-checklist-card">
              <h4>{item.category}</h4>
              <ul>
                {item.checks.map((check) => (
                  <li key={check}>
                    <span className="stress-check-icon">→</span>
                    {check}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="stress-how">
        <h2>How It Works</h2>
        <div className="stress-steps">
          <div className="stress-step">
            <div className="stress-step-num">1</div>
            <h3>Run the Command</h3>
            <p>Execute the stress test CLI in your project root directory.</p>
            <CommandBlock command="npx integrateapi add stripe" />
          </div>
          <div className="stress-step">
            <div className="stress-step-num">2</div>
            <h3>Automatic Analysis</h3>
            <p>The tool scans your codebase, config files, and integration patterns.</p>
          </div>
          <div className="stress-step">
            <div className="stress-step-num">3</div>
            <h3>Get Your Report</h3>
            <p>Receive a detailed report with scores, issues, and recommendations.</p>
          </div>
        </div>
      </section>

      {/* Sample Output */}
      <section className="stress-output">
        <h2>Sample Output</h2>
        <div className="stress-terminal">
          <div className="stress-terminal-bar">
            <div className="t-dot red"></div>
            <div className="t-dot yellow"></div>
            <div className="t-dot green"></div>
            <span>integrateapi add stripe</span>
          </div>
          <div className="stress-terminal-body">
            <pre>{`$ npx integrateapi add stripe

🔍 Analyzing your SaaS architecture...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Architecture Score: 78/100

✅ Stripe integration: Webhook signatures verified
✅ Clerk auth: Token refresh implemented
⚠️  Database: Missing connection pooling
⚠️  API calls: No retry logic detected
❌ Rate limiting: No backoff strategy found

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Recommendations:
  1. Add connection pooling to database client
  2. Implement exponential backoff for API calls
  3. Add circuit breaker for external services

Run 'integrateapi fix' to auto-fix issues.`}</pre>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="stress-cta">
        <h2>Ready to stress test your stack?</h2>
        <CommandBlock command="npx integrateapi add stripe" />
        <div className="stress-cta-links">
          <Link href="/templates" className="stress-link">
            Browse Templates →
          </Link>
          <Link href="/registry" className="stress-link">
            Explore Registry →
          </Link>
          <Link href="/docs" className="stress-link">
            Read Docs →
          </Link>
        </div>
      </section>
    </div>
  );
}
