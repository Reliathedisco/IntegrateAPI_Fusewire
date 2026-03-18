import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

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

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function idempotencyKey(prefix: string, value: string): string {
  const hash = crypto.createHash("sha256").update(value).digest("hex");
  return `${prefix}-${hash}`.slice(0, 256);
}

async function resendRequest<T>(
  apiKey: string,
  path: string,
  init: RequestInit & { idempotencyKey?: string } = {}
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${apiKey}`);
  headers.set("Content-Type", "application/json");
  if (init.idempotencyKey) {
    headers.set("Idempotency-Key", init.idempotencyKey);
  }

  const res = await fetch(`https://api.resend.com${path}`, {
    ...init,
    headers,
  });

  const json = await res.json().catch(() => null);

  if (res.ok) {
    return { ok: true, data: json as T };
  }

  const message =
    (json && typeof json === "object" && "message" in json && typeof (json as any).message === "string"
      ? (json as any).message
      : `Resend request failed (${res.status})`);

  return { ok: false, status: res.status, error: message };
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NEWSLETTER_FROM || process.env.RESEND_FROM;
  const replyTo = process.env.NEWSLETTER_REPLY_TO || process.env.RESEND_REPLY_TO;
  const segmentId =
    process.env.RESEND_FUSEWIRE_SEGMENT_ID || process.env.RESEND_NEWSLETTER_SEGMENT_ID;

  if (!apiKey) return jsonError("Email service not configured", 500);
  if (!from) return jsonError("Email service not configured", 500);

  const body = (await req.json().catch(() => ({}))) as { email?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!isValidEmail(email)) {
    return jsonError("Please enter a valid email address", 400);
  }

  // 1) Upsert contact (Resend returns 201 even if it already exists).
  // Include the Segment in the create call to avoid extra requests.
  const createContact = await resendRequest<{ id: string; object: string }>(apiKey, "/contacts", {
    method: "POST",
    body: JSON.stringify({
      email,
      unsubscribed: false,
      ...(segmentId ? { segments: [{ id: segmentId }] } : {}),
    }),
    idempotencyKey: idempotencyKey("fusewire-contact", email),
  });

  if (!createContact.ok) {
    if (createContact.status === 422) {
      return jsonError(createContact.error, 400);
    }
    if (createContact.status === 429) {
      return jsonError("Too many requests — please try again in a moment.", 429);
    }
    logger.error("Resend contact create failed", {
      status: createContact.status,
      error: createContact.error,
    });
    return jsonError("Failed to subscribe. Please try again.", 500);
  }

  // 2) Send welcome email (idempotent by email)
  {
    const html = `
      <div style="font-family: ui-sans-serif, system-ui; line-height: 1.5; color: #0a0a0a;">
        <h1 style="margin: 0 0 12px;">Welcome to FuseWire</h1>
        <p style="margin: 0 0 12px;">
          You’re subscribed to the IntegrateAPI newsletter. Weekly notes on SaaS architecture, integration strategy, and API patterns.
        </p>
        <p style="margin: 0 0 18px;">
          Want to ship an integration today? Start here:
          <a href="https://integrateapi.io/templates">integrateapi.io/templates</a>
        </p>
        <p style="margin: 0; color: #555;">
          If you didn’t subscribe, you can ignore this email.
        </p>
      </div>
    `.trim();

    const send = await resendRequest<{ id: string }>(apiKey, "/emails", {
      method: "POST",
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Welcome to FuseWire",
        html,
        text:
          "Welcome to FuseWire. You’re subscribed to the IntegrateAPI newsletter. Start here: https://integrateapi.io/templates",
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
      idempotencyKey: idempotencyKey("fusewire-welcome", email),
    });

    if (!send.ok) {
      logger.warn("Resend welcome email failed", {
        status: send.status,
        error: send.error,
      });

      if (send.status === 429) {
        return jsonError("Too many requests — please try again in a moment.", 429);
      }

      // Surface Resend's error message so we can debug deliverability/config quickly.
      return jsonError(send.error, 500);
    }

    return NextResponse.json({
      ok: true,
      status: "subscribed",
      emailId: send.data.id,
    });
  }

  return NextResponse.json({ ok: true, status: "subscribed" });
}

