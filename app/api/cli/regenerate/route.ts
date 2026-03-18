import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import client from "@/lib/db";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authToken = randomUUID();
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365); // 1 year

  try {
    await client.query(
      "UPDATE cli_auth_tokens SET status = 'expired' WHERE user_id = $1 AND status = 'verified'",
      [userId]
    );

    await client.query(
      "INSERT INTO cli_auth_tokens (token, user_id, status, auth_token, expires_at) VALUES ($1, $2, $3, $4, $5)",
      [token, userId, "verified", authToken, expiresAt.toISOString()]
    );

    return NextResponse.json({ authToken });
  } catch (error) {
    console.error("CLI regenerate: failed to create token", error);
    return NextResponse.json({ error: "Failed to generate API key" }, { status: 500 });
  }
}
