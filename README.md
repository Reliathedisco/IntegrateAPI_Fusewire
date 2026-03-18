# IntegrateAPI

Marketing site, integration registry, and account portal for the IntegrateAPI CLI. Built with Next.js 15, Clerk, and Stripe.

IntegrateAPI installs production-ready TypeScript integration code directly into your Next.js project. No SDK lock-in -- you own the code.

## Stack

- **Framework**: Next.js 15 (App Router)
- **Auth**: Clerk
- **Payments**: Stripe (checkout + webhooks)
- **Styling**: Custom CSS (no Tailwind)
- **Deployment**: Vercel

## Routes

| Route | Description |
|---|---|
| `/` | Landing page with terminal animation, feature cards, and CTA |
| `/templates` | Featured integrations browser |
| `/integrations` | Full searchable catalog (38 integrations, 11 categories) |
| `/integrations/[slug]` | Individual integration detail (install command, env vars, example code) |
| `/registry` | Alternative integration browser with category filters and inline modals |
| `/stress-test` | Landing page for the `integrateapi stress-test` CLI command |
| `/stacks` | Stack Builder -- preset bundles (SaaS Starter, AI SaaS, Marketplace, Internal Tool) |
| `/docs` | CLI reference (login, list, add, upgrade, account, scan, stack, doctor) |
| `/account` | Protected -- user plan, usage, and Stripe upgrade/billing |
| `/dashboard` | Redirects to `/account` |
| `/sign-in` | Clerk sign-in |
| `/sign-up` | Clerk sign-up |
| `/api/checkout` | Creates a Stripe Checkout session |
| `/api/newsletter` | Subscribes an email to FuseWire (Resend) |
| `/api/webhooks/stripe` | Handles Stripe `checkout.session.completed` events |

## Getting Started

```bash
npm install
cp .env.example .env.local
# Fill in your Clerk and Stripe keys in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` and fill in real values:

```
NEXT_PUBLIC_URL=https://your-domain.com
# Optional legacy fallback:
# NEXT_PUBLIC_APP_URL=https://your-domain.com

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

RESEND_API_KEY=re_...
RESEND_FUSEWIRE_SEGMENT_ID=78261eea-8f8b-4381-83c6-79fa7120f1cf
NEWSLETTER_FROM="FuseWire <newsletter@your-domain.com>"
NEWSLETTER_REPLY_TO="hello@your-domain.com"
```

`NEXT_PUBLIC_URL` (or `NEXT_PUBLIC_APP_URL`) is used for Stripe Checkout redirect URLs and the billing portal return URL. Set it to your production domain in deployment so Stripe redirects return users to the correct site.

FuseWire newsletter signups on the homepage are handled via Resend using the `/api/newsletter` route.

Clerk will show a **Development mode** badge when you use test keys. Before go-live, create a production Clerk instance and set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` to production keys in Vercel.

## Project Structure

```
app/
  layout.tsx            Root layout (ClerkProvider, Navigation, fonts)
  page.tsx              Landing page
  templates/page.tsx    Templates browser
  registry/page.tsx     Registry browser
  stress-test/page.tsx  Stress test landing
  stacks/page.tsx       Stack Builder
  integrations/
    page.tsx            Full integration catalog
    [slug]/page.tsx     Integration detail
  docs/page.tsx         CLI reference
  account/page.tsx      Account & billing (protected)
  sign-in/              Clerk sign-in
  sign-up/              Clerk sign-up
  api/
    checkout/route.ts       Stripe Checkout session creation
    newsletter/route.ts     FuseWire newsletter signup (Resend)
    webhooks/stripe/route.ts Stripe webhook handler

components/
  Navigation.tsx        Global nav bar
  IntegrationCard.tsx   Reusable integration card
  CodeBlock.tsx         Code display with copy button

lib/
  data.ts               Integration catalog (38 integrations)
  types.ts              TypeScript types
  stack-presets.ts      Stack preset definitions
  stripe.ts             Lazy Stripe client singleton
  logger.ts             Structured server-side logger

middleware.ts           Clerk auth middleware (protects /account only)
```

## Monetization

- **Free tier**: 5 integrations
- **Pro (subscription)**: $9/month, unlimited integrations
- **Pro (lifetime)**: $29 one-time, unlimited integrations

Checkout is handled via Stripe. On successful payment, a webhook updates the user's Clerk metadata (`isPro: true`). The account page polls for the metadata update after redirect.

## Deployment

The app is deployed to Vercel. All environment variables must be set in the Vercel project settings. The app degrades gracefully if Clerk keys are missing (renders without auth).

```bash
npm run build   # Verify clean build
vercel --prod   # Deploy to production
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
