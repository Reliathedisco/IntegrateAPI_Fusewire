import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY environment variable');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}) {
  return await resend.emails.send({
    from: params.from || 'onboarding@resend.dev',
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}