import { ClerkGate } from "@/components/ClerkGate";
import { Footer } from "@/components/Footer";
import Navigation from "@/components/Navigation";
import {
  effectiveClerkPublishableKey,
  effectiveClerkSecretKey,
} from "@/lib/clerk-keys";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IntegrateAPI — Ship integrations, not glue",
  description:
    "Production-ready integrations installed into your project with one CLI command. Stripe, Slack, Shopify, Notion, HubSpot — you own the code.",
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
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()?.startsWith("pk_live_") &&
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
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-dvh flex-col bg-paper text-ink antialiased">
        <ClerkGate enabled={clerkEnabled} publishableKey={pk}>
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
        </ClerkGate>
      </body>
    </html>
  );
}
