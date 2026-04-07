import crypto from "crypto";

export function resendIdempotencyKey(prefix: string, value: string): string {
  const hash = crypto.createHash("sha256").update(value).digest("hex");
  return `${prefix}-${hash}`.slice(0, 256);
}

export async function resendRequest<T>(
  apiKey: string,
  path: string,
  init: RequestInit & { idempotencyKey?: string } = {},
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
    json &&
    typeof json === "object" &&
    "message" in json &&
    typeof (json as { message: unknown }).message === "string"
      ? (json as { message: string }).message
      : `Resend request failed (${res.status})`;

  return { ok: false, status: res.status, error: message };
}
