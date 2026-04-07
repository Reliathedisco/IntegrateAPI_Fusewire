import pool from "@/lib/db";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

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
    const [gapsRes, topGapsRes, reasonBreakdownRes] = await Promise.all([
      // Recent gaps with details
      pool.query<{
        id: string;
        question: string;
        top_score: number;
        reason: string;
        created_at: string;
      }>(
        `SELECT id, question, top_score, reason, created_at
         FROM support_knowledge_gaps
         WHERE created_at >= NOW() - ($1 || ' days')::interval
         ORDER BY created_at DESC
         LIMIT 50`,
        [days],
      ),
      // Most frequent unanswered questions
      pool.query<{ question: string; count: number; avg_score: number }>(
        `SELECT question, COUNT(*)::int AS count, AVG(top_score)::float8 AS avg_score
         FROM support_knowledge_gaps
         WHERE created_at >= NOW() - ($1 || ' days')::interval
         GROUP BY question
         ORDER BY count DESC
         LIMIT 20`,
        [days],
      ),
      // Breakdown by reason
      pool.query<{ reason: string; count: number }>(
        `SELECT reason, COUNT(*)::int AS count
         FROM support_knowledge_gaps
         WHERE created_at >= NOW() - ($1 || ' days')::interval
         GROUP BY reason
         ORDER BY count DESC`,
        [days],
      ),
    ]);

    return NextResponse.json({
      days,
      totalGaps: gapsRes.rows.length,
      recentGaps: gapsRes.rows,
      topUnanswered: topGapsRes.rows,
      reasonBreakdown: reasonBreakdownRes.rows,
    });
  } catch (e) {
    logger.error("support_knowledge_gaps_api_failed", {
      message: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json(
      { error: "Could not load knowledge gaps." },
      { status: 502 },
    );
  }
}
