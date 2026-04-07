import pool from "@/lib/db";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type TopQuestion = { question: string; count: number };
type VolumeByDay = { date: string; count: number };
type IntentBreakdown = { intent: string; count: number };
type ConfidenceBreakdown = { confidence: string; count: number };

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const days = Math.min(Math.max(parseInt(searchParams.get("days") ?? "7", 10) || 7, 1), 90);

  if (!process.env.DATABASE_URL?.trim()) {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 },
    );
  }

  try {
    const [
      topQuestionsRes,
      volumeByDayRes,
      intentRes,
      confidenceRes,
      totalTurnsRes,
      escalationRes,
      feedbackRes,
      gapsRes,
    ] = await Promise.all([
      // Top 10 questions this period
      pool.query<TopQuestion>(
        `SELECT user_message AS question, COUNT(*)::int AS count
         FROM support_chat_turns
         WHERE created_at >= NOW() - ($1 || ' days')::interval
         GROUP BY user_message
         ORDER BY count DESC
         LIMIT 10`,
        [days],
      ),
      // Volume by day
      pool.query<VolumeByDay>(
        `SELECT DATE(created_at) AS date, COUNT(*)::int AS count
         FROM support_chat_turns
         WHERE created_at >= NOW() - ($1 || ' days')::interval
         GROUP BY DATE(created_at)
         ORDER BY date ASC`,
        [days],
      ),
      // Intent breakdown
      pool.query<IntentBreakdown>(
        `SELECT intent, COUNT(*)::int AS count
         FROM support_chat_turns
         WHERE created_at >= NOW() - ($1 || ' days')::interval
         GROUP BY intent
         ORDER BY count DESC`,
        [days],
      ),
      // Confidence breakdown
      pool.query<ConfidenceBreakdown>(
        `SELECT confidence, COUNT(*)::int AS count
         FROM support_chat_turns
         WHERE created_at >= NOW() - ($1 || ' days')::interval
         GROUP BY confidence
         ORDER BY count DESC`,
        [days],
      ),
      // Total turns
      pool.query<{ count: number }>(
        `SELECT COUNT(*)::int AS count
         FROM support_chat_turns
         WHERE created_at >= NOW() - ($1 || ' days')::interval`,
        [days],
      ),
      // Escalation rate
      pool.query<{ count: number }>(
        `SELECT COUNT(*)::int AS count
         FROM support_chat_turns
         WHERE created_at >= NOW() - ($1 || ' days')::interval
           AND escalation_suggested = TRUE`,
        [days],
      ),
      // Feedback summary
      pool.query<{ thumbs_up: number; thumbs_down: number }>(
        `SELECT
           COALESCE(SUM(CASE WHEN vote = 1 THEN 1 ELSE 0 END), 0)::int AS thumbs_up,
           COALESCE(SUM(CASE WHEN vote = -1 THEN 1 ELSE 0 END), 0)::int AS thumbs_down
         FROM support_chat_feedback
         WHERE created_at >= NOW() - ($1 || ' days')::interval`,
        [days],
      ),
      // Knowledge gaps count
      pool.query<{ count: number }>(
        `SELECT COUNT(*)::int AS count
         FROM support_knowledge_gaps
         WHERE created_at >= NOW() - ($1 || ' days')::interval`,
        [days],
      ),
    ]);

    const totalTurns = totalTurnsRes.rows[0]?.count ?? 0;
    const escalationCount = escalationRes.rows[0]?.count ?? 0;
    const feedback = feedbackRes.rows[0] ?? { thumbs_up: 0, thumbs_down: 0 };
    const knowledgeGaps = gapsRes.rows[0]?.count ?? 0;

    return NextResponse.json({
      days,
      totalTurns,
      escalationCount,
      escalationRate: totalTurns > 0 ? Number((escalationCount / totalTurns).toFixed(4)) : 0,
      feedback: {
        thumbsUp: feedback.thumbs_up,
        thumbsDown: feedback.thumbs_down,
        total: feedback.thumbs_up + feedback.thumbs_down,
        satisfactionRate:
          feedback.thumbs_up + feedback.thumbs_down > 0
            ? Number(
                (feedback.thumbs_up / (feedback.thumbs_up + feedback.thumbs_down)).toFixed(4),
              )
            : null,
      },
      knowledgeGaps,
      topQuestions: topQuestionsRes.rows,
      volumeByDay: volumeByDayRes.rows,
      intentBreakdown: intentRes.rows,
      confidenceBreakdown: confidenceRes.rows,
    });
  } catch (e) {
    logger.error("support_analytics_failed", {
      message: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json(
      { error: "Could not load analytics." },
      { status: 502 },
    );
  }
}
