import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.slice(7);

  let client;
  try {
    client = await pool.connect();

    const result = await client.query(
      "SELECT user_id FROM cli_auth_tokens WHERE auth_token = $1 AND status = 'verified'",
      [token]
    );

    const row = result.rows[0];
    if (!row?.user_id) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(row.user_id);

    const isPro =
      user.publicMetadata?.hasLifetimePro === true ||
      user.publicMetadata?.isPro === true ||
      ["active", "trialing"].includes(user.publicMetadata?.subscriptionStatus as string || "");

    return NextResponse.json({
      email: user.emailAddresses[0]?.emailAddress,
      plan: isPro ? "pro" : "free",
    });
  } catch (error) {
    console.error("GET /api/account error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}
