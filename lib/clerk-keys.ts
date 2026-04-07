/**
 * Resolved Clerk keys for this process.
 *
 * **Production** (`NODE_ENV === "production"`): only the main env vars — never `_DEV`.
 * Matches Vercel / integrateapi.io; production is never changed by dev-only logic.
 *
 * **Development** (`next dev`): if `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV` and
 * `CLERK_SECRET_KEY_DEV` are both set, those are used. Otherwise,
 * production-shaped keys (`pk_live_` / `sk_live_`) are ignored on localhost so Clerk
 * does not initialize with the wrong domain. Use `pk_test_` / `sk_test_` in the main
 * vars, or add the `_DEV` pair alongside live keys.
 */

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function effectiveClerkPublishableKey(): string | undefined {
  if (isProduction()) {
    return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
  }

  const devPk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV?.trim();
  const devSk = process.env.CLERK_SECRET_KEY_DEV?.trim();
  if (devPk && devSk) {
    return devPk;
  }

  const main = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
  if (main?.startsWith("pk_live_")) {
    return undefined;
  }
  return main;
}

export function effectiveClerkSecretKey(): string | undefined {
  if (isProduction()) {
    return process.env.CLERK_SECRET_KEY?.trim();
  }

  const devPk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV?.trim();
  const devSk = process.env.CLERK_SECRET_KEY_DEV?.trim();
  if (devPk && devSk) {
    return devSk;
  }

  const main = process.env.CLERK_SECRET_KEY?.trim();
  if (main?.startsWith("sk_live_")) {
    return undefined;
  }
  return main;
}

export function isClerkConfigured(): boolean {
  return Boolean(
    effectiveClerkPublishableKey() && effectiveClerkSecretKey(),
  );
}
