import { SignIn } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/clerk-keys";

export default function SignInPage() {
  if (!isClerkConfigured()) {
    return (
      <div
        className="container"
        style={{ paddingTop: "60px", maxWidth: "520px" }}
      >
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 400, marginBottom: "12px" }}>
          Sign in unavailable locally
        </h1>
        <p style={{ color: "var(--text-dim)", lineHeight: 1.6 }}>
          Production Clerk keys only work on integrateapi.io. For local development, add{" "}
          <code style={{ color: "var(--text-mid)" }}>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV</code>{" "}
          and <code style={{ color: "var(--text-mid)" }}>CLERK_SECRET_KEY_DEV</code> to{" "}
          <code style={{ color: "var(--text-mid)" }}>.env.local</code> (Development instance keys
          from the Clerk dashboard), then restart <code style={{ color: "var(--text-mid)" }}>npm run dev</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="container" style={{ display: "flex", justifyContent: "center", paddingTop: "60px" }}>
      <div style={{ maxWidth: "420px", width: "100%" }}>
        <p style={{ color: "#d1d5db", marginBottom: "16px" }}>
          First time signing in? Use 'Email code' instead of password — we recently upgraded our auth system.
        </p>
        <SignIn />
      </div>
    </div>
  );
}
