"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect, Suspense } from "react";
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

function AccountContent() {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      const plan = searchParams.get("plan");
      setMessage({
        type: "success",
        text:
          plan === "subscription"
            ? "Subscription active! Your account has been upgraded to Pro."
            : "Payment successful! Your account has been upgraded to Pro.",
      });
    } else if (searchParams.get("canceled") === "true") {
      setMessage({ type: "error", text: "Payment was canceled." });
    }
  }, [searchParams]);

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
    setIsLoading(true);
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
        setIsLoading(false);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to start checkout" });
      setIsLoading(false);
    }
  };

  const manageBilling = async () => {
    setIsLoading(true);
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
        setIsLoading(false);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to open billing portal" });
      setIsLoading(false);
    }
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

        {!isPro ? (
          <div className="upgradeButton" style={{ display: "grid", gap: "10px" }}>
            <button
              type="button"
              className="primary"
              onClick={() => startCheckout("subscription")}
              disabled={isLoading}
            >
              {isLoading ? "Redirecting..." : "Subscribe — $9/month"}
            </button>
            <button
              type="button"
              className="signOutButton"
              onClick={() => startCheckout("lifetime")}
              disabled={isLoading}
            >
              {isLoading ? "Redirecting..." : "Buy lifetime — $29"}
            </button>
          </div>
        ) : (
          stripeCustomerId && (
            <button
              type="button"
              className="signOutButton upgradeButton"
              onClick={manageBilling}
              disabled={isLoading}
            >
              {isLoading ? "Opening..." : "Manage billing"}
            </button>
          )
        )}
      </div>
    </>
  );
}

export default function AccountPage() {
  return (
    <div className="container">
      <h1>Account</h1>
      <Suspense
        fallback={
          <div className="accountCard">
            <p>Loading...</p>
          </div>
        }
      >
        <AccountContent />
      </Suspense>
    </div>
  );
}
