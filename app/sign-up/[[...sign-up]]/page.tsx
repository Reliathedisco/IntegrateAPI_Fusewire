import { SignUp } from "@clerk/nextjs";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { isClerkConfigured } from "@/lib/clerk-keys";

const clerkAppearance = {
  variables: {
    colorPrimary: "#1d4ed8",
    colorText: "#0a0a0a",
    colorTextSecondary: "#52525b",
    colorBackground: "#ffffff",
    colorInputBackground: "#faf9f6",
    colorInputText: "#0a0a0a",
    borderRadius: "12px",
    fontFamily: "'DM Sans', ui-sans-serif, system-ui, sans-serif",
  },
  elements: {
    card: "shadow-sm border border-[rgba(10,10,10,0.07)] rounded-2xl",
    headerTitle: "font-semibold tracking-tight",
    formButtonPrimary:
      "bg-[#0a0a0a] hover:bg-[#18181b] rounded-full normal-case font-medium",
    socialButtonsBlockButton:
      "border border-[rgba(10,10,10,0.12)] rounded-full",
    footerActionLink: "text-[#1d4ed8] hover:text-[#1e40af]",
  },
} as const;

export default function SignUpPage() {
  if (!isClerkConfigured()) {
    return (
      <section className="py-20">
        <Container size="sm">
          <Eyebrow>Local dev notice</Eyebrow>
          <h1 className="mt-3 font-sans text-3xl/[1.1] font-semibold tracking-tight text-ink">
            Sign up unavailable locally.
          </h1>
          <p className="mt-4 text-sm/6 text-mute">
            Add Development Clerk keys to{" "}
            <code className="rounded-sm bg-paper-soft px-1.5 py-0.5 font-mono text-[12px] text-ink">
              .env.local
            </code>
            :{" "}
            <code className="rounded-sm bg-paper-soft px-1.5 py-0.5 font-mono text-[12px] text-ink">
              NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV
            </code>{" "}
            and{" "}
            <code className="rounded-sm bg-paper-soft px-1.5 py-0.5 font-mono text-[12px] text-ink">
              CLERK_SECRET_KEY_DEV
            </code>
            . Production keys stay on Vercel only.
          </p>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20">
      <Container size="sm">
        <div className="mx-auto flex max-w-md justify-center">
          <SignUp appearance={clerkAppearance} />
        </div>
      </Container>
    </section>
  );
}
