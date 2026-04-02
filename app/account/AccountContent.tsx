"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

const MAX_FREE_INTEGRATIONS = 5;

export default function AccountContent({ initialCliAuthToken, userId }: { initialCliAuthToken: string | null; userId: string }) {
  const { user, isLoaded } = useUser();

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [cliAuthToken, setCliAuthToken] = useState(initialCliAuthToken);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const justPurchased =
    searchParams.get("upgraded") === "true" ||
    searchParams.get("success") === "true";

  if (!isLoaded) return null;

  const hasLifetimePro = user?.publicMetadata?.hasLifetimePro === true;
  const subscriptionStatus = user?.publicMetadata?.subscriptionStatus as string | undefined;
  const subscriptionIsPro =
    subscriptionStatus === "active" ||
    subscriptionStatus === "trialing" ||
    subscriptionStatus === "past_due";
  const isPro =
    hasLifetimePro ||
    subscriptionIsPro ||
    user?.publicMetadata?.isPro === true;
  const usedIntegrations =
    (user?.publicMetadata?.usedIntegrations as number) || 0;

  const planLabel = hasLifetimePro
    ? "Pro (Lifetime)"
    : subscriptionIsPro
    ? "Pro (Subscription)"
    : isPro
    ? "Pro"
    : "Free";

  const stripeCustomerId =
    user?.publicMetadata?.stripeCustomerId as string | undefined;

  const startCheckout = async (plan: string) => {
    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoadingPlan(null);
      }
    } catch {
      setLoadingPlan(null);
    }
  };

  const manageBilling = async () => {
    setLoadingPlan("subscription");
    try {
      const res = await fetch("/api/billing-portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoadingPlan(null);
      }
    } catch {
      setLoadingPlan(null);
    }
  };

  const handleGenerateToken = async () => {
    if (isGeneratingToken) return;
    setIsGeneratingToken(true);
    setTokenError(null);

    try {
      const res = await fetch("/api/cli/regenerate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      setCliAuthToken(data.authToken);
      await navigator.clipboard.writeText(data.authToken);
      setToastMessage("copied new key");
      setTimeout(() => setToastMessage(null), 2000);
    } catch {
      setTokenError("failed to generate api key — try again");
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const handleCopyToken = async () => {
    if (!cliAuthToken) return;
    try {
      await navigator.clipboard.writeText(cliAuthToken);
      setToastMessage("copied key");
      setTimeout(() => setToastMessage(null), 2000);
    } catch {
      setTokenError("copy failed — use manual selection");
    }
  };

  const handleCopyCommand = async () => {
    if (!cliAuthToken) return;
    try {
      await navigator.clipboard.writeText(`npx integrateapi login --key ${cliAuthToken}`);
      setToastMessage("copied command");
      setTimeout(() => setToastMessage(null), 2000);
    } catch {
      setTokenError("copy failed — use manual selection");
    }
  };

  return (
    <div className="account-section">

      {/* Account info */}
      <div className="account-info-card">
        <div>
          <p className="account-label">Email</p>
          <p className="account-value">
            {user?.primaryEmailAddress?.emailAddress}
          </p>
        </div>

        <div>
          <p className="account-label">Plan</p>
          <span className={`account-plan-badge ${isPro ? "pro" : "free"}`}>
            {planLabel}
          </span>
        </div>

        <div>
          <p className="account-label">Integrations</p>
          {isPro ? (
            <p className="account-value">Unlimited integrations</p>
          ) : (
            <div>
              <div className="account-usage-bar">
                <div
                  className="account-usage-fill"
                  style={{
                    width: `${Math.min((usedIntegrations / MAX_FREE_INTEGRATIONS) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="account-usage-text">
                {usedIntegrations} / {MAX_FREE_INTEGRATIONS}
              </p>
            </div>
          )}
        </div>

        <div className="account-actions">
          {!isPro && !justPurchased ? (
            <>
              <button
                onClick={() => startCheckout("subscription")}
                disabled={loadingPlan === "subscription"}
                className="account-btn primary"
              >
                {loadingPlan === "subscription" ? (
                  <><span className="spinner" /> loading...</>
                ) : (
                  "Subscribe"
                )}
              </button>
              <button
                onClick={() => startCheckout("lifetime")}
                disabled={loadingPlan === "lifetime"}
                className="account-btn ghost"
              >
                {loadingPlan === "lifetime" ? "loading..." : "Lifetime"}
              </button>
            </>
          ) : (
            stripeCustomerId && (
              <button
                onClick={manageBilling}
                disabled={loadingPlan === "subscription"}
                className="account-btn ghost"
              >
                Manage billing
              </button>
            )
          )}
        </div>
      </div>

      {/* CLI Authentication */}
      <section className="cli-section">
        <h2>CLI Authentication</h2>

        <div className="cli-card">
          {cliAuthToken ? (
            <>
              <div>
                <p className="account-label">API Key</p>
                <div className="cli-token-display">
                  <code>sk_live_****...{cliAuthToken.slice(-4)}</code>
                  <button onClick={handleCopyToken} className="cli-copy-btn">
                    Copy Key
                  </button>
                </div>
              </div>

              <div>
                <p className="account-label">Full command</p>
                <div className="cli-token-display">
                  <code>npx integrateapi login --key sk_live_****...{cliAuthToken.slice(-4)}</code>
                  <button onClick={handleCopyCommand} className="cli-copy-btn">
                    Copy Command
                  </button>
                </div>
              </div>

              <div>
                <button
                  onClick={handleGenerateToken}
                  disabled={isGeneratingToken}
                  className="account-btn primary"
                >
                  {isGeneratingToken ? (
                    <><span className="spinner" /> generating...</>
                  ) : (
                    "Regenerate API Key"
                  )}
                </button>
              </div>
            </>
          ) : (
            <div>
              <p className="cli-no-token">
                No API key yet — generate one to connect the CLI.
              </p>
              <button
                onClick={handleGenerateToken}
                disabled={isGeneratingToken}
                className="account-btn primary"
              >
                {isGeneratingToken ? (
                  <><span className="spinner" /> generating...</>
                ) : (
                  "Generate API Key"
                )}
              </button>
            </div>
          )}

          {toastMessage && (
            <div className="cli-toast">{toastMessage}</div>
          )}

          {tokenError && (
            <p className="cli-error">{tokenError}</p>
          )}
        </div>
      </section>
    </div>
  );
}
