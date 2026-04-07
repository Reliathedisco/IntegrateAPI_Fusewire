import { ClerkGate } from "@/components/ClerkGate";
import Navigation from "@/components/Navigation";
import {
  effectiveClerkPublishableKey,
  effectiveClerkSecretKey,
} from "@/lib/clerk-keys";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IntegrateAPI — Build SaaS integrations faster",
  description:
    "Install production-ready integrations for your Next.js app with one CLI command.",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pk = effectiveClerkPublishableKey();
  const sk = effectiveClerkSecretKey();
  const clerkEnabled = Boolean(pk && sk);

  if (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()?.startsWith(
      "pk_live_",
    ) &&
    !(
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV?.trim() &&
      process.env.CLERK_SECRET_KEY_DEV?.trim()
    )
  ) {
    console.warn(
      "[IntegrateAPI] Clerk production keys do not work on localhost. Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV and CLERK_SECRET_KEY_DEV to .env.local (same Clerk Development instance). Vercel production still uses only the main keys.",
    );
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClerkGate enabled={clerkEnabled} publishableKey={pk}>
          <div className="app">
            <Navigation />
            <main>{children}</main>
          </div>
        </ClerkGate>
      </body>
    </html>
  );
}
