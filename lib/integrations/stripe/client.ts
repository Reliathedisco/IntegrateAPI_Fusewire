import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Create a checkout session
export async function createCheckoutSession(params: {
  priceId: string;
  successUrl: string;
  cancelUrl?: string;
  customerEmail?: string;
}) {
  return await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl || params.successUrl,
    customer_email: params.customerEmail,
  });
}

// Create a customer
export async function createCustomer(params: {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}) {
  return await stripe.customers.create(params);
}

// Get customer
export async function getCustomer(customerId: string) {
  return await stripe.customers.retrieve(customerId);
}