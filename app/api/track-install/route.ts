import { NextResponse } from "next/server";
import { initDb } from "@/lib/db";
import { resolveUserId } from "@/app/api/_utils/auth";

export async function POST(req: Request) {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await initDb();
    if (!client) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    await client.query(
      `
      INSERT INTO user_usage (user_id, installs_count, updated_at)
      VALUES ($1, 1, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET installs_count = user_usage.installs_count + 1, updated_at = NOW()
      `,
      [userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to track install" }, { status: 500 });
  }
}
