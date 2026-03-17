import { auth, currentUser } from '@clerk/nextjs/server';
import { Suspense } from 'react';
import { getCliAuthToken } from './actions';
import AccountContent from './AccountContent';

export default async function AccountPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return <div>Please log in.</div>;
  }

  const initialCliAuthToken = await getCliAuthToken(userId);

  return (
    <div className="container">
      <h1>Account</h1>
      <Suspense
        fallback={
          <div className="accountCard">
            <p>Loading...</p>
          </div>
        }
      >
        <AccountContent initialCliAuthToken={initialCliAuthToken} userId={userId} />
      </Suspense>
    </div>
  );
}
