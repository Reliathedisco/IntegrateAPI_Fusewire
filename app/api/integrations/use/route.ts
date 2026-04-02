import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const MAX_FREE_INTEGRATIONS = 5;

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const isPro =
    user.publicMetadata?.hasLifetimePro === true ||
    user.publicMetadata?.isPro === true ||
    ["active", "trialing"].includes((user.publicMetadata?.subscriptionStatus as string) ?? "");

  if (isPro) {
    return NextResponse.json({ ok: true });
  }

  const used = (user.publicMetadata?.usedIntegrations as number) || 0;

  if (used >= MAX_FREE_INTEGRATIONS) {
    return NextResponse.json(
      { error: "limit_reached", message: "Upgrade to Pro for unlimited integrations." },
      { status: 403 }
    );
  }

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...user.publicMetadata,
      usedIntegrations: used + 1,
    },
  });

  return NextResponse.json({ ok: true, used: used + 1 });
}
