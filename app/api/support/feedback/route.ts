import { logger } from "@/lib/logger";
import {
  isValidConversationId,
  logSupportFeedback,
} from "@/lib/support/conversations";
import { NextResponse } from "next/server";

type Body = {
  conversationId?: unknown;
  turnId?: unknown;
  vote?: unknown;
  note?: unknown;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isValidConversationId(body.conversationId)) {
    return NextResponse.json(
      { error: "conversationId is required." },
      { status: 400 },
    );
  }

  const turnId = typeof body.turnId === "string" ? body.turnId.trim() : "";
  if (!turnId) {
    return NextResponse.json({ error: "turnId is required." }, { status: 400 });
  }

  const vote =
    body.vote === 1 || body.vote === "up"
      ? 1
      : body.vote === -1 || body.vote === "down"
        ? -1
        : null;
  if (vote === null) {
    return NextResponse.json(
      { error: "vote must be 1/-1 (or up/down)." },
      { status: 400 },
    );
  }

  const note = typeof body.note === "string" ? body.note.slice(0, 1000) : "";

  try {
    await logSupportFeedback({
      sessionId: body.conversationId.trim(),
      turnId,
      vote,
      note,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    logger.error("support_feedback_failed", {
      message: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json(
      { error: "Could not save feedback right now." },
      { status: 502 },
    );
  }
}
