"use server";

import pool from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";

interface CliAuthToken {
  auth_token: string | null;
}

export async function getCliAuthToken(userId: string): Promise<string | null> {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query<CliAuthToken>(
      "SELECT auth_token FROM cli_auth_tokens WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 1",
      [userId, "verified"]
    );
    return result.rows[0]?.auth_token || null;
  } catch (error) {
    console.error("Account: failed to load CLI auth token", error);
    return null;
  } finally {
    if (client) client.release();
  }
}

export async function regenerateCliAuthToken(userId: string) {
  let client;
  try {
    client = await pool.connect();

    await client.query(
      "UPDATE cli_auth_tokens SET status = 'expired' WHERE user_id = $1 AND status = 'verified'",
      [userId]
    );

    const newToken = uuidv4();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365);

    await client.query(
      "INSERT INTO cli_auth_tokens (token, user_id, status, auth_token, expires_at) VALUES ($1, $2, $3, $4, $5)",
      [uuidv4(), userId, "verified", newToken, expiresAt.toISOString()]
    );

    revalidatePath("/account");
    return newToken;
  } catch (error) {
    console.error("Account: failed to regenerate CLI auth token", error);
    throw error;
  } finally {
    if (client) client.release();
  }
}
