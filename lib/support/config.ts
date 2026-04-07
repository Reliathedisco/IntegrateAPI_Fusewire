export type SupportVectorBackend = "memory" | "postgres";
export type SupportLlmProvider = "openai" | "anthropic";

export function getSupportVectorBackend(): SupportVectorBackend {
  const v = process.env.SUPPORT_VECTOR_BACKEND?.trim().toLowerCase();
  if (v === "postgres" || v === "pg" || v === "supabase") {
    return "postgres";
  }
  return "memory";
}

export function usePostgresForSupportVectors(): boolean {
  return (
    getSupportVectorBackend() === "postgres" &&
    Boolean(process.env.DATABASE_URL?.trim())
  );
}

export function getSupportLlmProvider(): SupportLlmProvider {
  const p = process.env.SUPPORT_LLM_PROVIDER?.trim().toLowerCase();
  if (p === "anthropic" || p === "claude") return "anthropic";
  return "openai";
}

/** Embeddings always use OpenAI in this setup. */
export function hasOpenAiForEmbeddings(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function hasOpenAiForChat(): boolean {
  return hasOpenAiForEmbeddings();
}

export function hasAnthropicForChat(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

export function isSupportChatConfigured(): boolean {
  if (!hasOpenAiForEmbeddings()) return false;
  const llm = getSupportLlmProvider();
  if (llm === "anthropic") return hasAnthropicForChat();
  return hasOpenAiForChat();
}

export function anthropicChatModel(): string {
  return (
    process.env.ANTHROPIC_MODEL?.trim() ||
    "claude-3-5-haiku-20241022"
  );
}

export function openaiChatModel(): string {
  return process.env.OPENAI_CHAT_MODEL?.trim() || "gpt-4o-mini";
}
