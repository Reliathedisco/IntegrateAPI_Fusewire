import { logger } from "@/lib/logger";
import { resendIdempotencyKey, resendRequest } from "@/lib/resend-api";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = {
  email?: string;
  message?: string;
  topic?: string;
};

function isValidEmail(email: string): boolean {
  const normalized = email.trim();
  if (!normalized || normalized.length > 254) return false;
  if (normalized.includes("..")) return false;
  const at = normalized.lastIndexOf("@");
  if (at <= 0 || at === normalized.length - 1) return false;
  const local = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);
  if (!local || !domain) return false;
  if (!domain.includes(".")) return false;
  if (local.length > 64) return false;
  return true;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const emailRaw = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";

  if (!emailRaw || !message) {
    return NextResponse.json(
      { error: "email and message are required." },
      { status: 400 },
    );
  }

  if (!isValidEmail(emailRaw)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const email = emailRaw.toLowerCase();

  const apiKey = process.env.RESEND_API_KEY;
  const to =
    process.env.SUPPORT_ESCALATION_TO?.trim() ||
    process.env.SUPPORT_INBOX_EMAIL?.trim();
  const from =
    process.env.SUPPORT_ESCALATION_FROM?.trim() ||
    process.env.NEWSLETTER_FROM?.trim() ||
    process.env.RESEND_FROM?.trim();

  const redactedLog = email.includes("@")
    ? `${email.slice(0, 2)}***${email.slice(email.indexOf("@"))}`
    : "***";

  logger.info("support_escalation", {
    email: redactedLog,
    topic: topic || undefined,
    messageChars: message.length,
    emailDelivery: Boolean(apiKey && to && from),
  });

  if (!apiKey || !to || !from) {
    return NextResponse.json({
      ok: true,
      emailSent: false,
      detail:
        "Thanks — we logged your request. Email handoff is not configured (set RESEND_API_KEY, SUPPORT_ESCALATION_TO, and a from address).",
    });
  }

  const subject = `[IntegrateAPI Support] ${topic || "Chat handoff"}`;
  const html = `
    <div style="font-family: ui-sans-serif, system-ui; line-height: 1.5; color: #0a0a0a;">
      <h2 style="margin: 0 0 12px;">Support escalation</h2>
      <p style="margin: 0 0 8px;"><strong>From:</strong> ${escapeHtml(email)}</p>
      ${topic ? `<p style="margin: 0 0 8px;"><strong>Topic:</strong> ${escapeHtml(topic)}</p>` : ""}
      <p style="margin: 16px 0 0; white-space: pre-wrap;">${escapeHtml(message)}</p>
    </div>
  `.trim();

  const send = await resendRequest<{ id: string }>(apiKey, "/emails", {
    method: "POST",
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject,
      html,
      text: `From: ${email}\nTopic: ${topic || "(none)"}\n\n${message}`,
    }),
    idempotencyKey: resendIdempotencyKey(
      "support-escalation",
      `${email}|${topic}|${message.slice(0, 2000)}`,
    ),
  });

  if (!send.ok) {
    logger.error("support_escalation_resend_failed", {
      status: send.status,
      error: send.error,
    });
    return NextResponse.json(
      {
        ok: false,
        error:
          send.status === 429
            ? "Too many requests — try again shortly."
            : send.error,
      },
      { status: send.status >= 400 && send.status < 600 ? send.status : 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    emailSent: true,
    emailId: send.data.id,
    detail: "Thanks — we emailed the team and set reply-to to your address.",
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
