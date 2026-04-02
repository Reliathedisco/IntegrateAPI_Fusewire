import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

interface CliAuthToken {
  id: string;
  token: string;
  user_id: string | null;
  status: 'pending' | 'verified' | 'expired';
  auth_token: string | null;
  created_at: Date;
  expires_at: Date;
}

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function CliAuthPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        Invalid login link.
      </div>
    );
  }

  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/cli/auth?token=${token}`)}`);
  }

  let message = '';
  let authToken = null;

  let client;
  try {
    client = await pool.connect();

    const result = await client.query<CliAuthToken>(
      'SELECT * FROM cli_auth_tokens WHERE token = $1',
      [token]
    );
    const cliAuthToken = result.rows[0];

    if (!cliAuthToken || new Date(cliAuthToken.expires_at) < new Date()) {
      message = 'This login link is invalid or expired.';
    } else if (cliAuthToken.status === 'verified') {
      message = 'Already authenticated.';
      authToken = cliAuthToken.auth_token;
    } else if (cliAuthToken.status === 'pending') {
      const newAuthToken = uuidv4();
      await client.query(
        'UPDATE cli_auth_tokens SET status = $1, user_id = $2, auth_token = $3 WHERE id = $4',
        ['verified', userId, newAuthToken, cliAuthToken.id]
      );
      message = "You're authenticated! You can close this window.";
      authToken = newAuthToken;
    }
  } catch (error) {
    console.error('Error in /cli/auth page:', error);
    message = 'An error occurred during authentication.';
  } finally {
    if (client) client.release();
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>CLI Authentication</h1>
      <p style={{ fontSize: '1.1rem', textAlign: 'center' }}>{message}</p>
      {authToken && (
        <p style={{ fontSize: '0.875rem', marginTop: '1rem' }}>
          Your auth token: <code style={{ background: 'var(--card)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
            {'•'.repeat(authToken.length - 4)}{authToken.slice(-4)}
          </code>
        </p>
      )}
    </div>
  );
}
