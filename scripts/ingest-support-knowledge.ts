import crypto from "crypto";
import { loadEnvFiles } from "./load-env";

loadEnvFiles();

function hashBody(text: string): string {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error(
      "DATABASE_URL is required. Set it in .env.local (this script loads it automatically).",
    );
    process.exit(1);
  }
  if (!process.env.OPENAI_API_KEY?.trim()) {
    console.error(
      "OPENAI_API_KEY is required to embed chunks. Set it in .env.local.",
    );
    process.exit(1);
  }

  const { KNOWLEDGE_CHUNKS } = await import(
    "../lib/support/knowledge/chunks"
  );
  const { embedTexts } = await import("../lib/support/embeddings");
  const { upsertSupportKnowledgeRow } = await import(
    "../lib/support/pg-vector"
  );

  console.log(`Embedding ${KNOWLEDGE_CHUNKS.length} chunks…`);
  const embeddings = await embedTexts(KNOWLEDGE_CHUNKS.map((c) => c.text));

  for (let i = 0; i < KNOWLEDGE_CHUNKS.length; i++) {
    const c = KNOWLEDGE_CHUNKS[i];
    const body = c.text;
    await upsertSupportKnowledgeRow({
      id: c.id,
      title: c.title,
      source: c.source,
      body,
      embedding: embeddings[i],
      contentHash: hashBody(body),
    });
    console.log(`Upserted ${c.id}`);
  }

  console.log(
    "Done. Set SUPPORT_VECTOR_BACKEND=postgres (or pg) to query this index.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
