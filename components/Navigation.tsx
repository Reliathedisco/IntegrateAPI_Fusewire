"use client";

import { useClerkUiEnabled } from "@/components/ClerkGate";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { href: "/templates", label: "Templates", matches: ["/templates", "/integrations", "/stacks"] },
  { href: "/registry", label: "Registry", matches: ["/registry"] },
  { href: "/stress-test", label: "Stress Test", matches: ["/stress-test"] },
  { href: "/docs", label: "Docs", matches: ["/docs"] },
  { href: "/support", label: "Support", matches: ["/support"] },
];

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-3 py-1.5 text-sm font-medium tracking-tight transition-colors",
        active ? "bg-card text-ink shadow-xs" : "text-mute hover:text-ink",
      )}
    >
      {label}
    </Link>
  );
}

export default function Navigation() {
  const clerkUi = useClerkUiEnabled();
  const pathname = usePathname() ?? "/";

  const isActive = (paths: string[]) =>
    paths.some((p) => (p === "/" ? pathname === "/" : pathname.startsWith(p)));

  return (
    <nav className="sticky top-0 z-50 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-6 px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-ink transition-colors hover:text-ink-soft"
        >
          <span className="size-1.5 rounded-full bg-accent shadow-[0_0_8px_currentColor]" />
          IntegrateAPI
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              active={isActive(link.matches)}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          {clerkUi ? (
            <>
              <SignedIn>
                <Link
                  href="/account"
                  className={cn(
                    "hidden text-sm font-medium tracking-tight transition-colors sm:inline",
                    isActive(["/account"]) ? "text-ink" : "text-mute hover:text-ink",
                  )}
                >
                  Account
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <Link
                  href="/sign-in"
                  className="hidden text-sm font-medium tracking-tight text-mute transition-colors hover:text-ink sm:inline"
                >
                  Sign in
                </Link>
                <Link
                  href="/get-started"
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper shadow-xs transition hover:bg-ink-soft hover:-translate-y-px"
                >
                  Get started
                </Link>
              </SignedOut>
            </>
          ) : (
            <Link
              href="/get-started"
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper shadow-xs transition hover:bg-ink-soft hover:-translate-y-px"
            >
              Get started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
