import { SignUp } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/clerk-keys";

export default function SignUpPage() {
  if (!isClerkConfigured()) {
    return (
      <div
        className="container"
        style={{ paddingTop: "60px", maxWidth: "520px" }}
      >
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 400, marginBottom: "12px" }}>
          Sign up unavailable locally
        </h1>
        <p style={{ color: "var(--text-dim)", lineHeight: 1.6 }}>
          Add Development Clerk keys to <code style={{ color: "var(--text-mid)" }}>.env.local</code>:{" "}
          <code style={{ color: "var(--text-mid)" }}>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV</code> and{" "}
          <code style={{ color: "var(--text-mid)" }}>CLERK_SECRET_KEY_DEV</code>. Production keys stay on
          Vercel only.
        </p>
      </div>
    );
  }

  return (
    <div className="container" style={{ display: "flex", justifyContent: "center", paddingTop: "60px" }}>
      <SignUp />
    </div>
  );
}
