import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CheckoutClient from "./CheckoutClient";

type PageProps = {
  searchParams: Promise<{
    plan?: string;
  }>;
};

export default async function CheckoutPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const planParam = params?.plan;
  const plan = planParam === "lifetime" ? "lifetime" : "subscription";

  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/checkout?plan=${plan}`)}`);
  }

  return <CheckoutClient plan={plan} />;
}
