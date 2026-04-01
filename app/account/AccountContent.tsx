"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { regenerateCliAuthToken } from './actions';

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
  const [cliMessage, setCliMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [planStatus, setPlanStatus] = useState<{ isPro: boolean; plan: "free" | "pro" } | null>(null);
  const [usageStatus, setUsageStatus] = useState<{
    installs: number;
    remaining: number;
    allowed: boolean;
  } | null>(null);

  useEffect(() => {
    if (justPurchased) {
      const plan = searchParams.get("plan");
      setMessage({
        type: "success",
        text:
          plan === "subscription"
            ? "Subscription active! Your account has been upgraded to Pro."
            : "Upgrade complete! Your account has been upgraded to Pro.",
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

  useEffect(() => {
    if (!isLoaded) return;

    let canceled = false;

    const loadStatus = async () => {
      try {
        const response = await fetch("/api/user/status");
        const data = await response.json();
        if (!canceled && typeof data?.isPro === "boolean") {
          setPlanStatus({ isPro: data.isPro, plan: data.plan === "pro" ? "pro" : "free" });
        }
      } catch {
        // ignore
      }
    };

    const loadUsage = async () => {
      try {
        const response = await fetch("/api/check-limit");
        const data = await response.json();
        if (!canceled && typeof data?.installs === "number") {
          setUsageStatus({
            installs: data.installs,
            remaining: typeof data.remaining === "number" ? data.remaining : 0,
            allowed: Boolean(data.allowed),
          });
        }
      } catch {
        // ignore
      }
    };

    loadStatus();
    loadUsage();

    return () => {
      canceled = true;
    };
  }, [isLoaded]);

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
  const effectiveIsPro = planStatus?.isPro ?? isPro;
  const usedIntegrations = usageStatus?.installs ?? 0;
  const remainingIntegrations =
    usageStatus?.remaining ?? Math.max(0, MAX_FREE_INTEGRATIONS - usedIntegrations);
  const planLabel = hasLifetimePro
    ? "Pro (Lifetime)"
    : subscriptionIsPro
      ? "Pro (Subscription)"
    : effectiveIsPro
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

  const handleRegenerateToken = async () => {
    if (!userId) return;
    setIsRegenerating(true);
    try {
      const newToken = await regenerateCliAuthToken(userId);
      setCliAuthToken(newToken);
      setCliMessage({ type: "success", text: "New CLI token generated." });
    } catch {
      setCliMessage({ type: "error", text: "Failed to regenerate token." });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopyToken = async () => {
    if (!cliAuthToken) {
      setCliMessage({ type: "error", text: "No token to copy." });
      return;
    }
    try {
      await navigator.clipboard.writeText(cliAuthToken);
      setCliMessage({ type: "success", text: "Token copied to clipboard." });
    } catch {
      setCliMessage({ type: "error", text: "Failed to copy token." });
    }
  };

  const maskedCliAuthToken = cliAuthToken
    ? `${cliAuthToken.slice(0, 12)}...${cliAuthToken.slice(-4)}`
    : null;

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
          <span className={`planBadge ${effectiveIsPro ? "pro" : "free"}`}>{planLabel}</span>
        </p>

        <p>
          <strong>Integrations</strong>
        </p>
        {effectiveIsPro ? (
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
              <p className="usageText">Remaining: {remainingIntegrations}</p>
            </div>
            {remainingIntegrations <= 1 && (
              <p style={{ color: "#fca5a5", marginTop: "8px", fontSize: "0.85rem" }}>
                You’re about to hit your free limit.
              </p>
            )}
          </>
        )}

        {!effectiveIsPro && !justPurchased ? (
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
        {!effectiveIsPro && (
          <p style={{ color: "var(--text-mid)", marginTop: "12px" }}>
            Upgrade to unlock all integrations.
          </p>
        )}
      </div>

      <div className="accountCard" style={{ marginTop: "24px" }}>
        <p>
          <strong>CLI Authentication</strong>
        </p>
        <p>Use this token to authenticate the CLI without the browser flow.</p>
        {cliMessage && (
          <div
            style={{
              padding: "10px 12px",
              marginBottom: "12px",
              borderRadius: "8px",
              background: cliMessage.type === "success" ? "var(--green-dim)" : "#7f1d1d",
              color: cliMessage.type === "success" ? "var(--green)" : "#fca5a5",
            }}
          >
            {cliMessage.text}
          </div>
        )}
        {cliAuthToken ? (
          <>
            <p>
              Current auth token:
              <code className="inline-code" style={{ marginLeft: "8px" }}>
                {maskedCliAuthToken}
              </code>
            </p>
            <div className="cardCommand" style={{ marginTop: "12px" }}>
              <code>
                npx integrateapi login --token {maskedCliAuthToken}
              </code>
            </div>
            <div className="authButtons" style={{ marginTop: "12px" }}>
              <button
                type="button"
                onClick={handleRegenerateToken}
                className="primary"
                disabled={isRegenerating}
              >
                {isRegenerating ? "Regenerating..." : "Regenerate token"}
              </button>
              <button type="button" onClick={handleCopyToken} className="signOutButton">
                Copy
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!cliAuthToken) return;
                  try {
                    await navigator.clipboard.writeText(
                      `npx integrateapi login --token ${cliAuthToken}`
                    );
                    setCliMessage({ type: "success", text: "Login command copied." });
                  } catch {
                    setCliMessage({ type: "error", text: "Failed to copy login command." });
                  }
                }}
                className="signOutButton"
              >
                Copy login command
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="emptyState">No CLI auth token found yet.</p>
            <div className="cardCommand" style={{ marginTop: "12px" }}>
              <code>npx integrateapi login --token YOUR_TOKEN</code>
            </div>
            <div className="authButtons">
              <button
                type="button"
                onClick={handleRegenerateToken}
                className="primary"
                disabled={isRegenerating}
              >
                {isRegenerating ? "Generating..." : "Generate token"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
