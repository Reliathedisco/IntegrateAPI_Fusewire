import Stripe from 'stripe';

export type CheckoutSession = Stripe.Checkout.Session;
export type Customer = Stripe.Customer;
export type PaymentIntent = Stripe.PaymentIntent;