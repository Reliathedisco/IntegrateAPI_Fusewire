import { auth } from "@clerk/nextjs/server";
import { initDb } from "@/lib/db";

export async function resolveUserId(req: Request): Promise<string | null> {
  const { userId } = await auth();
  if (userId) {
    return userId;
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return null;
  }

  const client = await initDb();
  if (!client) {
    return null;
  }

  const result = await client.query<{ user_id: string }>(
    "SELECT user_id FROM cli_auth_tokens WHERE auth_token = $1 AND status = $2",
    [token, "verified"]
  );

  return result.rows[0]?.user_id ?? null;
}
