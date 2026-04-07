export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type KnowledgeChunk = {
  id: string;
  title: string;
  source: string;
  text: string;
};

export type IndexedChunk = KnowledgeChunk & {
  embedding: number[];
};

export type RetrievedChunk = KnowledgeChunk & {
  score: number;
};

export type SupportSourceRef = {
  id: string;
  title: string;
  source: string;
};

export type SupportIntent = "billing" | "technical" | "sales" | "general";

export type SupportConfidence = "high" | "medium" | "low";
