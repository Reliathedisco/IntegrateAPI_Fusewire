"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const MAX_FREE_INTEGRATIONS = 5;

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
      setMessage({
        type: "success",
        text: "Payment successful! Your account has been upgraded to Pro.",
      });
      user?.reload();
    } else if (searchParams.get("canceled") === "true") {
      setMessage({ type: "error", text: "Payment was canceled." });
    }
  }, [searchParams, user]);

  if (!isLoaded) {
    return (
      <div className="accountCard">
        <p>Loading...</p>
      </div>
    );
  }

  const isPro = user?.publicMetadata?.isPro === true;
  const usedIntegrations =
    (user?.publicMetadata?.usedIntegrations as number) || 0;
  const plan = isPro ? "Pro" : "Free";

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
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
          <span className={`planBadge ${isPro ? "pro" : "free"}`}>{plan}</span>
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

        {!isPro && (
          <button
            type="button"
            className="primary upgradeButton"
            onClick={handleUpgrade}
            disabled={isLoading}
          >
            {isLoading ? "Redirecting..." : "Upgrade to Pro — $29"}
          </button>
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
