"use client";

import { useCallback, useEffect, useState } from "react";

type TopQuestion = { question: string; count: number };
type VolumeByDay = { date: string; count: number };
type IntentBreakdown = { intent: string; count: number };
type ConfidenceBreakdown = { confidence: string; count: number };

type AnalyticsData = {
  days: number;
  totalTurns: number;
  escalationCount: number;
  escalationRate: number;
  feedback: {
    thumbsUp: number;
    thumbsDown: number;
    total: number;
    satisfactionRate: number | null;
  };
  knowledgeGaps: number;
  topQuestions: TopQuestion[];
  volumeByDay: VolumeByDay[];
  intentBreakdown: IntentBreakdown[];
  confidenceBreakdown: ConfidenceBreakdown[];
};

type GapData = {
  days: number;
  totalGaps: number;
  topUnanswered: { question: string; count: number; avg_score: number }[];
  reasonBreakdown: { reason: string; count: number }[];
};

const INTENT_COLORS: Record<string, string> = {
  technical: "#4f8cff",
  billing: "#ffd18b",
  sales: "#9b7aff",
  general: "#6ee7b7",
};

const CONFIDENCE_COLORS: Record<string, string> = {
  high: "#6ee7b7",
  medium: "#ffd18b",
  low: "#ff8b8b",
};

function BarChart({
  data,
  colorMap,
}: {
  data: { label: string; value: number }[];
  colorMap?: Record<string, string>;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="analytics-bar-chart">
      {data.map((d) => (
        <div key={d.label} className="analytics-bar-row">
          <span className="analytics-bar-label">{d.label}</span>
          <div className="analytics-bar-track">
            <div
              className="analytics-bar-fill"
              style={{
                width: `${(d.value / max) * 100}%`,
                background: colorMap?.[d.label] ?? "var(--accent)",
              }}
            />
          </div>
          <span className="analytics-bar-value">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

function VolumeChart({ data }: { data: VolumeByDay[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="analytics-volume-chart">
      {data.map((d) => (
        <div key={d.date} className="analytics-volume-col">
          <div
            className="analytics-volume-bar"
            style={{ height: `${(d.count / max) * 100}%` }}
            title={`${d.date}: ${d.count} queries`}
          />
          <span className="analytics-volume-label">
            {new Date(d.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="analytics-stat">
      <div className="analytics-stat-value">{value}</div>
      <div className="analytics-stat-label">{label}</div>
      {sub && <div className="analytics-stat-sub">{sub}</div>}
    </div>
  );
}

export default function SupportAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [gaps, setGaps] = useState<GapData | null>(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (d: number) => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, gapsRes] = await Promise.all([
        fetch(`/api/support/analytics?days=${d}`),
        fetch(`/api/support/knowledge-gaps?days=${d}`),
      ]);
      if (!analyticsRes.ok) throw new Error("Failed to load analytics");
      const analyticsData = (await analyticsRes.json()) as AnalyticsData;
      setData(analyticsData);
      if (gapsRes.ok) {
        setGaps((await gapsRes.json()) as GapData);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData(days);
  }, [days, fetchData]);

  if (loading && !data) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  if (error && !data) {
    return <div className="analytics-error">{error}</div>;
  }

  if (!data) return null;

  return (
    <div className="analytics-dashboard">
      <div className="analytics-controls">
        {[7, 14, 30].map((d) => (
          <button
            key={d}
            type="button"
            className={`analytics-period-btn ${d === days ? "active" : ""}`}
            onClick={() => setDays(d)}
          >
            {d}d
          </button>
        ))}
      </div>

      <div className="analytics-stats-grid">
        <StatCard label="Total queries" value={data.totalTurns} />
        <StatCard
          label="Escalation rate"
          value={`${(data.escalationRate * 100).toFixed(1)}%`}
          sub={`${data.escalationCount} escalations`}
        />
        <StatCard
          label="Satisfaction"
          value={
            data.feedback.satisfactionRate !== null
              ? `${(data.feedback.satisfactionRate * 100).toFixed(0)}%`
              : "—"
          }
          sub={`${data.feedback.thumbsUp} up / ${data.feedback.thumbsDown} down`}
        />
        <StatCard label="Knowledge gaps" value={data.knowledgeGaps} />
      </div>

      {data.volumeByDay.length > 0 && (
        <div className="analytics-section">
          <h2>Query volume</h2>
          <VolumeChart data={data.volumeByDay} />
        </div>
      )}

      <div className="analytics-two-col">
        {data.intentBreakdown.length > 0 && (
          <div className="analytics-section">
            <h2>Intent breakdown</h2>
            <BarChart
              data={data.intentBreakdown.map((d) => ({
                label: d.intent,
                value: d.count,
              }))}
              colorMap={INTENT_COLORS}
            />
          </div>
        )}

        {data.confidenceBreakdown.length > 0 && (
          <div className="analytics-section">
            <h2>Confidence breakdown</h2>
            <BarChart
              data={data.confidenceBreakdown.map((d) => ({
                label: d.confidence,
                value: d.count,
              }))}
              colorMap={CONFIDENCE_COLORS}
            />
          </div>
        )}
      </div>

      {data.topQuestions.length > 0 && (
        <div className="analytics-section">
          <h2>Top questions</h2>
          <div className="analytics-top-questions">
            {data.topQuestions.map((q, i) => (
              <div key={i} className="analytics-question-row">
                <span className="analytics-question-count">{q.count}x</span>
                <span className="analytics-question-text">
                  {q.question.length > 120
                    ? q.question.slice(0, 120) + "..."
                    : q.question}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {gaps && gaps.topUnanswered.length > 0 && (
        <div className="analytics-section">
          <h2>Knowledge gaps</h2>
          <p className="analytics-section-sub">
            Questions that triggered escalation or scored low — these are what
            your docs don&apos;t cover.
          </p>
          <div className="analytics-top-questions">
            {gaps.topUnanswered.map((g, i) => (
              <div key={i} className="analytics-question-row">
                <span className="analytics-question-count">{g.count}x</span>
                <span className="analytics-question-text">
                  {g.question.length > 120
                    ? g.question.slice(0, 120) + "..."
                    : g.question}
                </span>
                <span className="analytics-gap-score">
                  avg {g.avg_score.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
