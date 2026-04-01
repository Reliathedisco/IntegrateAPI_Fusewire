export default function StripeGuidePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">
        How to Add Stripe to Next.js (Fastest Way)
      </h1>

      <p className="mt-5 text-base text-gray-700">
        Stripe setup is slow and often confusing. You have to stitch together
        pricing, webhooks, and auth, and then hope your API routes are correct.
      </p>

      <h2 className="mt-10 text-xl font-semibold">The usual problems</h2>
      <p className="mt-3 text-base text-gray-700">
        Most teams get stuck on webhook signing, environment configuration, and
        deciding where to place server-only logic.
      </p>

      <h2 className="mt-10 text-xl font-semibold">Traditional setup</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 text-base text-gray-700">
        <li>Manually create and wire API routes for checkout and webhooks.</li>
        <li>Copy boilerplate for the Stripe client and event verification.</li>
        <li>Track env vars across dev and production.</li>
        <li>Debug why a webhook never hits your endpoint.</li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold">Fastest way</h2>
      <p className="mt-3 text-base text-gray-700">
        Install Stripe the same way you install a package:
      </p>
      <pre className="mt-4 rounded-md bg-gray-900 p-4 text-green-400">
        <code>npx integrateapi add stripe</code>
      </pre>

      <h2 className="mt-10 text-xl font-semibold">What gets installed</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 text-base text-gray-700">
        <li>Typed Stripe client ready for server usage.</li>
        <li>Webhook handler with signature verification.</li>
        <li>Environment variable setup with the exact keys required.</li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold">Why this matters</h2>
      <p className="mt-3 text-base text-gray-700">
        You ship faster, keep a clean codebase, and you are not locked into a
        custom abstraction. Everything is standard Next.js and Stripe.
      </p>

      <p className="mt-10 text-base font-semibold text-gray-900">
        Install Stripe in minutes instead of hours.
      </p>
    </div>
  );
}
