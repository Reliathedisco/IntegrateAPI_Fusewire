import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { getStripe, stripe } from '@/lib/stripe';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    if (!WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Stripe webhook secret not configured' }, { status: 500 });
    }

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const clerkUserId =
          session.client_reference_id || session.metadata?.clerkUserId;
        if (!clerkUserId) {
          console.warn('Checkout completed without clerk user id', session.id);
          break;
        }

        const clerk = await clerkClient();
        const user = await clerk.users.getUser(clerkUserId);
        const currentPublicMetadata = user.publicMetadata || {};

        const plan = session.metadata?.plan;
        const updates: Record<string, unknown> = {
          isPro: true,
          plan: 'pro',
          planTier: 'pro',
        };

        if (plan === 'lifetime') {
          updates.hasLifetimePro = true;
        }

        if (plan === 'subscription' && session.subscription) {
          try {
            const stripeClient = getStripe();
            const subscription = await stripeClient.subscriptions.retrieve(
              typeof session.subscription === 'string'
                ? session.subscription
                : session.subscription.id
            );
            updates.subscriptionStatus = subscription.status;
          } catch (error) {
            console.error('Failed to retrieve Stripe subscription', error);
          }
        }

        if (typeof session.customer === 'string') {
          updates.stripeCustomerId = session.customer;
        }

        await clerk.users.updateUserMetadata(clerkUserId, {
          publicMetadata: {
            ...currentPublicMetadata,
            ...updates,
          },
        });

        console.log('Checkout completed:', session.id);
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}