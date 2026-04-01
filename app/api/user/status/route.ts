import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { resolveUserId } from "@/app/api/_utils/auth";

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
      return NextResponse.json({ isPro: false, plan: "free" });
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

    const plan =
      user.publicMetadata?.plan === "pro" || isPro ? "pro" : "free";

    return NextResponse.json({ isPro, plan });
  } catch (error) {
    return NextResponse.json({ isPro: false, plan: "free" }, { status: 500 });
  }
}
