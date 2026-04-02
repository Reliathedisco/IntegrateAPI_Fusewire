import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const PRO_SUBSCRIPTION_STATUSES = new Set(["active", "trialing", "past_due"]);

const DEFAULT_APP_URL = "https://integrateapi.io";

function getStripeObjectId(
  value:
    | string
    | Stripe.Customer
    | Stripe.DeletedCustomer
    | Stripe.Subscription
    | null
): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  return value.id;
}

async function sendProWelcomeEmail(
  session: Stripe.Checkout.Session,
  plan: "subscription" | "lifetime" | undefined
) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const replyTo = process.env.RESEND_REPLY_TO;

  if (!apiKey || !from) {
    console.log("Stripe webhook: Resend not configured");
    logger.warn("Stripe webhook: Resend not configured", {
      hasApiKey: Boolean(apiKey),
      hasFrom: Boolean(from),
    });
    return;
  }

  const email =
    session.customer_details?.email ||
    session.customer_email ||
    undefined;

  if (!email) {
    console.log("Stripe webhook: missing customer email");
    logger.warn("Stripe webhook: missing customer email", {
      sessionId: session.id,
    });
    return;
  }

  const planLabel = plan === "subscription" ? "monthly" : "lifetime";
  const appUrl =
    process.env.NEXT_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    DEFAULT_APP_URL;

  const accountUrl = `${appUrl.replace(/\/$/, "")}/account`;

  const html = `
    <div style="font-family: ui-sans-serif, system-ui; line-height: 1.5; color: #0a0a0a;">
      <h1 style="margin: 0 0 12px;">You're now on IntegrateAPI Pro</h1>
      <p style="margin: 0 0 12px;">
        Thanks for upgrading! Your plan is <strong>${planLabel}</strong>.
      </p>
      <p style="margin: 0 0 18px;">
        Manage your account here:
        <a href="${accountUrl}">${accountUrl}</a>
      </p>
    </div>
  `.trim();

  console.log("Stripe webhook: sending welcome email", { email, plan: planLabel });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "You're now on IntegrateAPI Pro",
      html,
      text: `You're now on IntegrateAPI Pro (${planLabel}). Manage your account: ${accountUrl}`,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.log("Stripe webhook: welcome email failed", {
      status: response.status,
      body,
    });
    logger.warn("Stripe webhook: welcome email failed", {
      status: response.status,
      body,
      email,
    });
    return;
  }

  console.log("Stripe webhook: welcome email sent", { email });
}

async function updateClerkUserMetadata(userId: string, updates: Record<string, unknown>) {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const existing =
    user.publicMetadata && typeof user.publicMetadata === "object"
      ? (user.publicMetadata as Record<string, unknown>)
      : {};

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...existing,
      ...updates,
    },
  });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log("Stripe webhook: checkout.session.completed start", {
    sessionId: session.id,
  });
  const clerkUserId = session.metadata?.clerkUserId || session.client_reference_id;
  if (!clerkUserId) {
    logger.error("Stripe webhook: missing clerk user id", { sessionId: session.id });
    return;
  }

  const planRaw = session.metadata?.plan;
  const plan: "subscription" | "lifetime" | undefined =
    planRaw === "subscription" ? "subscription" : planRaw === "lifetime" ? "lifetime" : undefined;

  const customerId = getStripeObjectId(session.customer as unknown as string | Stripe.Customer | null);
  const subscriptionId = getStripeObjectId(
    session.subscription as unknown as string | Stripe.Subscription | null
  );

  let subscriptionStatus: Stripe.Subscription.Status | undefined;
  if (plan === "subscription" && subscriptionId) {
    const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
    subscriptionStatus = subscription.status;
  }

  await updateClerkUserMetadata(clerkUserId, {
    ...(customerId ? { stripeCustomerId: customerId } : {}),
    isPro: true,
    ...(plan === "lifetime" ? { hasLifetimePro: true } : {}),
    ...(plan === "subscription"
      ? {
          subscriptionStatus: subscriptionStatus,
          stripeSubscriptionId: subscriptionId,
        }
      : {}),
  });

  await sendProWelcomeEmail(session, plan);

  logger.info("Stripe webhook: upgraded user", {
    clerkUserId,
    plan,
    customerId,
    subscriptionId,
    subscriptionStatus,
  });
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  console.log("Stripe webhook: subscription change", {
    subscriptionId: subscription.id,
    status: subscription.status,
  });
  const clerkUserId = subscription.metadata?.clerkUserId;
  if (!clerkUserId) {
    logger.warn("Stripe webhook: subscription missing clerk user id", {
      subscriptionId: subscription.id,
    });
    return;
  }

  const customerId = getStripeObjectId(subscription.customer as unknown as string | Stripe.Customer | null);
  const status = subscription.status;

  const client = await clerkClient();
  const user = await client.users.getUser(clerkUserId);
  const hasLifetimePro = user.publicMetadata?.hasLifetimePro === true;
  const isPro = hasLifetimePro || PRO_SUBSCRIPTION_STATUSES.has(status);

  await updateClerkUserMetadata(clerkUserId, {
    ...(customerId ? { stripeCustomerId: customerId } : {}),
    subscriptionStatus: status,
    stripeSubscriptionId: subscription.id,
    isPro,
  });

  logger.info("Stripe webhook: subscription updated", {
    clerkUserId,
    subscriptionId: subscription.id,
    status,
    isPro,
    customerId,
  });
}

async function processStripeEvent(event: Stripe.Event) {
  console.log("Stripe webhook: processing event", { type: event.type, id: event.id });
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(
        event.data.object as Stripe.Checkout.Session
      );
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await handleSubscriptionChange(event.data.object as Stripe.Subscription);
      break;
    default:
      logger.info("Stripe webhook: unhandled event type", { type: event.type });
  }
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error("Stripe webhook: STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Stripe webhook not configured" },
      { status: 500 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    logger.error("Stripe webhook: signature verification failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("Stripe webhook: event received", { type: event.type, id: event.id });

  try {
    await processStripeEvent(event);
  } catch (error) {
    logger.error("Stripe webhook: handler error", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: event.type,
    });
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}