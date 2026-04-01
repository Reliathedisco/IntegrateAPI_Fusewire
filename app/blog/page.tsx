import Link from "next/link";

export default function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">IntegrateAPI Guides</h1>
      <p className="mt-3 text-lg text-gray-600">
        Practical guides for integrating SaaS tools into Next.js apps
      </p>

      <div className="mt-8 flex flex-col gap-4">
        <Link
          href="/blog/how-to-add-stripe-nextjs"
          className="text-base font-medium text-gray-900 hover:underline"
        >
          How to Add Stripe to Next.js (Fastest Way)
        </Link>
        <Link
          href="/blog/nextjs-auth-clerk"
          className="text-base font-medium text-gray-900 hover:underline"
        >
          Best Way to Add Auth to Next.js (Clerk Setup)
        </Link>
        <Link
          href="/blog/openai-nextjs-integration"
          className="text-base font-medium text-gray-900 hover:underline"
        >
          How to Add OpenAI to a Next.js App
        </Link>
      </div>
    </div>
  );
}
