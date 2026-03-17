import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import client from '@/lib/db';
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
    return <div className="flex min-h-screen flex-col items-center justify-center p-24 dark:bg-gray-900 dark:text-gray-100">Invalid login link.</div>;
  }

  if (!userId) {
    redirect(`/sign-in?redirect_url=/cli/auth?token=${token}`);
  }

  let message = '';
  let authToken = null;

  try {
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
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 dark:bg-gray-900 dark:text-gray-100">
      <h1 className="text-4xl font-bold mb-8">CLI Authentication</h1>
      <p className="text-lg text-center">{message}</p>
      {authToken && (
        <p className="text-sm mt-4">
          Your auth token: <code className="bg-gray-800 p-1 rounded">{authToken}</code>
        </p>
      )}
    </div>
  );
}
