import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripe, stripe } from "@/lib/stripe";
import { logger } from "@/lib/logger";
import { clerkClient } from "@clerk/nextjs/server";
import type Stripe from "stripe";

function isSubscriptionProStatus(status: Stripe.Subscription.Status): boolean {
  return status === "active" || status === "trialing" || status === "past_due";
}

async function updateClerkPublicMetadata(
  clerkUserId: string,
  updater: (current: Record<string, unknown>) => Record<string, unknown>
) {
  const client = await clerkClient();
  const user = await client.users.getUser(clerkUserId);
  const current = (user.publicMetadata ?? {}) as Record<string, unknown>;
  const next = updater(current);
  await client.users.updateUserMetadata(clerkUserId, { publicMetadata: next });
}

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error("Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error("Webhook signature verification failed", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const clerkUserId = session.metadata?.clerkUserId;
      const plan = session.metadata?.plan;

      if (!clerkUserId) {
        logger.warn("Stripe webhook: missing clerkUserId on session metadata", {
          sessionId: session.id,
        });
        return NextResponse.json({ received: true });
      }

      const stripeCustomerId =
        typeof session.customer === "string" ? session.customer : undefined;

      if (session.mode === "subscription" || plan === "subscription") {
        const stripeSubscriptionId =
          typeof session.subscription === "string" ? session.subscription : undefined;

        const stripeClient = getStripe();
        const subscription = stripeSubscriptionId
          ? await stripeClient.subscriptions.retrieve(stripeSubscriptionId)
          : null;

        await updateClerkPublicMetadata(clerkUserId, (current) => {
          const hasLifetimePro = current.hasLifetimePro === true;
          const subscriptionStatus = subscription?.status ?? "active";

          return {
            ...current,
            stripeCustomerId: stripeCustomerId ?? (current.stripeCustomerId as string | undefined),
            stripeSubscriptionId:
              stripeSubscriptionId ??
              (current.stripeSubscriptionId as string | undefined),
            subscriptionStatus,
            subscriptionCurrentPeriodEnd: subscription?.current_period_end,
            isPro: hasLifetimePro || isSubscriptionProStatus(subscriptionStatus),
            upgradedAt: new Date().toISOString(),
          };
        });

        logger.info("User subscription activated", {
          clerkUserId,
          stripeSubscriptionId,
        });
      } else {
        const stripePaymentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : undefined;

        await updateClerkPublicMetadata(clerkUserId, (current) => {
          return {
            ...current,
            hasLifetimePro: true,
            isPro: true,
            stripeCustomerId: stripeCustomerId ?? (current.stripeCustomerId as string | undefined),
            stripePaymentId: stripePaymentId ?? (current.stripePaymentId as string | undefined),
            upgradedAt: new Date().toISOString(),
          };
        });

        logger.info("User upgraded to lifetime Pro", { clerkUserId });
      }
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const clerkUserId = subscription.metadata?.clerkUserId;

      if (!clerkUserId) {
        logger.warn("Stripe webhook: missing clerkUserId on subscription metadata", {
          subscriptionId: subscription.id,
          status: subscription.status,
          eventType: event.type,
        });
        return NextResponse.json({ received: true });
      }

      const stripeCustomerId =
        typeof subscription.customer === "string" ? subscription.customer : undefined;

      await updateClerkPublicMetadata(clerkUserId, (current) => {
        const hasLifetimePro = current.hasLifetimePro === true;
        const subscriptionIsPro = isSubscriptionProStatus(subscription.status);

        return {
          ...current,
          stripeCustomerId: stripeCustomerId ?? (current.stripeCustomerId as string | undefined),
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          subscriptionCurrentPeriodEnd: subscription.current_period_end,
          isPro: hasLifetimePro || subscriptionIsPro,
          subscriptionUpdatedAt: new Date().toISOString(),
        };
      });

      logger.info("User subscription status updated", {
        clerkUserId,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        eventType: event.type,
      });
    }
  } catch (err) {
    logger.error("Stripe webhook handler error", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
