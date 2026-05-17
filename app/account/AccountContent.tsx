"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const MAX_FREE_INTEGRATIONS = 5;

export default function AccountContent({
  initialCliAuthToken,
  userId,
}: {
  initialCliAuthToken: string | null;
  userId: string;
}) {
  void userId; // Reserved for future per-user calls
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

  if (!isLoaded) {
    return (
      <div className="mt-8 rounded-2xl border border-line bg-card p-6">
        <p className="text-sm text-mute">Loading account...</p>
      </div>
    );
  }

  const hasLifetimePro = user?.publicMetadata?.hasLifetimePro === true;
  const subscriptionStatus = user?.publicMetadata?.subscriptionStatus as
    | string
    | undefined;
  const subscriptionIsPro =
    subscriptionStatus === "active" ||
    subscriptionStatus === "trialing" ||
    subscriptionStatus === "past_due";
  const isPro =
    hasLifetimePro || subscriptionIsPro || user?.publicMetadata?.isPro === true;
  const usedIntegrations =
    (user?.publicMetadata?.usedIntegrations as number) || 0;

  const planLabel = hasLifetimePro
    ? "Pro (Lifetime)"
    : subscriptionIsPro
      ? "Pro (Subscription)"
      : isPro
        ? "Pro"
        : "Free";

  const stripeCustomerId = user?.publicMetadata?.stripeCustomerId as
    | string
    | undefined;

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
      setToastMessage("New key copied");
      setTimeout(() => setToastMessage(null), 2000);
    } catch {
      setTokenError("Failed to generate API key — try again.");
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const handleCopyToken = async () => {
    if (!cliAuthToken) return;
    try {
      await navigator.clipboard.writeText(cliAuthToken);
      setToastMessage("Key copied");
      setTimeout(() => setToastMessage(null), 2000);
    } catch {
      setTokenError("Copy failed — use manual selection.");
    }
  };

  const handleCopyCommand = async () => {
    if (!cliAuthToken) return;
    try {
      await navigator.clipboard.writeText(
        `npx integrateapi login --key ${cliAuthToken}`,
      );
      setToastMessage("Command copied");
      setTimeout(() => setToastMessage(null), 2000);
    } catch {
      setTokenError("Copy failed — use manual selection.");
    }
  };

  const usagePct = Math.min(
    (usedIntegrations / MAX_FREE_INTEGRATIONS) * 100,
    100,
  );

  return (
    <div className="mt-10 flex flex-col gap-10">
      {/* Plan + usage */}
      <div className="flex flex-col gap-7 rounded-2xl border border-line bg-card p-7">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <Eyebrow>Email</Eyebrow>
            <p className="mt-2 text-sm text-ink">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
          <div>
            <Eyebrow>Plan</Eyebrow>
            <div className="mt-2">
              <Pill variant={isPro ? "accent" : "default"}>{planLabel}</Pill>
            </div>
          </div>
          <div>
            <Eyebrow>Integrations</Eyebrow>
            {isPro ? (
              <p className="mt-2 text-sm text-ink">Unlimited</p>
            ) : (
              <div className="mt-2">
                <div className="h-1.5 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-ink transition-[width]"
                    style={{ width: `${usagePct}%` }}
                  />
                </div>
                <p className="mt-2 font-mono text-xs text-faint">
                  {usedIntegrations} / {MAX_FREE_INTEGRATIONS}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-line pt-6">
          {!isPro && !justPurchased ? (
            <>
              <Button
                variant="accent"
                onClick={() => startCheckout("subscription")}
                disabled={loadingPlan === "subscription"}
              >
                {loadingPlan === "subscription" ? "Loading..." : "Subscribe ($9/mo)"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => startCheckout("lifetime")}
                disabled={loadingPlan === "lifetime"}
              >
                {loadingPlan === "lifetime" ? "Loading..." : "Lifetime ($29)"}
              </Button>
            </>
          ) : (
            stripeCustomerId && (
              <Button
                variant="secondary"
                onClick={manageBilling}
                disabled={loadingPlan === "subscription"}
              >
                Manage billing
              </Button>
            )
          )}
        </div>
      </div>

      {/* CLI Authentication */}
      <section className="flex flex-col gap-5">
        <header>
          <Eyebrow>CLI authentication</Eyebrow>
          <h2 className="mt-2 font-sans text-xl font-semibold tracking-tight text-ink">
            API key for the CLI
          </h2>
        </header>

        <div className="flex flex-col gap-5 rounded-2xl border border-line bg-card p-7">
          {cliAuthToken ? (
            <>
              <div>
                <Eyebrow>API key</Eyebrow>
                <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-line bg-paper-soft px-4 py-3">
                  <code className="font-mono text-[13px] text-mute">
                    sk_live_••••...{cliAuthToken.slice(-4)}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyToken}
                    className="font-mono text-[11px] text-faint transition hover:text-accent"
                  >
                    Copy key
                  </button>
                </div>
              </div>

              <div>
                <Eyebrow>Full command</Eyebrow>
                <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-line bg-paper-soft px-4 py-3">
                  <code className="overflow-x-auto font-mono text-[13px] text-mute">
                    npx integrateapi login --key sk_live_••••...{cliAuthToken.slice(-4)}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyCommand}
                    className="shrink-0 font-mono text-[11px] text-faint transition hover:text-accent"
                  >
                    Copy command
                  </button>
                </div>
              </div>

              <div>
                <Button
                  variant="accent"
                  onClick={handleGenerateToken}
                  disabled={isGeneratingToken}
                >
                  {isGeneratingToken ? "Generating..." : "Regenerate API key"}
                </Button>
              </div>
            </>
          ) : (
            <div>
              <p className="text-sm text-mute">
                No API key yet — generate one to connect the CLI.
              </p>
              <div className="mt-4">
                <Button
                  variant="accent"
                  onClick={handleGenerateToken}
                  disabled={isGeneratingToken}
                >
                  {isGeneratingToken ? "Generating..." : "Generate API key"}
                </Button>
              </div>
            </div>
          )}

          {toastMessage && (
            <p
              className={cn(
                "inline-flex w-fit items-center rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider",
                "border-success/25 bg-success/10 text-success",
              )}
              role="status"
            >
              {toastMessage}
            </p>
          )}

          {tokenError && (
            <p className="font-mono text-[12px] text-danger" role="alert">
              {tokenError}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
