-- Analytics indexes for support chat dashboard queries
-- These improve performance for date-range aggregations used by /api/support/analytics

CREATE INDEX IF NOT EXISTS support_chat_turns_created_idx
    ON support_chat_turns (created_at DESC);

CREATE INDEX IF NOT EXISTS support_chat_turns_intent_created_idx
    ON support_chat_turns (intent, created_at DESC);

CREATE INDEX IF NOT EXISTS support_chat_turns_escalation_created_idx
    ON support_chat_turns (escalation_suggested, created_at DESC)
    WHERE escalation_suggested = TRUE;

CREATE INDEX IF NOT EXISTS support_chat_feedback_created_idx
    ON support_chat_feedback (created_at DESC);

CREATE INDEX IF NOT EXISTS support_knowledge_gaps_created_idx
    ON support_knowledge_gaps (created_at DESC);

CREATE INDEX IF NOT EXISTS support_knowledge_gaps_question_idx
    ON support_knowledge_gaps (question, created_at DESC);
