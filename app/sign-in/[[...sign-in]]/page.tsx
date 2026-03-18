import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
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
