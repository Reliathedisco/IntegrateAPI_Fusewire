import { auth, currentUser } from "@clerk/nextjs/server";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getCliAuthToken } from "./actions";
import AccountContent from "./AccountContent";

function AccountFallback() {
  return (
    <div className="mt-8 rounded-2xl border border-line bg-card p-6">
      <p className="text-sm text-mute">Loading...</p>
    </div>
  );
}

export default async function AccountPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return (
      <section className="py-16">
        <Container size="sm">
          <Eyebrow>Account</Eyebrow>
          <h1 className="mt-3 font-sans text-3xl/[1.1] font-semibold tracking-tight text-ink">
            Please log in.
          </h1>
        </Container>
      </section>
    );
  }

  const initialCliAuthToken = await getCliAuthToken(userId);

  return (
    <section className="py-12 md:py-16">
      <Container size="md">
        <header>
          <Eyebrow>Account</Eyebrow>
          <h1 className="mt-3 font-sans text-3xl/[1.1] font-semibold tracking-tight text-ink md:text-4xl/[1.05]">
            Your IntegrateAPI account
          </h1>
        </header>
        <Suspense fallback={<AccountFallback />}>
          <AccountContent
            initialCliAuthToken={initialCliAuthToken}
            userId={userId}
          />
        </Suspense>
      </Container>
    </section>
  );
}
