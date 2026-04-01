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
        <span className="logo-mark" aria-hidden="true">
          <svg viewBox="0 0 64 64" role="img" focusable="false">
            <defs>
              <linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f7e2a3" />
                <stop offset="45%" stopColor="#e2b763" />
                <stop offset="100%" stopColor="#b7792f" />
              </linearGradient>
            </defs>
            <path
              d="M20 44h-3c-6.1 0-11-4.9-11-11 0-5.6 4.2-10.2 9.8-10.9 1.9-6.9 8.2-12.1 15.7-12.1 7.5 0 13.8 5.2 15.7 12.1 5.6.7 9.8 5.3 9.8 10.9 0 6.1-4.9 11-11 11h-8"
              fill="none"
              stroke="url(#logoGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M30 24L22 40h10l-4 16 16-22H34l4-10z"
              fill="url(#logoGradient)"
            />
          </svg>
        </span>
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
        <Link href="/blog" className={isActive("/blog") ? "active" : ""}>
          Blog
        </Link>
        <Link
          href="/explainer"
          className={isActive("/explainer") ? "active" : ""}
        >
          Explainer
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
