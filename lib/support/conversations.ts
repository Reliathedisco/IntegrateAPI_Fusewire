import pool from "@/lib/db";
import { logger } from "@/lib/logger";
import { v4 as uuidv4 } from "uuid";
import type { ChatMessage, SupportConfidence, SupportIntent, SupportSourceRef } from "./types";

export function supportsPersistentMemory(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function isValidConversationId(v: unknown): v is string {
  return typeof v === "string" && v.trim().length >= 8 && v.trim().length <= 128;
}

export async function ensureConversationSession(sessionId: string): Promise<void> {
  if (!supportsPersistentMemory()) return;
  try {
    await pool.query(
      `
      INSERT INTO support_chat_sessions (id, updated_at)
      VALUES ($1, NOW())
      ON CONFLICT (id) DO UPDATE SET updated_at = NOW()
      `,
      [sessionId],
    );
  } catch (e) {
    logger.warn("support_session_persist_failed", {
      message: e instanceof Error ? e.message : String(e),
    });
  }
}

export async function loadConversationHistory(
  sessionId: string,
  turnLimit = 6,
): Promise<ChatMessage[]> {
  if (!supportsPersistentMemory()) return [];
  try {
    const res = await pool.query<{
      user_message: string;
      assistant_message: string;
    }>(
      `
      SELECT user_message, assistant_message
      FROM support_chat_turns
      WHERE session_id = $1
      ORDER BY created_at DESC
      LIMIT $2
      `,
      [sessionId, turnLimit],
    );
    const ordered = [...res.rows].reverse();
    const out: ChatMessage[] = [];
    for (const row of ordered) {
      if (row.user_message?.trim()) {
        out.push({ role: "user", content: row.user_message.trim() });
      }
      if (row.assistant_message?.trim()) {
        out.push({ role: "assistant", content: row.assistant_message.trim() });
      }
    }
    return out;
  } catch (e) {
    logger.warn("support_history_load_failed", {
      message: e instanceof Error ? e.message : String(e),
    });
    return [];
  }
}

export async function persistSupportTurn(params: {
  sessionId: string;
  userMessage: string;
  assistantMessage: string;
  intent: SupportIntent;
  topScore: number;
  confidence: SupportConfidence;
  escalationSuggested: boolean;
  sources: SupportSourceRef[];
}): Promise<string | null> {
  if (!supportsPersistentMemory()) return null;
  const turnId = uuidv4();
  try {
    await ensureConversationSession(params.sessionId);
    await pool.query(
      `
      INSERT INTO support_chat_turns
        (id, session_id, user_message, assistant_message, intent, top_score, confidence, escalation_suggested, sources)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
      `,
      [
        turnId,
        params.sessionId,
        params.userMessage,
        params.assistantMessage,
        params.intent,
        params.topScore,
        params.confidence,
        params.escalationSuggested,
        JSON.stringify(params.sources),
      ],
    );
    await pool.query(
      `UPDATE support_chat_sessions SET updated_at = NOW() WHERE id = $1`,
      [params.sessionId],
    );
    return turnId;
  } catch (e) {
    logger.warn("support_turn_persist_failed", {
      message: e instanceof Error ? e.message : String(e),
    });
    return null;
  }
}

export async function logKnowledgeGap(params: {
  sessionId: string;
  turnId?: string | null;
  question: string;
  topScore: number;
  reason: string;
}): Promise<void> {
  if (!supportsPersistentMemory()) return;
  try {
    await pool.query(
      `
      INSERT INTO support_knowledge_gaps
        (id, session_id, turn_id, question, top_score, reason)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      `,
      [
        uuidv4(),
        params.sessionId,
        params.turnId ?? null,
        params.question,
        params.topScore,
        params.reason,
      ],
    );
  } catch (e) {
    logger.warn("support_knowledge_gap_log_failed", {
      message: e instanceof Error ? e.message : String(e),
    });
  }
}

export async function logSupportFeedback(params: {
  sessionId: string;
  turnId: string;
  vote: -1 | 1;
  note?: string;
}): Promise<void> {
  if (!supportsPersistentMemory()) return;
  await ensureConversationSession(params.sessionId);
  await pool.query(
    `
    INSERT INTO support_chat_feedback (id, turn_id, session_id, vote, note)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (turn_id, session_id)
    DO UPDATE SET vote = EXCLUDED.vote, note = EXCLUDED.note
    `,
    [uuidv4(), params.turnId, params.sessionId, params.vote, params.note ?? ""],
  );
}
