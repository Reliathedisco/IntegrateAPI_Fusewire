export default function OpenAIGuidePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">
        How to Add OpenAI to a Next.js App
      </h1>

      <p className="mt-5 text-base text-gray-700">
        Teams want AI in their apps, but setup is messy. Most of the time goes
        into wiring keys, request handlers, and error handling.
      </p>

      <h2 className="mt-10 text-xl font-semibold">The usual problems</h2>
      <p className="mt-3 text-base text-gray-700">
        Getting the API key into the right environment, structuring the server
        calls, and handling failures can slow you down fast.
      </p>

      <h2 className="mt-10 text-xl font-semibold">Fastest way</h2>
      <p className="mt-3 text-base text-gray-700">
        Install a working OpenAI integration in one command:
      </p>
      <pre className="mt-4 rounded-md bg-gray-900 p-4 text-green-400">
        <code>npx integrateapi add openai</code>
      </pre>

      <h2 className="mt-10 text-xl font-semibold">What you get</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 text-base text-gray-700">
        <li>Server-side OpenAI client setup.</li>
        <li>API route structure with clear input/output handling.</li>
        <li>Environment variable guidance for safe key storage.</li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold">Benefits</h2>
      <p className="mt-3 text-base text-gray-700">
        You get a fast, production-ready baseline without rewriting boilerplate.
        It is easy to expand once the first feature works.
      </p>

      <p className="mt-10 text-base font-semibold text-gray-900">
        Go from idea to working AI feature in minutes.
      </p>
    </div>
  );
}
