"use client";

import { useClerkUiEnabled } from "@/components/ClerkGate";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const clerkUi = useClerkUiEnabled();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <nav className="nav">
      <Link href="/" className="logo">
        <span className="logo-dot"></span>
        IntegrateAPI
      </Link>
      <div className="links">
        <Link
          href="/templates"
          className={isActive("/templates") || isActive("/integrations") || isActive("/stacks") ? "active" : ""}
        >
          Templates
        </Link>
        <Link
          href="/stress-test"
          className={isActive("/stress-test") ? "active" : ""}
        >
          Stress Test
        </Link>
        <Link
          href="/registry"
          className={isActive("/registry") ? "active" : ""}
        >
          Registry
        </Link>
        <Link
          href="/get-started"
          className={isActive("/get-started") ? "active" : ""}
        >
          Get Started
        </Link>
        <Link href="/docs" className={isActive("/docs") ? "active" : ""}>
          Docs
        </Link>
        <Link
          href="/support"
          className={isActive("/support") ? "active" : ""}
        >
          Support
        </Link>
        {clerkUi ? (
          <>
            <SignedIn>
              <Link
                href="/account"
                className={isActive("/account") ? "active" : ""}
              >
                Account
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <Link
                href="/sign-in"
                className={isActive("/sign-in") ? "active" : ""}
              >
                Sign In
              </Link>
            </SignedOut>
          </>
        ) : (
          <Link href="/sign-in" className={isActive("/sign-in") ? "active" : ""}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
