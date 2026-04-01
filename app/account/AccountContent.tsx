"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

const MAX_FREE_INTEGRATIONS = 5;

export default function AccountContent({ initialCliAuthToken, userId }) {
  const { user, isLoaded } = useUser();

  const [loadingPlan, setLoadingPlan] = useState(null);
  const [message, setMessage] = useState(null);
  const [cliAuthToken, setCliAuthToken] = useState(initialCliAuthToken);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [tokenError, setTokenError] = useState(null);

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
  const startCheckout = async (plan) => {
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
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">

      {/* ACCOUNT */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">

        <div>
          <p className="text-xs text-gray-400 uppercase mb-1">email</p>
          <p className="text-white">
            {user?.primaryEmailAddress?.emailAddress}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase mb-1">plan</p>
          <span className={`inline-block px-3 py-1 text-xs rounded-full ${
            isPro
              ? "bg-purple-600/20 text-purple-300 border border-purple-600/40"
              : "bg-gray-700 text-gray-300"
          }`}>
            {planLabel}
          </span>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase mb-2">integrations</p>

          {isPro ? (
            <p className="text-white">unlimited</p>
          ) : (
            <div className="space-y-2">
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{
                    width: `${Math.min((usedIntegrations / MAX_FREE_INTEGRATIONS) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-400">
                {usedIntegrations} / {MAX_FREE_INTEGRATIONS}
              </p>
            </div>
          )}
        </div>

        <div className="pt-2">
          {!isPro && !justPurchased ? (
            <div className="flex gap-2">
              <button
                onClick={() => startCheckout("subscription")}
                className="px-4 py-2 text-sm rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition"
              >
                subscribe
              </button>

              <button
                onClick={() => startCheckout("lifetime")}
                className="px-4 py-2 text-sm rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-300 transition"
              >
                lifetime
              </button>
            </div>
          ) : (
            stripeCustomerId && (
              <button
                onClick={manageBilling}
                className="px-4 py-2 text-sm rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-300 transition"
              >
                manage billing
              </button>
            )
          )}
        </div>
      </div>

      {/* CLI */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">CLI Access</h2>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-5 space-y-4">

          {cliAuthToken ? (
            <>
              <div>
                <p className="text-xs text-gray-400 mb-2 uppercase">
                  api key
                </p>

                <div className="flex items-center justify-between bg-black/40 border border-gray-700 rounded-lg px-3 py-2">
                  <code className="text-sm text-gray-200">
                    sk_live_****...{cliAuthToken.slice(-4)}
                  </code>

                  <button
                    onClick={handleCopyToken}
                    className="text-xs text-gray-400 hover:text-white transition"
                  >
                    copy
                  </button>
                </div>
              </div>

              <button
                onClick={handleGenerateToken}
                disabled={isGeneratingToken}
                className="px-4 py-2 text-sm rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition flex items-center gap-2"
              >
                {isGeneratingToken ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    generating...
                  </>
                ) : (
                  "regenerate key"
                )}
              </button>
            </>
          ) : (
            <div>
              <p className="text-sm text-gray-400 mb-3">
                no api key yet — generate one to connect the cli
              </p>

              <button
                onClick={handleGenerateToken}
                className="px-4 py-2 text-sm rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition"
              >
                generate api key
              </button>
            </div>
          )}

          {toastMessage && (
            <div className="text-xs text-green-400 bg-green-900/40 border border-green-700 px-3 py-2 rounded-md inline-block">
              {toastMessage}
            </div>
          )}

          {tokenError && (
            <p className="text-sm text-red-400">{tokenError}</p>
          )}
        </div>
      </section>

    </div>
  );
}
