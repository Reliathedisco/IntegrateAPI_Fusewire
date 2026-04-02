import { NextRequest, NextResponse } from "next/server";
import { getTemplate } from "@/lib/templates";
import { getIntegrationBySlug } from "@/lib/data";
import pool from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: PageProps) {
  const { id } = await params;

  const integration = getIntegrationBySlug(id);
  if (!integration || integration.comingSoon) {
    return NextResponse.json({ error: `Integration "${id}" not found` }, { status: 404 });
  }

  const template = getTemplate(id);
  if (!template) {
    return NextResponse.json({ error: `No template available for "${id}"` }, { status: 404 });
  }

  if (template.tier === "pro") {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "Pro integration requires authentication",
          tier: "pro",
          price: "$9/mo or $29 lifetime",
          upgrade_url: "https://integrateapi.io/#pricing",
          features: integration.features,
          time_saved: "5+ hours",
        },
        { status: 402 }
      );
    }

    const token = authHeader.slice(7);
    let client;
    try {
      client = await pool.connect();
      const result = await client.query(
        "SELECT user_id FROM cli_auth_tokens WHERE auth_token = $1 AND status = 'verified'",
        [token]
      );

      const row = result.rows[0];
      if (!row?.user_id) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
      }

      const clerk = await clerkClient();
      const user = await clerk.users.getUser(row.user_id);
      const isPro =
        user.publicMetadata?.hasLifetimePro === true ||
        user.publicMetadata?.isPro === true ||
        ["active", "trialing"].includes(user.publicMetadata?.subscriptionStatus as string || "");

      if (!isPro) {
        return NextResponse.json(
          {
            error: "Pro plan required",
            tier: "pro",
            price: "$9/mo or $29 lifetime",
            upgrade_url: "https://integrateapi.io/#pricing",
            features: integration.features,
            time_saved: "5+ hours",
          },
          { status: 402 }
        );
      }
    } catch (error) {
      console.error("templates: auth check failed", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    } finally {
      if (client) client.release();
    }
  }

  return NextResponse.json({
    files: template.files,
    tier: template.tier,
  });
}
