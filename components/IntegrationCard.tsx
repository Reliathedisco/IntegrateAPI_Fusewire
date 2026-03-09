"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Integration } from "@/lib/types";

interface Props {
  integration: Integration;
  showInstallCommand?: boolean;
}

export default function IntegrationCard({
  integration,
  showInstallCommand = false,
}: Props) {
  const pathname = usePathname();
  const isActive = pathname === `/integrations/${integration.slug}`;

  const content = (
    <>
      <div className="cardHeader">
        <h3>{integration.name}</h3>
        <span className={`tier tier-${integration.tier}`}>{integration.tier}</span>
        {integration.comingSoon && (
          <span className="badgeComingSoon">Coming soon</span>
        )}
      </div>
      <p>{integration.shortDescription || integration.description}</p>
      {showInstallCommand && !integration.comingSoon && (
        <code className="cardCommand">{integration.installCommand}</code>
      )}
      <div className="category">{integration.category}</div>
    </>
  );

  if (integration.comingSoon) {
    return (
      <div className="card cardDisabled" aria-disabled>
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/integrations/${integration.slug}`}
      className={`card cardLink ${isActive ? "cardActive" : ""}`}
    >
      {content}
    </Link>
  );
}
