import { logger } from "@/lib/logger";
import {
  lastUserMessage,
  prepareSupportTurn,
  sanitizeHistory,
} from "@/lib/support/chat-runner";
import {
  ensureConversationSession,
  isValidConversationId,
  loadConversationHistory,
  logKnowledgeGap,
  persistSupportTurn,
} from "@/lib/support/conversations";
import { generateSupportReply, streamSupportReply } from "@/lib/support/generate";
import { isSupportChatConfigured } from "@/lib/support/config";
import type { ChatMessage } from "@/lib/support/types";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
  messages?: unknown;
  stream?: boolean;
  conversationId?: unknown;
};

function isChatMessage(v: unknown): v is ChatMessage {
  if (!v || typeof v !== "object") return false;
  const m = v as Record<string, unknown>;
  return (
    (m.role === "user" || m.role === "assistant") &&
    typeof m.content === "string"
  );
}

function parseMessages(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw)) return null;
  const out: ChatMessage[] = [];
  for (const item of raw) {
    if (!isChatMessage(item)) return null;
    out.push({ role: item.role, content: item.content });
  }
  return out;
}

function encodeSse(data: unknown): Uint8Array {
  return new TextEncoder().encode(
    `data: ${JSON.stringify(data)}\n\n`,
  );
}

export async function POST(req: Request) {
  if (!isSupportChatConfigured()) {
    return NextResponse.json(
      {
        error:
          "Support chat is not configured. Set OPENAI_API_KEY for embeddings (and chat if using OpenAI), or add ANTHROPIC_API_KEY when SUPPORT_LLM_PROVIDER=anthropic.",
      },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const messages = parseMessages(body.messages);
  if (!messages || messages.length === 0) {
    return NextResponse.json(
      { error: "messages must be a non-empty array." },
      { status: 400 },
    );
  }

  const conversationId = isValidConversationId(body.conversationId)
    ? body.conversationId.trim()
    : uuidv4();
  await ensureConversationSession(conversationId);

  const persistedHistory = await loadConversationHistory(conversationId);
  const incomingHistory = sanitizeHistory(messages);
  const mergedHistory =
    incomingHistory.length <= 2 && persistedHistory.length > 0
      ? sanitizeHistory([...persistedHistory, ...incomingHistory])
      : incomingHistory;

  const wantStream =
    body.stream === true ||
    req.headers.get("accept")?.includes("text/event-stream");

  if (!wantStream) {
    try {
      console.log("[support-chat] entering non-stream try block");
      const prepared = await prepareSupportTurn(mergedHistory);
      if (prepared.kind === "noop") {
        return NextResponse.json({
          reply: prepared.assistantHint,
          sources: [],
          intent: "general",
          confidence: "low",
          topScore: 0,
          escalationSuggested: false,
          conversationId,
        });
      }

      const result = await generateSupportReply({
        history: prepared.history,
        contextChunks: prepared.chunks,
        escalationSuggested: prepared.escalationSuggested,
        intent: prepared.intent,
      });
      const userMessage = lastUserMessage(mergedHistory) ?? "";
      const turnId = await persistSupportTurn({
        sessionId: conversationId,
        userMessage,
        assistantMessage: result.text,
        intent: prepared.intent,
        topScore: prepared.topScore,
        confidence: prepared.confidence,
        escalationSuggested: prepared.escalationSuggested,
        sources: result.sources,
      });

      if (prepared.confidence === "low" || prepared.escalationSuggested) {
        await logKnowledgeGap({
          sessionId: conversationId,
          turnId,
          question: prepared.question,
          topScore: prepared.topScore,
          reason:
            prepared.confidence === "low"
              ? "low_confidence"
              : "escalation_suggested",
        });
      }

      return NextResponse.json({
        reply: result.text,
        sources: result.sources,
        intent: prepared.intent,
        topScore: prepared.topScore,
        confidence: prepared.confidence,
        escalationSuggested: prepared.escalationSuggested,
        turnId,
        conversationId,
      });
    } catch (e) {
      console.error("[support-chat] non-stream catch:", e instanceof Error ? e.message : String(e));
      logger.error("support_chat_failed", {
        message: e instanceof Error ? e.message : String(e),
      });
      return NextResponse.json(
        { error: "Could not generate a reply. Try again shortly." },
        { status: 502 },
      );
    }
  }

  try {
    const prepared = await prepareSupportTurn(mergedHistory);

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (obj: unknown) => controller.enqueue(encodeSse(obj));

        if (prepared.kind === "noop") {
          send({
            type: "meta",
            sources: [],
            intent: "general",
            topScore: 0,
            confidence: "low",
            escalationSuggested: false,
            conversationId,
          });
          send({ type: "delta", text: prepared.assistantHint });
          send({ type: "done", conversationId });
          controller.close();
          return;
        }

        send({
          type: "meta",
          sources: prepared.chunks.map((c) => ({
            id: c.id,
            title: c.title,
            source: c.source,
          })),
          intent: prepared.intent,
          topScore: Number(prepared.topScore.toFixed(4)),
          confidence: prepared.confidence,
          escalationSuggested: prepared.escalationSuggested,
          conversationId,
        });

        const { streamText, sources } = await streamSupportReply({
          history: prepared.history,
          contextChunks: prepared.chunks,
          escalationSuggested: prepared.escalationSuggested,
          intent: prepared.intent,
        });

        let outChars = 0;
        let assistantContent = "";
        for await (const piece of streamText) {
          if (piece) {
            outChars += piece.length;
            assistantContent += piece;
            send({ type: "delta", text: piece });
          }
        }

        const userMessage = lastUserMessage(prepared.history) ?? prepared.question;
        const turnId = await persistSupportTurn({
          sessionId: conversationId,
          userMessage,
          assistantMessage: assistantContent.trim(),
          intent: prepared.intent,
          topScore: prepared.topScore,
          confidence: prepared.confidence,
          escalationSuggested: prepared.escalationSuggested,
          sources,
        });

        if (prepared.confidence === "low" || prepared.escalationSuggested) {
          await logKnowledgeGap({
            sessionId: conversationId,
            turnId,
            question: prepared.question,
            topScore: prepared.topScore,
            reason:
              prepared.confidence === "low"
                ? "low_confidence"
                : "escalation_suggested",
          });
        }

        logger.info("support_stream_finished", {
          chars: outChars,
          sourcesCount: sources.length,
          conversationId,
          turnId,
        });

        send({ type: "done", conversationId, turnId });
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    logger.error("support_chat_stream_failed", {
      message: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json(
      { error: "Could not generate a reply. Try again shortly." },
      { status: 502 },
    );
  }
}
