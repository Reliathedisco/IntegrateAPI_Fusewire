import { KNOWLEDGE_CHUNKS } from "./knowledge/chunks";
import { cosineSimilarity, normalizeVector } from "./math";
import { embedTexts } from "./embeddings";
import type { IndexedChunk, KnowledgeChunk, RetrievedChunk } from "./types";

type StoreSingleton = {
  indexed: IndexedChunk[] | null;
  inflight: Promise<IndexedChunk[]> | null;
};

const g = globalThis as unknown as { __integrateSupportVector?: StoreSingleton };

function singleton(): StoreSingleton {
  if (!g.__integrateSupportVector) {
    g.__integrateSupportVector = { indexed: null, inflight: null };
  }
  return g.__integrateSupportVector;
}

export async function getIndexedChunks(): Promise<IndexedChunk[]> {
  const s = singleton();
  if (s.indexed) return s.indexed;
  if (s.inflight) return s.inflight;

  s.inflight = (async () => {
    const embeddings = await embedTexts(KNOWLEDGE_CHUNKS.map((c) => c.text));
    const indexed: IndexedChunk[] = KNOWLEDGE_CHUNKS.map((c, i) => ({
      ...c,
      embedding: embeddings[i],
    }));
    s.indexed = indexed;
    s.inflight = null;
    return indexed;
  })();

  return s.inflight;
}

export function retrieveTopK(
  queryEmbedding: number[],
  indexed: IndexedChunk[],
  k: number,
): RetrievedChunk[] {
  const q = normalizeVector([...queryEmbedding]);
  const scored = indexed.map((chunk) => ({
    id: chunk.id,
    title: chunk.title,
    source: chunk.source,
    text: chunk.text,
    score: cosineSimilarity(q, chunk.embedding),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

export function getKnowledgeChunks(): KnowledgeChunk[] {
  return KNOWLEDGE_CHUNKS;
}
