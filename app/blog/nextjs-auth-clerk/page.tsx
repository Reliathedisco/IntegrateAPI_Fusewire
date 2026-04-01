export default function ClerkGuidePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">
        Best Way to Add Auth to Next.js (Clerk Setup)
      </h1>

      <p className="mt-5 text-base text-gray-700">
        Auth is always annoying. The edge cases around sessions, cookies, and
        security take more time than most teams expect.
      </p>

      <h2 className="mt-10 text-xl font-semibold">The usual problems</h2>
      <p className="mt-3 text-base text-gray-700">
        You end up wiring middleware, protecting routes, handling callbacks, and
        debugging local vs production behavior.
      </p>

      <h2 className="mt-10 text-xl font-semibold">Traditional approach</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 text-base text-gray-700">
        <li>Choose a provider and read multiple setup guides.</li>
        <li>Configure environment variables and callbacks.</li>
        <li>Build sign-in and sign-up pages from scratch.</li>
        <li>Debug protected routes and session state.</li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold">Fastest way</h2>
      <p className="mt-3 text-base text-gray-700">
        Install a working auth system in one command:
      </p>
      <pre className="mt-4 rounded-md bg-gray-900 p-4 text-green-400">
        <code>npx integrateapi add clerk</code>
      </pre>

      <h2 className="mt-10 text-xl font-semibold">What gets installed</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 text-base text-gray-700">
        <li>Clerk provider setup with App Router support.</li>
        <li>Sign-in and sign-up routes already wired.</li>
        <li>Protected route patterns and auth helpers.</li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold">Benefits</h2>
      <p className="mt-3 text-base text-gray-700">
        You get a secure, production-ready auth flow without spending a day on
        plumbing. It stays flexible and easy to customize later.
      </p>

      <p className="mt-10 text-base font-semibold text-gray-900">
        Skip the setup and install a working auth system instantly.
      </p>
    </div>
  );
}
