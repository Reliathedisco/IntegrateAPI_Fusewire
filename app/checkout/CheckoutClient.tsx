"use client";

import { useEffect, useState } from "react";

type CheckoutPlan = "subscription" | "lifetime";

export default function CheckoutClient({ plan }: { plan: CheckoutPlan }) {
  const [message, setMessage] = useState<string>("Starting checkout...");

  useEffect(() => {
    const startCheckout = async () => {
      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });
        const data = await response.json();
        if (data?.url) {
          window.location.href = data.url as string;
        } else {
          setMessage(data?.error || "Unable to start checkout.");
        }
      } catch {
        setMessage("Unable to start checkout.");
      }
    };

    void startCheckout();
  }, [plan]);

  return (
    <div className="container" style={{ display: "flex", justifyContent: "center", paddingTop: "60px" }}>
      <div className="accountCard" style={{ textAlign: "center" }}>
        <p style={{ color: "var(--text-mid)" }}>{message}</p>
      </div>
    </div>
  );
}
