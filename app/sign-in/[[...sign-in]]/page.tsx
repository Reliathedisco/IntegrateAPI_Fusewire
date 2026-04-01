import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

type SignInPageProps = {
  searchParams: Promise<{
    redirect?: string;
    redirect_url?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const redirectTarget = params?.redirect || params?.redirect_url || "/account";

  if (params?.redirect && !params?.redirect_url) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(redirectTarget)}`);
  }

  return (
    <div className="container" style={{ display: "flex", justifyContent: "center", paddingTop: "60px" }}>
      <SignIn redirectUrl={redirectTarget} afterSignInUrl={redirectTarget} />
    </div>
  );
}
