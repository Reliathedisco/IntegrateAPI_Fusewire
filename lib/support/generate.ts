import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import {
  anthropicChatModel,
  getSupportLlmProvider,
  openaiChatModel,
} from "./config";
import { getOpenAI } from "./openai";
import { buildSystemPrompt } from "./prompts";
import type {
  ChatMessage,
  RetrievedChunk,
  SupportIntent,
  SupportSourceRef,
} from "./types";

function sourcesFromChunks(chunks: RetrievedChunk[]): SupportSourceRef[] {
  const seen = new Set<string>();
  const out: SupportSourceRef[] = [];
  for (const c of chunks) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    out.push({ id: c.id, title: c.title, source: c.source });
  }
  return out;
}

function toOpenAIMessages(
  history: ChatMessage[],
): ChatCompletionMessageParam[] {
  return history.map((m) => ({
    role: m.role,
    content: m.content,
  }));
}

function toAnthropicMessages(history: ChatMessage[]): Array<{ role: "user" | "assistant"; content: string }> {
  return history.map((m) => ({
    role: m.role,
    content: m.content,
  }));
}

async function* streamOpenAIText(
  system: string,
  history: ChatMessage[],
): AsyncGenerator<string, void, unknown> {
  const openai = getOpenAI();
  const stream = await openai.chat.completions.create({
    model: openaiChatModel(),
    messages: [{ role: "system", content: system }, ...toOpenAIMessages(history)],
    temperature: 0.3,
    max_tokens: 700,
    stream: true,
  });

  for await (const part of stream) {
    const piece = part.choices[0]?.delta?.content ?? "";
    if (piece) yield piece;
  }
}

async function* streamAnthropicText(
  system: string,
  history: ChatMessage[],
): AsyncGenerator<string, void, unknown> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key?.trim()) throw new Error("ANTHROPIC_API_KEY is not set");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key.trim(),
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: anthropicChatModel(),
      max_tokens: 700,
      temperature: 0.3,
      stream: true,
      system,
      messages: toAnthropicMessages(history),
    }),
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    throw new Error(`Anthropic API error ${res.status}: ${text}`);
  }

  const decoder = new TextDecoder();
  const reader = res.body.getReader();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const ev = JSON.parse(payload) as { type: string; delta?: { type: string; text?: string } };
        if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta" && ev.delta.text) {
          yield ev.delta.text;
        }
      } catch { /* skip malformed */ }
    }
  }
}

async function completeAnthropic(
  system: string,
  history: ChatMessage[],
): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key?.trim()) throw new Error("ANTHROPIC_API_KEY is not set");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key.trim(),
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: anthropicChatModel(),
      max_tokens: 700,
      temperature: 0.3,
      system,
      messages: toAnthropicMessages(history),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Anthropic API error ${res.status}: ${text}`);
  }

  const data = await res.json() as { content: Array<{ type: string; text: string }> };
  const block = data.content?.find((b) => b.type === "text");
  return block?.text?.trim() ?? "";
}

async function completeOpenAI(
  system: string,
  history: ChatMessage[],
): Promise<string> {
  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: openaiChatModel(),
    messages: [{ role: "system", content: system }, ...toOpenAIMessages(history)],
    temperature: 0.3,
    max_tokens: 700,
  });
  return completion.choices[0]?.message?.content?.trim() ?? "";
}

export async function generateSupportReply(params: {
  history: ChatMessage[];
  contextChunks: RetrievedChunk[];
  escalationSuggested: boolean;
  intent?: SupportIntent;
}): Promise<{ text: string; sources: SupportSourceRef[] }> {
  const system = buildSystemPrompt(
    params.contextChunks,
    params.escalationSuggested,
    params.intent ?? "general",
  );
  const provider = getSupportLlmProvider();
  const text =
    provider === "anthropic"
      ? await completeAnthropic(system, params.history)
      : await completeOpenAI(system, params.history);

  return {
    text: text || "I'm not sure based on the available information.",
    sources: sourcesFromChunks(params.contextChunks),
  };
}

export async function streamSupportReply(params: {
  history: ChatMessage[];
  contextChunks: RetrievedChunk[];
  escalationSuggested: boolean;
  intent?: SupportIntent;
}): Promise<{
  streamText: AsyncGenerator<string, void, unknown>;
  sources: SupportSourceRef[];
}> {
  const system = buildSystemPrompt(
    params.contextChunks,
    params.escalationSuggested,
    params.intent ?? "general",
  );
  const provider = getSupportLlmProvider();

  async function* streamText() {
    if (provider === "anthropic") {
      yield* streamAnthropicText(system, params.history);
    } else {
      yield* streamOpenAIText(system, params.history);
    }
  }

  return {
    streamText: streamText(),
    sources: sourcesFromChunks(params.contextChunks),
  };
}
