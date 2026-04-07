import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { getAnthropic } from "./anthropic-client";
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

function toAnthropicMessages(history: ChatMessage[]): MessageParam[] {
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
  const client = getAnthropic();
  const stream = await client.messages.stream({
    model: anthropicChatModel(),
    max_tokens: 700,
    temperature: 0.3,
    system,
    messages: toAnthropicMessages(history),
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
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

async function completeAnthropic(
  system: string,
  history: ChatMessage[],
): Promise<string> {
  const client = getAnthropic();
  const msg = await client.messages.create({
    model: anthropicChatModel(),
    max_tokens: 700,
    temperature: 0.3,
    system,
    messages: toAnthropicMessages(history),
  });
  const block = msg.content.find((b) => b.type === "text");
  if (block && block.type === "text") return block.text.trim();
  return "";
}

export async function generateSupportReply(params: {
  history: ChatMessage[];
  contextChunks: RetrievedChunk[];
  escalationSuggested: boolean;
  intent?: SupportIntent;
  conversationSummary?: string;
}): Promise<{ text: string; sources: SupportSourceRef[] }> {
  const system = buildSystemPrompt(
    params.contextChunks,
    params.escalationSuggested,
    params.intent ?? "general",
    params.conversationSummary,
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
  conversationSummary?: string;
}): Promise<{
  streamText: AsyncGenerator<string, void, unknown>;
  sources: SupportSourceRef[];
}> {
  const system = buildSystemPrompt(
    params.contextChunks,
    params.escalationSuggested,
    params.intent ?? "general",
    params.conversationSummary,
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
