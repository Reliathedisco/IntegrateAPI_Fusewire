"use client";

import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const MAX_FREE_INTEGRATIONS = 5;
type CheckoutPlan = "lifetime" | "subscription";
type SubscriptionStatus =
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "paused";

interface AccountContentProps {
  initialCliAuthToken: string | null;
  userId: string;
}

export default function AccountContent({ initialCliAuthToken, userId }: AccountContentProps) {
  const { user, isLoaded } = useUser();
  const [loadingPlan, setLoadingPlan] = useState<CheckoutPlan | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const searchParams = useSearchParams();
  const justPurchased =
    searchParams.get("upgraded") === "true" || searchParams.get("success") === "true";

  const [cliAuthToken, setCliAuthToken] = useState<string | null>(initialCliAuthToken);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    if (justPurchased) {
      setMessage({
        type: "success",
        text: "You're now on Pro — welcome!",
      });

      if (user) {
        const hasLifetimePro = user.publicMetadata?.hasLifetimePro === true;
        const subscriptionStatus = user.publicMetadata?.subscriptionStatus as
          | SubscriptionStatus
          | undefined;
        const subscriptionIsPro =
          subscriptionStatus === "active" ||
          subscriptionStatus === "trialing" ||
          subscriptionStatus === "past_due";
        const isPro =
          hasLifetimePro || subscriptionIsPro || user.publicMetadata?.isPro === true;

        if (isPro) return;

        let attempts = 0;
        const interval = setInterval(async () => {
          attempts++;
          await user.reload();
          const hasLifetimePro = user.publicMetadata?.hasLifetimePro === true;
          const subscriptionStatus = user.publicMetadata?.subscriptionStatus as
            | SubscriptionStatus
            | undefined;
          const subscriptionIsPro =
            subscriptionStatus === "active" ||
            subscriptionStatus === "trialing" ||
            subscriptionStatus === "past_due";
          const isPro =
            hasLifetimePro || subscriptionIsPro || user.publicMetadata?.isPro === true;

          if (isPro || attempts >= 10) {
            clearInterval(interval);
          }
        }, 2000);
        return () => clearInterval(interval);
      }
    } else if (searchParams.get("canceled") === "true") {
      setMessage({ type: "error", text: "Payment was canceled." });
    }
  }, [justPurchased, searchParams, user]);

  if (!isLoaded) {
    return (
      <div className="accountCard">
        <p>Loading...</p>
      </div>
    );
  }

  const hasLifetimePro = user?.publicMetadata?.hasLifetimePro === true;
  const subscriptionStatus = user?.publicMetadata?.subscriptionStatus as
    | SubscriptionStatus
    | undefined;

  const subscriptionIsPro =
    subscriptionStatus === "active" ||
    subscriptionStatus === "trialing" ||
    subscriptionStatus === "past_due";

  const isPro = hasLifetimePro || subscriptionIsPro || user?.publicMetadata?.isPro === true;
  const usedIntegrations =
    (user?.publicMetadata?.usedIntegrations as number) || 0;
  const planLabel = hasLifetimePro
    ? "Pro (Lifetime)"
    : subscriptionIsPro
      ? "Pro (Subscription)"
      : isPro
        ? "Pro"
        : "Free";
  const stripeCustomerId = user?.publicMetadata?.stripeCustomerId as string | undefined;

  const startCheckout = async (plan: CheckoutPlan) => {
    setLoadingPlan(plan);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to start checkout",
        });
        setLoadingPlan(null);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to start checkout" });
      setLoadingPlan(null);
    }
  };

  const manageBilling = async () => {
    setLoadingPlan("subscription");
    try {
      const response = await fetch("/api/billing-portal", { method: "POST" });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to open billing portal",
        });
        setLoadingPlan(null);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to open billing portal" });
      setLoadingPlan(null);
    }
  };

  const handleGenerateToken = useCallback(async () => {
    if (!userId || isGeneratingToken) return;
    setIsGeneratingToken(true);
    setTokenError(null);
    try {
      const response = await fetch("/api/cli/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate API key");
      }
      setCliAuthToken(data.authToken as string);
    } catch (error) {
      setTokenError(error instanceof Error ? error.message : "Failed to generate API key");
    } finally {
      setIsGeneratingToken(false);
    }
  }, [isGeneratingToken, userId]);

  const handleCopyToken = async () => {
    if (!cliAuthToken) return;
    await navigator.clipboard.writeText(cliAuthToken);
    setToastMessage("Copied!");
    setTimeout(() => setToastMessage(null), 1500);
  };

  return (
    <>
      {message && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "20px",
            borderRadius: "8px",
            background: message.type === "success" ? "#064e3b" : "#7f1d1d",
            color: message.type === "success" ? "#6ee7b7" : "#fca5a5",
            maxWidth: "400px",
          }}
        >
          {message.text}
        </div>
      )}

      <div className="accountCard">
        <p>
          <strong>Email</strong>
        </p>
        <p>{user?.primaryEmailAddress?.emailAddress}</p>

        <p>
          <strong>Plan</strong>
        </p>
        <p>
          <span className={`planBadge ${isPro ? "pro" : "free"}`}>{planLabel}</span>
        </p>

        <p>
          <strong>Integrations</strong>
        </p>
        {isPro ? (
          <p>Unlimited integrations</p>
        ) : (
          <>
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
                {usedIntegrations} / {MAX_FREE_INTEGRATIONS} integrations used
              </p>
            </div>
          </>
        )}

        {!isPro && !justPurchased ? (
          <div className="upgradeButton" style={{ display: "grid", gap: "10px" }}>
            <button
              type="button"
              className="primary"
              onClick={() => startCheckout("subscription")}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === "subscription" ? "Redirecting..." : "Subscribe — $9/month"}
            </button>
            <button
              type="button"
              className="signOutButton"
              onClick={() => startCheckout("lifetime")}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === "lifetime" ? "Redirecting..." : "Buy lifetime — $29"}
            </button>
          </div>
        ) : (
          stripeCustomerId && (
            <button
              type="button"
              className="signOutButton upgradeButton"
              onClick={manageBilling}
              disabled={loadingPlan !== null}
            >
              {loadingPlan ? "Opening..." : "Manage billing"}
            </button>
          )
        )}
      </div>

      {/* CLI Authentication Section */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">CLI Authentication</h2>
        <div className="bg-gray-800 p-4 rounded-lg">
          {cliAuthToken ? (
            <>
              <p className="mb-2">
                Current auth token:
                <code className="bg-gray-700 p-1 rounded ml-2">
                  sk_live_****...{cliAuthToken.slice(-4)}
                </code>
              </p>
              <button
                type="button"
                onClick={handleGenerateToken}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                disabled={isGeneratingToken}
              >
                {isGeneratingToken ? "Generating..." : "Regenerate API Key"}
              </button>
              <button
                type="button"
                onClick={handleCopyToken}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Copy
              </button>
            </>
          ) : (
            <div>
              <p className="mb-3">No CLI auth token found. Generate one to get started.</p>
              <button
                type="button"
                onClick={handleGenerateToken}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                disabled={isGeneratingToken}
              >
                {isGeneratingToken ? "Generating..." : "Generate API Key"}
              </button>
            </div>
          )}
          {toastMessage ? (
            <div
              style={{
                marginTop: "12px",
                padding: "8px 12px",
                borderRadius: "6px",
                background: "#064e3b",
                color: "#6ee7b7",
                display: "inline-block",
              }}
            >
              {toastMessage}
            </div>
          ) : null}
          {tokenError ? (
            <p style={{ color: "#fca5a5", marginTop: "12px" }}>{tokenError}</p>
          ) : null}
        </div>
      </section>
    </>
  );
}
