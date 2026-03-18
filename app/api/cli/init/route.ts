import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 });
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await client.query(
      'INSERT INTO cli_auth_tokens (token, expires_at) VALUES ($1, $2)',
      [token, expiresAt.toISOString()]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in /api/cli/init:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
