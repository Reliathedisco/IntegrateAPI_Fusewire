import { Client } from 'pg';

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not set - skipping database init');
}

const cliAuthSchemaSql = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
DO $$
BEGIN
  CREATE TYPE cli_auth_status AS ENUM ('pending', 'verified', 'expired');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;
CREATE TABLE IF NOT EXISTS cli_auth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT UNIQUE NOT NULL,
  user_id TEXT,
  status cli_auth_status NOT NULL DEFAULT 'pending',
  auth_token TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE TABLE IF NOT EXISTS user_usage (
  user_id TEXT PRIMARY KEY,
  installs_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

let client: Client | null = null;
let initPromise: Promise<Client | null> | null = null;

export async function initDb(): Promise<Client | null> {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set - skipping database init');
    return null;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const instance = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    await instance.connect();
    client = instance;

    try {
      await instance.query(cliAuthSchemaSql);
    } catch (error) {
      console.error('Database init failed:', error);
    }

    return instance;
  })().catch((error) => {
    console.error('Database init failed:', error);
    return null;
  });

  return initPromise;
}

export function getDbClient() {
  return client;
}
