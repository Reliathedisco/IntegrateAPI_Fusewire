import { randomUUID } from 'crypto';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { initDb } from '@/lib/db';

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
      <div className="container" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="accountCard" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-mid)' }}>This login link is invalid or expired.</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    const redirectUrl = `/cli/auth?token=${encodeURIComponent(token)}`;
    redirect(`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`);
  }

  let message = '';
  let status: 'success' | 'error' | 'info' = 'info';

  try {
    const client = await initDb();
    if (!client) {
      message = 'Database not configured.';
      status = 'error';
      return (
        <div className="container" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="accountCard" style={{ textAlign: 'center', maxWidth: '440px' }}>
            <p className="section-label center" style={{ marginBottom: '12px' }}>CLI Authentication</p>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>CLI Authentication</h1>
            <p style={{ color: '#fca5a5' }}>{message}</p>
          </div>
        </div>
      );
    }

    const result = await client.query<CliAuthToken>(
      'SELECT * FROM cli_auth_tokens WHERE token = $1',
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
      message = 'This login link is invalid or expired.';
      status = 'error';
    } else if (cliAuthToken.status === 'verified') {
      message = 'Already authenticated.';
      status = 'info';
    } else if (cliAuthToken.status === 'pending') {
      const newAuthToken = `sk_live_${randomUUID()}`;
      await client.query(
        'UPDATE cli_auth_tokens SET status = $1, user_id = $2, auth_token = $3 WHERE id = $4',
        ['verified', userId, newAuthToken, cliAuthToken.id]
      );
      message = "You're authenticated! You can close this window.";
      status = 'success';
    } else {
      message = 'This login link is invalid or expired.';
      status = 'error';
    }
  } catch (error) {
    console.error('Error in /cli/auth page:', error);
    message = 'An error occurred during authentication.';
    status = 'error';
  }

  return (
    <div className="container" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="accountCard" style={{ textAlign: 'center', maxWidth: '440px' }}>
        <p className="section-label center" style={{ marginBottom: '12px' }}>CLI Authentication</p>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>CLI Authentication</h1>
        <p
          style={{
            color:
              status === 'success'
                ? 'var(--green)'
                : status === 'error'
                  ? '#fca5a5'
                  : 'var(--text-mid)',
          }}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
