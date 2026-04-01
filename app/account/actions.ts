"use server";

import { randomUUID } from 'crypto';
import { initDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

interface CliAuthToken {
  auth_token: string | null;
}

export async function getCliAuthToken(userId: string) {
  const client = await initDb();
  if (!client) {
    return null;
  }

  const result = await client.query<CliAuthToken>(
    'SELECT auth_token FROM cli_auth_tokens WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 1',
    [userId, 'verified']
  );
  return result.rows[0]?.auth_token || null;
}

export async function regenerateCliAuthToken(userId: string) {
  const client = await initDb();
  if (!client) {
    throw new Error('Database not configured');
  }

  // Invalidate old tokens (optional, can also just update the latest one)
  await client.query(
    'UPDATE cli_auth_tokens SET status = \'expired\' WHERE user_id = $1 AND status = \'verified\'',
    [userId]
  );

  // Create a new token
  const newToken = `sk_live_${randomUUID()}`;
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // For consistency, though account page token is persistent

  await client.query(
    'INSERT INTO cli_auth_tokens (token, user_id, status, auth_token, expires_at) VALUES ($1, $2, $3, $4, $5)',
    [randomUUID(), userId, 'verified', newToken, expiresAt.toISOString()]
  );
  revalidatePath('/account');
  return newToken;
}
