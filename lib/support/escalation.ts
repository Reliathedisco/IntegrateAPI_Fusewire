import type { RetrievedChunk } from "./types";

const COMPLEX_PATTERNS =
  /\b(enterprise|sla|legal|gdpr|hipaa|soc\s*2|custom\s+integration|white-?label|on-?prem|self-?host|refund|chargeback|fraud|lawyer|contract|vendor|procurement)\b/i;

const BROKEN_PATTERNS =
  /\b(doesn'?t work|not working|broken|bug|crash|error code|502|500|timeout|data\s*loss|hacked|breach)\b/i;

/** Heuristic: escalate when the question is vague, emotionally charged about incidents, or explicitly enterprise/legal. */
export function shouldEscalate(
  userText: string,
  retrieval: RetrievedChunk[],
  topScore: number,
): boolean {
  const q = userText.trim();
  const wordCount = q ? q.split(/\s+/).length : 0;

  if (wordCount === 1 && q.length < 24) {
    return true;
  }

  if (/^(hi|hey|hello|help|support)\b/i.test(q) && q.length < 20) {
    return true;
  }

  if (COMPLEX_PATTERNS.test(q) || BROKEN_PATTERNS.test(q)) {
    return true;
  }

  if (q.length > 320) {
    return true;
  }

  const strongHit = topScore >= 0.75;
  if (!strongHit && retrieval.length > 0) {
    return true;
  }

  return false;
}
