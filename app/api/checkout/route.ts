import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { logger } from "@/lib/logger";
import Stripe from "stripe";

export async function POST() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      logger.error("Checkout: Unauthorized - no userId or user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      logger.error("Checkout: STRIPE_PRICE_ID not configured");
      return NextResponse.json(
        { error: "Stripe price not configured" },
        { status: 500 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      logger.error("Checkout: STRIPE_SECRET_KEY not configured");
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
    logger.info("Creating checkout session", {
      userId,
      email: user.primaryEmailAddress?.emailAddress,
      priceId,
      appUrl,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      customer_email: user.primaryEmailAddress?.emailAddress,
      metadata: {
        clerkUserId: userId,
      },
      success_url: `${appUrl}/account?success=true`,
      cancel_url: `${appUrl}/account?canceled=true`,
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
