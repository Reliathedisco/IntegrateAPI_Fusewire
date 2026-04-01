import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { initDb } from "@/lib/db";
import { resolveUserId } from "@/app/api/_utils/auth";

const MAX_FREE_INTEGRATIONS = 5;

type SubscriptionStatus =
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "paused";

export async function GET(req: Request) {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      return NextResponse.json({ allowed: false });
    }

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);

    const hasLifetimePro = user.publicMetadata?.hasLifetimePro === true;
    const subscriptionStatus = user.publicMetadata?.subscriptionStatus as
      | SubscriptionStatus
      | undefined;
    const subscriptionIsPro =
      subscriptionStatus === "active" ||
      subscriptionStatus === "trialing" ||
      subscriptionStatus === "past_due";
    const isPro =
      hasLifetimePro || subscriptionIsPro || user.publicMetadata?.isPro === true;

    if (isPro) {
      return NextResponse.json({
        allowed: true,
        installs: null,
        remaining: null,
      });
    }

    const client = await initDb();
    if (!client) {
      return NextResponse.json({ allowed: false }, { status: 500 });
    }

    const result = await client.query<{ installs_count: number }>(
      "SELECT installs_count FROM user_usage WHERE user_id = $1",
      [userId]
    );
    const installs = Number(result.rows[0]?.installs_count ?? 0);
    const remaining = Math.max(0, MAX_FREE_INTEGRATIONS - installs);
    const allowed = installs < MAX_FREE_INTEGRATIONS;

    return NextResponse.json({ allowed, installs, remaining });
  } catch (error) {
    return NextResponse.json({ allowed: false }, { status: 500 });
  }
}
