import { logger } from "@/lib/logger";
import { generateSupportReply } from "./generate";
import { shouldEscalate } from "./escalation";
import { classifyIntent } from "./intent";
import { retrieveForQuestion } from "./retrieve";
import type {
  ChatMessage,
  RetrievedChunk,
  SupportConfidence,
  SupportIntent,
  SupportSourceRef,
} from "./types";

const MAX_HISTORY = 12;

export function sanitizeHistory(messages: ChatMessage[]): ChatMessage[] {
  const trimmed = messages.slice(-MAX_HISTORY);
  return trimmed.filter(
    (m) =>
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string" &&
      m.content.trim().length > 0,
  );
}

export function lastUserMessage(messages: ChatMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messages[i].content.trim();
  }
  return null;
}

export type PreparedNoop = {
  kind: "noop";
  history: ChatMessage[];
  assistantHint: string;
};

export type PreparedOk = {
  kind: "ok";
  history: ChatMessage[];
  question: string;
  retrievalQuery: string;
  intent: SupportIntent;
  chunks: RetrievedChunk[];
  topScore: number;
  confidence: SupportConfidence;
  escalationSuggested: boolean;
};

export type PreparedTurn = PreparedNoop | PreparedOk;

function scoreToConfidence(topScore: number): SupportConfidence {
  if (topScore >= 0.82) return "high";
  if (topScore >= 0.75) return "medium";
  return "low";
}

function retrievalTopKForIntent(intent: SupportIntent): number {
  switch (intent) {
    case "technical":
      return 7;
    case "billing":
      return 5;
    case "sales":
      return 4;
    default:
      return 5;
  }
}

function isLikelyFollowUp(q: string): boolean {
  const lowered = q.toLowerCase();
  if (q.length < 20) return true;
  if (/^(and|also|what about|how about|then|ok|so)\b/.test(lowered)) return true;
  return /\b(this|that|it|those|these|same|above)\b/.test(lowered);
}

function buildRetrievalQuery(history: ChatMessage[], question: string): string {
  if (!isLikelyFollowUp(question)) return question;
  const previousUser = [...history]
    .reverse()
    .find((m) => m.role === "user" && m.content.trim() !== question.trim());
  if (!previousUser) return question;
  return `${previousUser.content.trim()}\nFollow-up question: ${question.trim()}`;
}

export async function prepareSupportTurn(
  messages: ChatMessage[],
): Promise<PreparedTurn> {
  const history = sanitizeHistory(messages);
  const question = lastUserMessage(history);
  if (!question) {
    return {
      kind: "noop",
      history,
      assistantHint:
        "Tell me what you’re trying to do with IntegrateAPI and I’ll help.",
    };
  }

  const intent = classifyIntent(question, history);
  const retrievalQuery = buildRetrievalQuery(history, question);
  const topK = retrievalTopKForIntent(intent);
  const { chunks, topScore } = await retrieveForQuestion(retrievalQuery, topK);
  const confidence = scoreToConfidence(topScore);
  const escalationSuggested = shouldEscalate(question, chunks, topScore);

  logger.info("support_query", {
    queryChars: question.length,
    retrievalQueryChars: retrievalQuery.length,
    intent,
    topScore: Number(topScore.toFixed(4)),
    confidence,
    sourceIds: chunks.map((c) => c.id),
    escalationSuggested,
  });

  return {
    kind: "ok",
    history,
    question,
    retrievalQuery,
    intent,
    chunks,
    topScore,
    confidence,
    escalationSuggested,
  };
}

export type ChatRunnerResult = {
  reply: string;
  sources: SupportSourceRef[];
  intent: SupportIntent;
  topScore: number;
  confidence: SupportConfidence;
  escalationSuggested: boolean;
};

export async function runSupportChat(
  messages: ChatMessage[],
): Promise<ChatRunnerResult> {
  const prepared = await prepareSupportTurn(messages);
  if (prepared.kind === "noop") {
    return {
      reply: prepared.assistantHint,
      sources: [],
      intent: "general",
      topScore: 0,
      confidence: "low",
      escalationSuggested: false,
    };
  }

  const started = performance.now();
  const { text, sources } = await generateSupportReply({
    history: prepared.history,
    contextChunks: prepared.chunks,
    escalationSuggested: prepared.escalationSuggested,
    intent: prepared.intent,
  });

  logger.info("support_reply", {
    ms: Math.round(performance.now() - started),
    sourcesCount: sources.length,
  });

  return {
    reply: text,
    sources,
    intent: prepared.intent,
    topScore: prepared.topScore,
    confidence: prepared.confidence,
    escalationSuggested: prepared.escalationSuggested,
  };
}
