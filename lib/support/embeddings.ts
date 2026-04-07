import { getOpenAI } from "./openai";
import { normalizeVector } from "./math";

const EMBED_MODEL = "text-embedding-3-small";

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const openai = getOpenAI();
  const batchSize = 64;
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const slice = texts.slice(i, i + batchSize);
    const res = await openai.embeddings.create({
      model: EMBED_MODEL,
      input: slice,
    });
    const batch = res.data
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
