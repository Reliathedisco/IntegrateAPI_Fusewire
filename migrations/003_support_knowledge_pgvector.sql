-- pgvector for support RAG (Neon, Supabase Postgres, self-hosted Postgres + pgvector)
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS support_knowledge_embeddings (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    source TEXT NOT NULL,
    body TEXT NOT NULL,
    embedding vector(1536) NOT NULL,
    content_hash TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE support_knowledge_embeddings IS 'IntegrateAPI support chat: chunked docs with OpenAI text-embedding-3-small vectors (1536 dims)';
