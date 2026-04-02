import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import pool from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { email?: string };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const clerk = await clerkClient();

  const users = await clerk.users.getUserList({
    emailAddress: [email],
    limit: 1,
  });

  if (users.data.length === 0) {
    return NextResponse.json(
      { error: "No account found for that email. Sign up at integrateapi.io first." },
      { status: 404 }
    );
  }

  const user = users.data[0];
  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  let client;
  try {
    client = await pool.connect();

    await client.query(
      "INSERT INTO verification_codes (email, code, user_id, expires_at) VALUES ($1, $2, $3, $4)",
      [email, code, user.id, expiresAt.toISOString()]
    );
  } catch (error) {
    console.error("magic-link: failed to store code", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    if (client) client.release();
  }

  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.NEWSLETTER_FROM || process.env.RESEND_FROM;

  if (resendKey && from) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [email],
          subject: `IntegrateAPI CLI — Your code is ${code}`,
          html: `
            <div style="font-family: ui-monospace, monospace; line-height: 1.6; color: #e8e8e8; background: #080808; padding: 40px; max-width: 480px;">
              <p style="color: #999; margin: 0 0 24px;">IntegrateAPI CLI Verification</p>
              <p style="font-size: 40px; font-weight: 700; letter-spacing: 8px; margin: 0 0 24px; color: #4F8CFF;">${code}</p>
              <p style="color: #666; margin: 0; font-size: 13px;">This code expires in 10 minutes.</p>
            </div>
          `.trim(),
          text: `Your IntegrateAPI verification code is: ${code}\n\nThis code expires in 10 minutes.`,
        }),
      });
    } catch (err) {
      console.error("magic-link: failed to send email", err);
    }
  } else {
    console.warn("magic-link: RESEND_API_KEY or FROM not set — code stored but email not sent. Code:", code);
  }

  return NextResponse.json({ success: true, message: "Verification code sent" });
}
