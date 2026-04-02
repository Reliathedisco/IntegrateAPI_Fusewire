import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { randomUUID } from "crypto";

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function GET(_req: NextRequest, { params }: PageProps) {
  const { code } = await params;

  if (!code || code.length !== 6) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  let client;
  try {
    client = await pool.connect();

    const result = await client.query(
      "SELECT id, email, user_id, used, expires_at FROM verification_codes WHERE code = $1 ORDER BY created_at DESC LIMIT 1",
      [code]
    );

    const row = result.rows[0];

    if (!row) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 401 });
    }

    if (row.used) {
      return NextResponse.json({ error: "Code already used" }, { status: 401 });
    }

    if (new Date(row.expires_at) < new Date()) {
      return NextResponse.json({ error: "Code expired" }, { status: 401 });
    }

    await client.query("UPDATE verification_codes SET used = TRUE WHERE id = $1", [row.id]);

    await client.query(
      "UPDATE cli_auth_tokens SET status = 'expired' WHERE user_id = $1 AND status = 'verified'",
      [row.user_id]
    );

    const authToken = randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365);

    await client.query(
      "INSERT INTO cli_auth_tokens (token, user_id, status, auth_token, expires_at) VALUES ($1, $2, $3, $4, $5)",
      [randomUUID(), row.user_id, "verified", authToken, expiresAt.toISOString()]
    );

    const isPro = await checkIfPro(client, row.user_id);

    return NextResponse.json({
      authToken,
      email: row.email,
      plan: isPro ? "pro" : "free",
    });
  } catch (error) {
    console.error("verify: error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}

async function checkIfPro(client: any, userId: string): Promise<boolean> {
  try {
    const { clerkClient } = await import("@clerk/nextjs/server");
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    return (
      user.publicMetadata?.hasLifetimePro === true ||
      user.publicMetadata?.isPro === true ||
      ["active", "trialing"].includes(user.publicMetadata?.subscriptionStatus as string || "")
    );
  } catch {
    return false;
  }
}
