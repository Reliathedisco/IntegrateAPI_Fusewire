import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { clerkClient } from '@clerk/nextjs/server';

interface CliAuthToken {
  user_id: string;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cliAuthToken = authHeader.split(' ')[1];

  let client;
  try {
    client = await pool.connect();

    const result = await client.query<CliAuthToken>(
      'SELECT user_id FROM cli_auth_tokens WHERE auth_token = $1 AND status = $2',
      [cliAuthToken, 'verified']
    );

    const tokenEntry = result.rows[0];

    if (!tokenEntry || !tokenEntry.user_id) {
      return NextResponse.json({ error: 'Invalid or expired CLI auth token' }, { status: 401 });
    }

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(tokenEntry.user_id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isPro =
      user.publicMetadata?.hasLifetimePro === true ||
      user.publicMetadata?.isPro === true ||
      ["active", "trialing"].includes((user.publicMetadata?.subscriptionStatus as string) ?? "");

    return NextResponse.json({
      email: user.emailAddresses[0]?.emailAddress,
      planTier: isPro ? 'pro' : 'free',
    });
  } catch (error) {
    console.error('Error in /api/cli/me:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}
