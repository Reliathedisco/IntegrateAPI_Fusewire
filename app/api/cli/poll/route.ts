import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

interface CliAuthToken {
  status: 'pending' | 'verified' | 'expired';
  auth_token: string | null;
  expires_at: Date;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ status: 'expired' }, { status: 400 });
  }

  let client;
  try {
    client = await pool.connect();

    const result = await client.query<CliAuthToken>(
      'SELECT status, auth_token, expires_at FROM cli_auth_tokens WHERE token = $1',
      [token]
    );
    const cliAuthToken = result.rows[0];

    if (!cliAuthToken || new Date(cliAuthToken.expires_at) < new Date()) {
      return NextResponse.json({ status: 'expired' });
    }

    if (cliAuthToken.status === 'verified') {
      return NextResponse.json({ status: 'verified', authToken: cliAuthToken.auth_token });
    }

    return NextResponse.json({ status: 'pending' });
  } catch (error) {
    console.error('Error in /api/cli/poll:', error);
    return NextResponse.json({ status: 'expired' }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}
