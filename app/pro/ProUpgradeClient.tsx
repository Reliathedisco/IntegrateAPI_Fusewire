"use client";

import { useEffect, useState } from "react";

type CheckoutPlan = "lifetime" | "subscription";

export default function ProUpgradeClient() {
  const [loadingPlan, setLoadingPlan] = useState<CheckoutPlan | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    let canceled = false;
    const loadStatus = async () => {
      try {
        const response = await fetch("/api/user/status");
        const data = await response.json();
        if (!canceled && data?.isPro === true) {
          setIsPro(true);
        }
      } catch {
        // ignore
      }
    };
    loadStatus();
    return () => {
      canceled = true;
    };
  }, []);

  const startCheckout = async (plan: CheckoutPlan) => {
    setLoadingPlan(plan);
    setMessage(null);
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
        setMessage(data.error || "Failed to start checkout");
        setLoadingPlan(null);
      }
    } catch {
      setMessage("Failed to start checkout");
      setLoadingPlan(null);
    }
  };

  return (
    <div className="accountCard" style={{ maxWidth: "480px" }}>
      {message && (
        <div
          style={{
            padding: "10px 12px",
            marginBottom: "12px",
            borderRadius: "8px",
            background: "#7f1d1d",
            color: "#fca5a5",
          }}
        >
          {message}
        </div>
      )}
      <p style={{ marginBottom: "12px" }}>
        Upgrade to Pro to unlock unlimited integrations, priority templates, and
        future updates.
      </p>
      <div className="upgradeButton" style={{ display: "grid", gap: "10px" }}>
        <button
          type="button"
          className="primary"
          onClick={() => startCheckout("subscription")}
          disabled={loadingPlan !== null || isPro}
        >
          {isPro
            ? "✓ You own Pro"
            : loadingPlan === "subscription"
              ? "Redirecting..."
              : "Subscribe — $9/month"}
        </button>
        <button
          type="button"
          className="signOutButton"
          onClick={() => startCheckout("lifetime")}
          disabled={loadingPlan !== null || isPro}
        >
          {isPro
            ? "✓ You own Pro"
            : loadingPlan === "lifetime"
              ? "Redirecting..."
              : "Buy lifetime — $29"}
        </button>
      </div>
    </div>
  );
}
