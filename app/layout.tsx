import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
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
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const content = (
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
        <div className="app">
          <Navigation />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );

  if (!clerkKey) {
    return content;
  }

  return <ClerkProvider>{content}</ClerkProvider>;
}
