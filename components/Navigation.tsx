"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Navigation() {
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
        <Link href="/docs" className={isActive("/docs") ? "active" : ""}>
          Docs
        </Link>
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
          <Link href="/sign-in" className={isActive("/sign-in") ? "active" : ""}>
            Sign In
          </Link>
        </SignedOut>
      </div>
    </nav>
  );
}
