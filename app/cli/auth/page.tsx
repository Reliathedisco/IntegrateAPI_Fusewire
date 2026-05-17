import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import client from "@/lib/db";

interface CliAuthToken {
  id: string;
  token: string;
  user_id: string | null;
  status: "pending" | "verified" | "expired";
  auth_token: string | null;
  created_at: Date;
  expires_at: Date;
}

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function CliAuthPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <section className="flex min-h-[60dvh] items-center justify-center py-24">
        <Container size="sm">
          <div className="mx-auto max-w-md rounded-2xl border border-danger/30 bg-danger/5 p-7 text-center">
            <Eyebrow>CLI authentication</Eyebrow>
            <p className="mt-3 text-base font-medium text-danger">
              Invalid login link.
            </p>
          </div>
        </Container>
      </section>
    );
  }

  if (!userId) {
    redirect(`/sign-in?redirect_url=/cli/auth?token=${token}`);
  }

  let message = "";
  let authToken: string | null = null;
  let status: "ok" | "error" | "expired" = "ok";

  try {
    const result = await client.query<CliAuthToken>(
      "SELECT * FROM cli_auth_tokens WHERE token = $1",
      [token],
    );
    const cliAuthToken = result.rows[0];

    if (!cliAuthToken || new Date(cliAuthToken.expires_at) < new Date()) {
      message = "This login link is invalid or expired.";
      status = "expired";
    } else if (cliAuthToken.status === "verified") {
      message = "Already authenticated.";
      authToken = cliAuthToken.auth_token;
    } else if (cliAuthToken.status === "pending") {
      const newAuthToken = uuidv4();
      await client.query(
        "UPDATE cli_auth_tokens SET status = $1, user_id = $2, auth_token = $3 WHERE id = $4",
        ["verified", userId, newAuthToken, cliAuthToken.id],
      );
      message = "You're authenticated. You can close this window.";
      authToken = newAuthToken;
    }
  } catch (error) {
    console.error("Error in /cli/auth page:", error);
    message = "An error occurred during authentication.";
    status = "error";
  }

  return (
    <section className="flex min-h-[60dvh] items-center justify-center py-24">
      <Container size="sm">
        <div className="mx-auto max-w-md rounded-2xl border border-line bg-card p-7 text-center">
          <Eyebrow>CLI authentication</Eyebrow>
          <h1 className="mt-3 font-sans text-2xl font-semibold tracking-tight text-ink">
            {status === "expired"
              ? "Link expired"
              : status === "error"
                ? "Something went wrong"
                : "All set"}
          </h1>
          <p className="mt-3 text-sm/6 text-mute">{message}</p>
          {authToken && (
            <div className="mt-6 rounded-lg border border-line bg-paper-soft p-4 text-left">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-faint">
                Auth token
              </p>
              <code className="mt-2 block break-all font-mono text-[12.5px] text-ink">
                {authToken}
              </code>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
