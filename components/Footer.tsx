import Link from "next/link";
import { Container } from "@/components/ui/Container";

const groups: Array<{ heading: string; links: Array<{ href: string; label: string; external?: boolean }> }> = [
  {
    heading: "Product",
    links: [
      { href: "/templates", label: "Templates" },
      { href: "/registry", label: "Registry" },
      { href: "/stacks", label: "Stacks" },
      { href: "/stress-test", label: "Stress Test" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { href: "/docs", label: "CLI Docs" },
      { href: "/get-started", label: "Get Started" },
      { href: "/support", label: "Support" },
    ],
  },
  {
    heading: "Source",
    links: [
      {
        href: "https://github.com/Reliathedisco/IntegrateAPI_Fusewire",
        label: "GitHub",
        external: true,
      },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-paper-soft py-14">
      <Container>
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-semibold tracking-tight text-ink"
            >
              <span className="size-1.5 rounded-full bg-accent" />
              IntegrateAPI
            </Link>
            <p className="mt-3 max-w-xs text-sm/6 text-mute">
              Ship integrations, not glue. One CLI command, typed code in your repo,
              no SDK lock-in.
            </p>
          </div>

          {groups.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-faint">
                {group.heading}
              </p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {group.links.map((link) =>
                  link.external ? (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-mute transition-colors hover:text-ink"
                      >
                        {link.label}
                      </a>
                    </li>
                  ) : (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-mute transition-colors hover:text-ink"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <p className="text-xs text-faint">
            © {new Date().getFullYear()} Reli Music LLC. All rights reserved.
          </p>
          <p className="font-mono text-xs text-faint">
            ship integrations, not glue
          </p>
        </div>
      </Container>
    </footer>
  );
}
