interface TemplateOutput {
  files: Record<string, string>;
  tier: "free" | "pro";
}

const templates: Record<string, TemplateOutput> = {
  stripe: {
    tier: "free",
    files: {
      "lib/integrations/stripe/index.ts": `import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});
`,
      "lib/integrations/stripe/webhook.ts": `import { headers } from "next/headers";
import { stripe } from "./index";
import Stripe from "stripe";

export async function constructWebhookEvent(body: string): Promise<Stripe.Event> {
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");
  if (!sig) throw new Error("Missing stripe-signature header");
  if (!process.env.STRIPE_WEBHOOK_SECRET) throw new Error("Missing STRIPE_WEBHOOK_SECRET");
  return stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
}
`,
      "lib/integrations/stripe/.env.example": `STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
`,
    },
  },

  resend: {
    tier: "free",
    files: {
      "lib/integrations/resend/index.ts": `import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY");
}

export const resend = new Resend(process.env.RESEND_API_KEY);
`,
      "lib/integrations/resend/.env.example": `RESEND_API_KEY=re_...
`,
    },
  },

  "supabase-basic": {
    tier: "free",
    files: {
      "lib/integrations/supabase-basic/index.ts": `import { createClient as createSupabaseClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");

export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export const supabase = createClient();
`,
      "lib/integrations/supabase-basic/.env.example": `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
`,
    },
  },

  vercel: {
    tier: "free",
    files: {
      "lib/integrations/vercel/index.ts": `if (!process.env.VERCEL_TOKEN) {
  throw new Error("Missing VERCEL_TOKEN");
}

const BASE = "https://api.vercel.com";

export async function vercelFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(\`\${BASE}\${path}\`, {
    ...init,
    headers: {
      Authorization: \`Bearer \${process.env.VERCEL_TOKEN}\`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(\`Vercel API \${res.status}: \${await res.text()}\`);
  return res.json();
}
`,
      "lib/integrations/vercel/.env.example": `VERCEL_TOKEN=...
`,
    },
  },

  github: {
    tier: "free",
    files: {
      "lib/integrations/github/index.ts": `const GITHUB_API = "https://api.github.com";

export async function githubFetch<T>(path: string, token?: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    ...init?.headers as Record<string, string>,
  };
  if (token) headers.Authorization = \`Bearer \${token}\`;
  const res = await fetch(\`\${GITHUB_API}\${path}\`, { ...init, headers });
  if (!res.ok) throw new Error(\`GitHub API \${res.status}: \${await res.text()}\`);
  return res.json();
}
`,
      "lib/integrations/github/.env.example": `GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
`,
    },
  },

  openai: {
    tier: "free",
    files: {
      "lib/integrations/openai/index.ts": `import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
`,
      "lib/integrations/openai/.env.example": `OPENAI_API_KEY=sk-...
`,
    },
  },

  clerk: {
    tier: "free",
    files: {
      "lib/integrations/clerk/index.ts": `export { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
export { SignedIn, SignedOut, UserButton, SignIn, SignUp } from "@clerk/nextjs";
`,
      "lib/integrations/clerk/.env.example": `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
`,
    },
  },

  posthog: {
    tier: "free",
    files: {
      "lib/integrations/posthog/index.ts": `import posthog from "posthog-js";

let initialized = false;

export function initPostHog() {
  if (typeof window === "undefined" || initialized) return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) throw new Error("Missing NEXT_PUBLIC_POSTHOG_KEY");
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
    loaded: () => { initialized = true; },
  });
}

export { posthog };
`,
      "lib/integrations/posthog/.env.example": `NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
`,
    },
  },

  uploadthing: {
    tier: "free",
    files: {
      "lib/integrations/uploadthing/index.ts": `import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const uploadRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete:", file.url);
      return { url: file.url };
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof uploadRouter;
`,
      "lib/integrations/uploadthing/.env.example": `UPLOADTHING_TOKEN=...
`,
    },
  },

  sendgrid: {
    tier: "free",
    files: {
      "lib/integrations/sendgrid/index.ts": `if (!process.env.SENDGRID_API_KEY) {
  throw new Error("Missing SENDGRID_API_KEY");
}

interface SendEmailOptions {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions) {
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${process.env.SENDGRID_API_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: options.to }] }],
      from: { email: options.from },
      subject: options.subject,
      content: [
        ...(options.text ? [{ type: "text/plain", value: options.text }] : []),
        { type: "text/html", value: options.html },
      ],
    }),
  });
  if (!res.ok) throw new Error(\`SendGrid \${res.status}: \${await res.text()}\`);
}
`,
      "lib/integrations/sendgrid/.env.example": `SENDGRID_API_KEY=SG....
`,
    },
  },

  planetscale: {
    tier: "free",
    files: {
      "lib/integrations/planetscale/index.ts": `import { connect } from "@planetscale/database";

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL");
}

export const db = connect({ url: process.env.DATABASE_URL });
`,
      "lib/integrations/planetscale/.env.example": `DATABASE_URL=mysql://...
`,
    },
  },

  ably: {
    tier: "free",
    files: {
      "lib/integrations/ably/index.ts": `import Ably from "ably";

if (!process.env.ABLY_API_KEY) {
  throw new Error("Missing ABLY_API_KEY");
}

export const ably = new Ably.Realtime(process.env.ABLY_API_KEY);
export const ablyRest = new Ably.Rest(process.env.ABLY_API_KEY);
`,
      "lib/integrations/ably/.env.example": `ABLY_API_KEY=...
`,
    },
  },

  twilio: {
    tier: "free",
    files: {
      "lib/integrations/twilio/index.ts": `import twilio from "twilio";

if (!process.env.TWILIO_ACCOUNT_SID) throw new Error("Missing TWILIO_ACCOUNT_SID");
if (!process.env.TWILIO_AUTH_TOKEN) throw new Error("Missing TWILIO_AUTH_TOKEN");

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
`,
      "lib/integrations/twilio/.env.example": `TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
`,
    },
  },

  slack: {
    tier: "free",
    files: {
      "lib/integrations/slack/index.ts": `if (!process.env.SLACK_BOT_TOKEN) {
  throw new Error("Missing SLACK_BOT_TOKEN");
}

export async function slackPost(channel: string, text: string) {
  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${process.env.SLACK_BOT_TOKEN}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ channel, text }),
  });
  return res.json();
}
`,
      "lib/integrations/slack/.env.example": `SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
`,
    },
  },

  // Pro integrations
  anthropic: {
    tier: "pro",
    files: {
      "lib/integrations/anthropic/index.ts": `import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("Missing ANTHROPIC_API_KEY");
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
`,
      "lib/integrations/anthropic/.env.example": `ANTHROPIC_API_KEY=sk-ant-...
`,
    },
  },

  liveblocks: {
    tier: "pro",
    files: {
      "lib/integrations/liveblocks/index.ts": `import { createClient } from "@liveblocks/client";

if (!process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY) {
  throw new Error("Missing NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY");
}

export const liveblocksClient = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY,
});
`,
      "lib/integrations/liveblocks/.env.example": `NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_...
LIVEBLOCKS_SECRET_KEY=sk_...
`,
    },
  },

  "lemon-squeezy": {
    tier: "pro",
    files: {
      "lib/integrations/lemon-squeezy/index.ts": `if (!process.env.LEMON_SQUEEZY_API_KEY) {
  throw new Error("Missing LEMON_SQUEEZY_API_KEY");
}

const BASE = "https://api.lemonsqueezy.com/v1";

export async function lemonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(\`\${BASE}\${path}\`, {
    ...init,
    headers: {
      Authorization: \`Bearer \${process.env.LEMON_SQUEEZY_API_KEY}\`,
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(\`Lemon Squeezy \${res.status}: \${await res.text()}\`);
  return res.json();
}
`,
      "lib/integrations/lemon-squeezy/.env.example": `LEMON_SQUEEZY_API_KEY=...
LEMON_SQUEEZY_WEBHOOK_SECRET=...
`,
    },
  },

  linear: {
    tier: "pro",
    files: {
      "lib/integrations/linear/index.ts": `import { LinearClient } from "@linear/sdk";

if (!process.env.LINEAR_API_KEY) {
  throw new Error("Missing LINEAR_API_KEY");
}

export const linear = new LinearClient({
  apiKey: process.env.LINEAR_API_KEY,
});
`,
      "lib/integrations/linear/.env.example": `LINEAR_API_KEY=lin_api_...
`,
    },
  },

  notion: {
    tier: "pro",
    files: {
      "lib/integrations/notion/index.ts": `import { Client } from "@notionhq/client";

if (!process.env.NOTION_API_KEY) {
  throw new Error("Missing NOTION_API_KEY");
}

export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});
`,
      "lib/integrations/notion/.env.example": `NOTION_API_KEY=ntn_...
`,
    },
  },

  intercom: {
    tier: "pro",
    files: {
      "lib/integrations/intercom/index.ts": `if (!process.env.INTERCOM_ACCESS_TOKEN) {
  throw new Error("Missing INTERCOM_ACCESS_TOKEN");
}

const BASE = "https://api.intercom.io";

export async function intercomFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(\`\${BASE}\${path}\`, {
    ...init,
    headers: {
      Authorization: \`Bearer \${process.env.INTERCOM_ACCESS_TOKEN}\`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(\`Intercom \${res.status}: \${await res.text()}\`);
  return res.json();
}
`,
      "lib/integrations/intercom/.env.example": `INTERCOM_ACCESS_TOKEN=...
NEXT_PUBLIC_INTERCOM_APP_ID=...
`,
    },
  },

  segment: {
    tier: "pro",
    files: {
      "lib/integrations/segment/index.ts": `import Analytics from "@segment/analytics-node";

if (!process.env.SEGMENT_WRITE_KEY) {
  throw new Error("Missing SEGMENT_WRITE_KEY");
}

export const analytics = new Analytics({ writeKey: process.env.SEGMENT_WRITE_KEY });
`,
      "lib/integrations/segment/.env.example": `SEGMENT_WRITE_KEY=...
`,
    },
  },
};

export function getTemplate(id: string): TemplateOutput | null {
  return templates[id] || null;
}
