import pool from "@/lib/db";
import type { RetrievedChunk } from "./types";

/** pgvector text format for query parameters */
export function toVectorParam(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

export async function supportKnowledgeRowCount(): Promise<number> {
  const res = await pool.query(
    `SELECT COUNT(*)::int AS n FROM support_knowledge_embeddings`,
  );
  return res.rows[0]?.n ?? 0;
}

export async function searchSupportKnowledgeVectors(
  queryEmbedding: number[],
  k: number,
): Promise<RetrievedChunk[]> {
  const literal = toVectorParam(queryEmbedding);
  const res = await pool.query<{
    id: string;
    title: string;
    source: string;
    text: string;
    score: string;
  }>(
    `
    SELECT
      id,
      title,
      source,
      body AS text,
      (1 - (embedding <=> $1::vector))::float8 AS score
    FROM support_knowledge_embeddings
    ORDER BY embedding <=> $1::vector
    LIMIT $2
    `,
    [literal, k],
  );

  return res.rows.map((row) => ({
    id: row.id,
    title: row.title,
    source: row.source,
    text: row.text,
    score: Number(row.score),
  }));
}

export async function upsertSupportKnowledgeRow(params: {
  id: string;
  title: string;
  source: string;
  body: string;
  embedding: number[];
  contentHash: string;
}): Promise<void> {
  const literal = toVectorParam(params.embedding);
  await pool.query(
    `
    INSERT INTO support_knowledge_embeddings
      (id, title, source, body, embedding, content_hash, updated_at)
    VALUES ($1, $2, $3, $4, $5::vector, $6, NOW())
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      source = EXCLUDED.source,
      body = EXCLUDED.body,
      embedding = EXCLUDED.embedding,
      content_hash = EXCLUDED.content_hash,
      updated_at = NOW()
    `,
    [
      params.id,
      params.title,
      params.source,
      params.body,
      literal,
      params.contentHash,
    ],
  );
}
