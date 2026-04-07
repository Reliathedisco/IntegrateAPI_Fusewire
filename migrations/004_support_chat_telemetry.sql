CREATE TABLE IF NOT EXISTS support_chat_sessions (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_chat_turns (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES support_chat_sessions(id) ON DELETE CASCADE,
    user_message TEXT NOT NULL,
    assistant_message TEXT NOT NULL,
    intent TEXT NOT NULL,
    top_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    confidence TEXT NOT NULL DEFAULT 'low',
    escalation_suggested BOOLEAN NOT NULL DEFAULT FALSE,
    sources JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS support_chat_turns_session_created_idx
    ON support_chat_turns (session_id, created_at DESC);

CREATE TABLE IF NOT EXISTS support_chat_feedback (
    id TEXT PRIMARY KEY,
    turn_id TEXT NOT NULL REFERENCES support_chat_turns(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL REFERENCES support_chat_sessions(id) ON DELETE CASCADE,
    vote SMALLINT NOT NULL CHECK (vote IN (-1, 1)),
    note TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (turn_id, session_id)
);

CREATE TABLE IF NOT EXISTS support_knowledge_gaps (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES support_chat_sessions(id) ON DELETE CASCADE,
    turn_id TEXT REFERENCES support_chat_turns(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    top_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
