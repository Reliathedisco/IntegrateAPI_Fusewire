import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getStripe, stripe } from "@/lib/stripe";
import { logger } from "@/lib/logger";
import Stripe from "stripe";

type CheckoutPlan = "lifetime" | "subscription";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      logger.error("Checkout: Unauthorized - no userId or user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      logger.error("Checkout: STRIPE_SECRET_KEY not configured");
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 500 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as { plan?: unknown };
    const plan: CheckoutPlan =
      body.plan === "subscription" ? "subscription" : "lifetime";

    const lifetimePriceId =
      process.env.STRIPE_LIFETIME_PRICE_ID || process.env.STRIPE_PRICE_ID;
    const subscriptionPriceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;

    const priceId =
      plan === "subscription" ? subscriptionPriceId : lifetimePriceId;

    if (!priceId) {
      logger.error("Checkout: Stripe price not configured", {
        plan,
        hasLifetimePrice: Boolean(lifetimePriceId),
        hasSubscriptionPrice: Boolean(subscriptionPriceId),
      });
      return NextResponse.json(
        { error: "Stripe price not configured" },
        { status: 500 }
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      new URL(req.url).origin;

    const successUrl = new URL("/account", "https://integrateapi.io");
    successUrl.searchParams.set("success", "true");

    const cancelUrl = new URL("/", appUrl);
    cancelUrl.hash = "pricing";

    logger.info("Creating checkout session", {
      userId,
      email: user.primaryEmailAddress?.emailAddress,
      plan,
      priceId,
      appUrl,
    });

    const customerId = user.publicMetadata?.stripeCustomerId as string | undefined;

    const price = await getStripe().prices.retrieve(priceId);
    const priceType = price.type || (price.recurring ? "recurring" : "one_time");

    if (plan === "subscription" && priceType !== "recurring") {
      logger.error("Checkout: Subscription plan requires recurring price", {
        plan,
        priceId,
        priceType,
      });
      return NextResponse.json(
        { error: "Subscription plan requires a recurring price" },
        { status: 400 }
      );
    }

    if (plan === "lifetime" && priceType !== "one_time") {
      logger.error("Checkout: Lifetime plan requires one-time price", {
        plan,
        priceId,
        priceType,
      });
      return NextResponse.json(
        { error: "Lifetime plan requires a one-time price" },
        { status: 400 }
      );
    }

    const sessionMode: Stripe.Checkout.SessionCreateParams.Mode =
      plan === "subscription" ? "subscription" : "payment";

    const session = await stripe.checkout.sessions.create({
      mode: sessionMode,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      ...(customerId ? { customer: customerId } : {}),
      ...(customerId ? {} : { customer_email: user.primaryEmailAddress?.emailAddress }),
      client_reference_id: userId,
      metadata: {
        clerkUserId: userId,
        plan,
      },
      ...(plan === "subscription"
        ? {
            subscription_data: {
              metadata: {
                clerkUserId: userId,
                plan,
              },
            },
          }
        : {}),
      success_url: successUrl.toString(),
      cancel_url: cancelUrl.toString(),
    });

    logger.info("Checkout session created", { sessionId: session.id });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      logger.error("Stripe API error", {
        type: error.type,
        code: error.code,
        message: error.message,
        param: error.param,
      });
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 500 }
      );
    }
    
    logger.error("Checkout error", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
