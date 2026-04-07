import type { ChatMessage, SupportIntent } from "./types";

const BILLING_RE =
  /\b(price|pricing|plan|plans|invoice|billing|refund|charge|subscription|trial|cancel|upgrade|downgrade|payment)\b/i;
const TECHNICAL_RE =
  /\b(cli|sdk|api|install|setup|config|error|bug|webhook|token|key|integration|deploy|runtime|timeout|auth)\b/i;
const SALES_RE =
  /\b(demo|quote|enterprise|contract|procurement|security|sla|soc\s*2|hipaa|gdpr|pilot|buy|purchase)\b/i;

function extractLastUserText(history: ChatMessage[]): string {
  const userTexts = history
    .filter((m) => m.role === "user")
    .map((m) => m.content.trim())
    .filter(Boolean);
  return userTexts.slice(-2).join("\n");
}

export function classifyIntent(question: string, history: ChatMessage[]): SupportIntent {
  const corpus = `${extractLastUserText(history)}\n${question}`.trim();
  if (!corpus) return "general";
  if (SALES_RE.test(corpus)) return "sales";
  if (BILLING_RE.test(corpus)) return "billing";
  if (TECHNICAL_RE.test(corpus)) return "technical";
  return "general";
}
