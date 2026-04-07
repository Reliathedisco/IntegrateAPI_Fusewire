import { logger } from "@/lib/logger";
import { embedQuery } from "./embeddings";
import { usePostgresForSupportVectors } from "./config";
import {
  searchSupportKnowledgeVectors,
  supportKnowledgeRowCount,
} from "./pg-vector";
import { getIndexedChunks, retrieveTopK } from "./vector-store";
import type { RetrievedChunk } from "./types";

export async function retrieveForQuestion(
  question: string,
  topK = 5,
): Promise<{ chunks: RetrievedChunk[]; topScore: number }> {
  const queryEmbedding = await embedQuery(question);

  if (usePostgresForSupportVectors()) {
    try {
      const n = await supportKnowledgeRowCount();
      if (n === 0) {
        logger.warn("support_vector_postgres_empty", {
          hint: "Run: npm run ingest:support (after migrations)",
        });
      } else {
        const chunks = await searchSupportKnowledgeVectors(
          queryEmbedding,
          topK,
        );
        const topScore = chunks[0]?.score ?? 0;
        return { chunks, topScore };
      }
    } catch (e) {
      logger.error("support_vector_postgres_failed", {
        message: e instanceof Error ? e.message : String(e),
        fallback: "memory",
      });
    }
  }

  const indexed = await getIndexedChunks();
  const chunks = retrieveTopK(queryEmbedding, indexed, topK);
  const topScore = chunks[0]?.score ?? 0;
  return { chunks, topScore };
}
