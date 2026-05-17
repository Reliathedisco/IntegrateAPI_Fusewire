"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Account page error", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <section className="py-16 md:py-20">
      <Container size="md">
        <Eyebrow>Account</Eyebrow>
        <h1 className="mt-3 font-sans text-3xl/[1.1] font-semibold tracking-tight text-ink">
          Something went wrong.
        </h1>
        <div className="mt-8 max-w-md rounded-2xl border border-line bg-card p-6">
          <p className="text-sm text-ink">
            We couldn&apos;t load your account.
          </p>
          <p className="mt-2 text-sm/6 text-mute">
            This can happen during brief connection drops — retrying usually
            fixes it.
          </p>
          <div className="mt-5">
            <Button variant="accent" onClick={reset}>
              Try again
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
