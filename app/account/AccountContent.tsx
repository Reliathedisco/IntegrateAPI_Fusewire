"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

const MAX_FREE_INTEGRATIONS = 5;

interface AccountContentProps {
  initialCliAuthToken: string | null;
  userId: string;
}

export default function AccountContent({ initialCliAuthToken, userId }: AccountContentProps) {
  const { user, isLoaded } = useUser();

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [cliAuthToken, setCliAuthToken] = useState<string | null>(initialCliAuthToken);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const justPurchased =
    searchParams.get("upgraded") === "true" ||
    searchParams.get("success") === "true";

  if (!isLoaded) return null;

  // ===== PLAN LOGIC =====
  const hasLifetimePro = user?.publicMetadata?.hasLifetimePro === true;

  const subscriptionStatus = user?.publicMetadata?.subscriptionStatus;

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

  // ===== ACTIONS =====
  const startCheckout = async (plan: string) => {
    setLoadingPlan(plan);

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
  };

  const manageBilling = async () => {
    setLoadingPlan("subscription");

    const res = await fetch("/api/billing-portal", {
      method: "POST",
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoadingPlan(null);
    }
  };

  const handleGenerateToken = async () => {
    if (isGeneratingToken) return;

    setIsGeneratingToken(true);
    setTokenError(null);

    try {
      const res = await fetch("/api/cli/regenerate", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setCliAuthToken(data.authToken);

      // 🔥 auto copy
      await navigator.clipboard.writeText(data.authToken);
      setToastMessage("copied new key");
      setTimeout(() => setToastMessage(null), 1500);
    } catch {
      setTokenError("failed to generate api key");
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const handleCopyToken = async () => {
    if (!cliAuthToken) return;

    await navigator.clipboard.writeText(cliAuthToken);
    setToastMessage("copied");
    setTimeout(() => setToastMessage(null), 1500);
  };

  // ===== UI =====
  return (
    <div className="accountContent">

      {/* ACCOUNT INFO CARD */}
      <div className="accountInfoCard">

        <div className="accountRow">
          <p className="accountLabel">email</p>
          <p className="accountValue">{user?.primaryEmailAddress?.emailAddress}</p>
        </div>

        <div className="accountRow">
          <p className="accountLabel">plan</p>
          <span className={`planBadge ${isPro ? "pro" : "free"}`}>
            {planLabel}
          </span>
        </div>

        <div className="accountRow">
          <p className="accountLabel">integrations</p>
          {isPro ? (
            <p className="accountValue">unlimited</p>
          ) : (
            <div className="usageBar">
              <div className="usageBarTrack">
                <div
                  className="usageBarFill"
                  style={{
                    width: `${Math.min((usedIntegrations / MAX_FREE_INTEGRATIONS) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="usageText">
                {usedIntegrations} / {MAX_FREE_INTEGRATIONS}
              </p>
            </div>
          )}
        </div>

        <div className="accountActions">
          {!isPro && !justPurchased ? (
            <div className="accountButtonRow">
              <button
                onClick={() => startCheckout("subscription")}
                disabled={loadingPlan !== null}
                className="btn-primary"
              >
                {loadingPlan === "subscription" ? "redirecting..." : "subscribe"}
              </button>
              <button
                onClick={() => startCheckout("lifetime")}
                disabled={loadingPlan !== null}
                className="btn-ghost"
              >
                {loadingPlan === "lifetime" ? "redirecting..." : "lifetime"}
              </button>
            </div>
          ) : (
            stripeCustomerId && (
              <button
                onClick={manageBilling}
                disabled={loadingPlan !== null}
                className="btn-ghost"
              >
                {loadingPlan !== null ? "redirecting..." : "manage billing"}
              </button>
            )
          )}
        </div>
      </div>

      {/* CLI SECTION */}
      <section className="cliSection">
        <h2 className="cliSectionTitle">CLI Access</h2>

        <div className="cliCard">
          {cliAuthToken ? (
            <>
              <div>
                <p className="accountLabel">api key</p>
                <div className="apiKeyBox">
                  <code className="apiKeyCode">
                    sk_live_****...{cliAuthToken.slice(-4)}
                  </code>
                  <button onClick={handleCopyToken} className="apiKeyCopy">
                    copy
                  </button>
                </div>
              </div>

              <button
                onClick={handleGenerateToken}
                disabled={isGeneratingToken}
                className="btn-primary"
              >
                {isGeneratingToken ? (
                  <span className="btnSpinner">
                    <span className="spinnerIcon" />
                    generating...
                  </span>
                ) : (
                  "regenerate key"
                )}
              </button>
            </>
          ) : (
            <div>
              <p className="cliNoKey">
                no api key yet — generate one to connect the cli
              </p>
              <button
                onClick={handleGenerateToken}
                disabled={isGeneratingToken}
                className="btn-primary"
              >
                {isGeneratingToken ? "generating..." : "generate api key"}
              </button>
            </div>
          )}

          {toastMessage && (
            <div className="cliToast">{toastMessage}</div>
          )}

          {tokenError && (
            <p className="cliError">{tokenError}</p>
          )}
        </div>
      </section>

    </div>
  );
}
