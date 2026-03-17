# Stripe Integration

## Setup

1. Get your API keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Add to `.env.local`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## Usage

```typescript
import { createCheckoutSession } from '@/lib/integrations/stripe/client';

const session = await createCheckoutSession({
  priceId: 'price_...',
  successUrl: 'https://yoursite.com/success',
  customerEmail: 'user@example.com',
});

// Redirect to session.url
```

## Webhooks

Configure in Stripe Dashboard:
- Developers > Webhooks > Add endpoint
- URL: `https://yoursite.com/api/webhooks/stripe`
- Events: `checkout.session.completed`, `payment_intent.succeeded`