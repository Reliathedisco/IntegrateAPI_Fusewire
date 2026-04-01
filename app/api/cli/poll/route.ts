import { NextRequest, NextResponse } from 'next/server';
import { initDb } from '@/lib/db';

interface CliAuthToken {
  id: string;
  status: 'pending' | 'verified' | 'expired';
  auth_token: string | null;
  expires_at: Date;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ status: 'expired' }, { status: 400 });
    }

    const client = await initDb();
    if (!client) {
      return NextResponse.json({ status: 'expired' }, { status: 500 });
    }

    const result = await client.query<CliAuthToken>(
      'SELECT id, status, auth_token, expires_at FROM cli_auth_tokens WHERE token = $1',
      [token]
    );
    const cliAuthToken = result.rows[0];

    if (!cliAuthToken || new Date(cliAuthToken.expires_at) < new Date()) {
      if (cliAuthToken && cliAuthToken.status !== 'expired') {
        await client.query('UPDATE cli_auth_tokens SET status = $1 WHERE id = $2', [
          'expired',
          cliAuthToken.id,
        ]);
      }
      return NextResponse.json({ status: 'expired' });
    }

    if (cliAuthToken.status === 'verified' && cliAuthToken.auth_token) {
      return NextResponse.json({ status: 'verified', authToken: cliAuthToken.auth_token });
    }

    if (cliAuthToken.status === 'pending') {
      return NextResponse.json({ status: 'pending' });
    }

    return NextResponse.json({ status: 'expired' });
  } catch (error) {
    console.error('Error in /api/cli/poll:', error);
    return NextResponse.json({ status: 'expired' }, { status: 500 });
  }
}
