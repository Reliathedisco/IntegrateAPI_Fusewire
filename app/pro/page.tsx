import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ProUpgradeClient from "./ProUpgradeClient";

export default async function ProPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent("/pro")}`);
  }

  return (
    <div className="container">
      <h1>Upgrade to Pro</h1>
      <p className="pageLead">
        Finish your upgrade to unlock unlimited integrations.
      </p>
      <ProUpgradeClient />
    </div>
  );
}
