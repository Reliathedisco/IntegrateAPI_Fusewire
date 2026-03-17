CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE cli_auth_status AS ENUM ('pending', 'verified', 'expired');

CREATE TABLE cli_auth_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token TEXT UNIQUE NOT NULL,
    user_id TEXT,
    status cli_auth_status NOT NULL DEFAULT 'pending',
    auth_token TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);
