import { normalizeVector } from "./math";

const EMBED_MODEL = "text-embedding-3-small";

type OpenAIEmbeddingResponse = {
  data: Array<{ index: number; embedding: number[] }>;
};

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const key = process.env.OPENAI_API_KEY;
  if (!key?.trim()) throw new Error("OPENAI_API_KEY is not set");

  const batchSize = 64;
  const out: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const slice = texts.slice(i, i + batchSize);
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: EMBED_MODEL, input: slice }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`OpenAI embeddings error ${res.status}: ${text}`);
    }

    const json = (await res.json()) as OpenAIEmbeddingResponse;
    const batch = json.data
      .slice()
      .sort((a, b) => a.index - b.index)
      .map((d) => normalizeVector([...d.embedding]));
    out.push(...batch);
  }

  return out;
}

export async function embedQuery(text: string): Promise<number[]> {
  const [vec] = await embedTexts([
    text.replace(/\s+/g, " ").trim().slice(0, 8000),
  ]);
  return vec ?? [];
}
