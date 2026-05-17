"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Eyebrow } from "@/components/ui/Eyebrow";

type SourceRef = {
  id: string;
  title: string;
  source: string;
};

type Intent = "billing" | "technical" | "sales" | "general";
type Confidence = "high" | "medium" | "low";

type UiMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: SourceRef[];
  topScore?: number;
  confidence?: Confidence;
  intent?: Intent;
  escalationSuggested?: boolean;
  turnId?: string;
};

const STORAGE_MESSAGES_KEY = "integrateapi-support-chat-v2-messages";
const STORAGE_CONVERSATION_KEY = "integrateapi-support-chat-v2-conversation-id";

const SUGGESTED = [
  "How does IntegrateAPI work?",
  "What CLI commands should I know?",
  "How do I add Stripe to my project?",
  "Free vs Pro?",
  "Where do API keys go after install?",
];

type StreamEvent =
  | {
      type: "meta";
      sources: SourceRef[];
      escalationSuggested: boolean;
      topScore: number;
      confidence: Confidence;
      intent: Intent;
      conversationId: string;
    }
  | { type: "delta"; text: string }
  | { type: "done"; conversationId?: string; turnId?: string };

function sourceHref(source: string): string | null {
  try {
    const normalized = source.trim();
    if (!normalized) return null;
    const url = new URL(normalized);
    if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
    return null;
  } catch {
    return null;
  }
}

function parseSseLines(buffer: string): { events: StreamEvent[]; rest: string } {
  const parts = buffer.split("\n\n");
  const rest = parts.pop() ?? "";
  const events: StreamEvent[] = [];
  for (const block of parts) {
    const line = block.trim();
    if (!line.startsWith("data:")) continue;
    const payload = line.slice(5).trim();
    try {
      events.push(JSON.parse(payload) as StreamEvent);
    } catch {
      continue;
    }
  }
  return { events, rest };
}

export default function SupportChat() {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [feedbackByTurn, setFeedbackByTurn] = useState<Record<string, -1 | 1>>({});
  const [feedbackPendingByTurn, setFeedbackPendingByTurn] = useState<
    Record<string, boolean>
  >({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [handoffOpen, setHandoffOpen] = useState(false);
  const [handoffEmail, setHandoffEmail] = useState("");
  const [handoffMessage, setHandoffMessage] = useState("");
  const [handoffStatus, setHandoffStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [handoffResultText, setHandoffResultText] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const rawConversation = sessionStorage.getItem(STORAGE_CONVERSATION_KEY);
      if (rawConversation) setConversationId(rawConversation);
      const raw = sessionStorage.getItem(STORAGE_MESSAGES_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return;
      const cleaned: UiMessage[] = [];
      for (const m of parsed) {
        if (
          m &&
          typeof m === "object" &&
          (m as UiMessage).role &&
          typeof (m as UiMessage).content === "string"
        ) {
          cleaned.push({
            role: (m as UiMessage).role,
            content: (m as UiMessage).content,
            sources: Array.isArray((m as UiMessage).sources)
              ? (m as UiMessage).sources
              : undefined,
            topScore:
              typeof (m as UiMessage).topScore === "number"
                ? (m as UiMessage).topScore
                : undefined,
            confidence:
              (m as UiMessage).confidence === "high" ||
              (m as UiMessage).confidence === "medium" ||
              (m as UiMessage).confidence === "low"
                ? (m as UiMessage).confidence
                : undefined,
            intent:
              (m as UiMessage).intent === "billing" ||
              (m as UiMessage).intent === "technical" ||
              (m as UiMessage).intent === "sales" ||
              (m as UiMessage).intent === "general"
                ? (m as UiMessage).intent
                : undefined,
            escalationSuggested:
              typeof (m as UiMessage).escalationSuggested === "boolean"
                ? (m as UiMessage).escalationSuggested
                : undefined,
            turnId:
              typeof (m as UiMessage).turnId === "string"
                ? (m as UiMessage).turnId
                : undefined,
          });
        }
      }
      if (cleaned.length) setMessages(cleaned);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(messages));
      if (conversationId) {
        sessionStorage.setItem(STORAGE_CONVERSATION_KEY, conversationId);
      }
    } catch {
      /* ignore */
    }
  }, [messages, conversationId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendChat = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setError(null);
      setHandoffStatus("idle");

      const pendingForApi: UiMessage[] = [
        ...messages,
        { role: "user", content: trimmed },
      ];
      const apiMessages = pendingForApi.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      setMessages(pendingForApi);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/support/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({
            messages: apiMessages,
            stream: true,
            conversationId,
          }),
        });

        if (!res.ok || !res.body) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error || "Could not reach the assistant. Try again.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let backlog = "";
        let sources: SourceRef[] | undefined;
        let topScore: number | undefined;
        let confidence: Confidence | undefined;
        let intent: Intent | undefined;
        let escalationSuggested: boolean | undefined;
        let latestTurnId: string | undefined;
        let assistantContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          backlog += decoder.decode(value, { stream: true });
          const { events, rest } = parseSseLines(backlog);
          backlog = rest;

          for (const ev of events) {
            if (ev.type === "meta") {
              sources = ev.sources;
              topScore = ev.topScore;
              confidence = ev.confidence;
              intent = ev.intent;
              escalationSuggested = ev.escalationSuggested;
              if (ev.conversationId) setConversationId(ev.conversationId);
              if (ev.escalationSuggested) setHandoffOpen(true);
            } else if (ev.type === "delta" && ev.text) {
              assistantContent += ev.text;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return [
                    ...prev.slice(0, -1),
                    {
                      role: "assistant",
                      content: last.content + ev.text,
                      sources: last.sources ?? sources,
                      topScore: last.topScore ?? topScore,
                      confidence: last.confidence ?? confidence,
                      intent: last.intent ?? intent,
                      escalationSuggested:
                        last.escalationSuggested ?? escalationSuggested,
                      turnId: last.turnId,
                    },
                  ];
                }
                return [
                  ...prev,
                  {
                    role: "assistant",
                    content: ev.text,
                    sources,
                    topScore,
                    confidence,
                    intent,
                    escalationSuggested,
                  },
                ];
              });
            } else if (ev.type === "done") {
              latestTurnId = ev.turnId;
              if (ev.conversationId) setConversationId(ev.conversationId);
            }
          }
        }

        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role !== "assistant") return prev;
          const mergedSources =
            last.sources && last.sources.length > 0 ? last.sources : sources ?? [];
          return [
            ...prev.slice(0, -1),
            {
              ...last,
              sources: mergedSources,
              topScore: last.topScore ?? topScore,
              confidence: last.confidence ?? confidence,
              intent: last.intent ?? intent,
              escalationSuggested: last.escalationSuggested ?? escalationSuggested,
              turnId: latestTurnId ?? last.turnId,
            },
          ];
        });

        if (assistantContent.toLowerCase().includes("connect you to support")) {
          setHandoffOpen(true);
        }
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Something went wrong. Try again.";
        setError(msg);
        setMessages((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
      } finally {
        setLoading(false);
      }
    },
    [conversationId, loading, messages],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendChat(input);
  };

  const submitFeedback = useCallback(
    async (turnId: string, vote: -1 | 1) => {
      if (!conversationId) return;
      setFeedbackPendingByTurn((prev) => ({ ...prev, [turnId]: true }));
      try {
        const res = await fetch("/api/support/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, turnId, vote }),
        });
        if (!res.ok) throw new Error("Failed to save feedback");
        setFeedbackByTurn((prev) => ({ ...prev, [turnId]: vote }));
      } catch {
        setError("Couldn't save feedback right now. Please try again.");
      } finally {
        setFeedbackPendingByTurn((prev) => ({ ...prev, [turnId]: false }));
      }
    },
    [conversationId],
  );

  const submitHandoff = async (e: FormEvent) => {
    e.preventDefault();
    const email = handoffEmail.trim();
    const message = handoffMessage.trim();
    if (!email || !message) return;

    setHandoffStatus("sending");
    setHandoffResultText(null);
    try {
      const res = await fetch("/api/support/escalation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          message,
          topic: "support_chat_handoff",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        detail?: string;
      };
      if (!res.ok || !data.ok) {
        setHandoffStatus("error");
        setHandoffResultText(data.error ?? null);
        return;
      }
      setHandoffStatus("sent");
      setHandoffResultText(
        typeof data.detail === "string"
          ? data.detail
          : "Thanks — we received your request.",
      );
      setHandoffMessage("");
    } catch {
      setHandoffStatus("error");
      setHandoffResultText(null);
    }
  };

  const disableComposer = loading;

  return (
    <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]">
      <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div>
            <Eyebrow>IntegrateAPI assistant</Eyebrow>
            <p className="mt-2 max-w-prose text-sm text-mute">
              Answers use retrieved documentation. If it isn&apos;t in context, the
              assistant will say so.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setMessages([]);
              setConversationId(null);
              setFeedbackByTurn({});
              setFeedbackPendingByTurn({});
              setError(null);
              setHandoffOpen(false);
              setHandoffStatus("idle");
              setHandoffResultText(null);
              try {
                sessionStorage.removeItem(STORAGE_MESSAGES_KEY);
                sessionStorage.removeItem(STORAGE_CONVERSATION_KEY);
              } catch {
                /* ignore */
              }
            }}
            className="rounded-md border border-line px-2.5 py-1.5 font-mono text-[11px] text-mute transition hover:border-line-strong hover:text-ink"
          >
            Clear
          </button>
        </div>

        <div
          className="mt-4 flex flex-wrap gap-2"
          aria-label="Suggested questions"
        >
          {SUGGESTED.map((q) => (
            <button
              key={q}
              type="button"
              disabled={disableComposer}
              onClick={() => void sendChat(q)}
              className="rounded-full border border-accent/20 bg-accent-tint px-3 py-1.5 font-mono text-[11px] text-mute transition hover:border-accent/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        <div
          className="mt-4 max-h-[min(560px,70vh)] min-h-[320px] overflow-y-auto rounded-xl border border-line bg-paper-soft p-4"
          role="log"
          aria-live="polite"
        >
          {messages.length === 0 && (
            <p className="text-sm text-mute">
              Ask about the CLI, templates, pricing, or setup. Short, specific
              questions work best.
            </p>
          )}

          {messages.map((m, i) => (
            <div key={`${i}-${m.role}`} className="mb-4 last:mb-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-faint">
                {m.role === "user" ? "You" : "IntegrateAPI"}
              </p>
              {m.role === "assistant" && m.confidence === "low" && (
                <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-yellow-700">
                  Answer may be incomplete
                  {typeof m.topScore === "number" && (
                    <span className="opacity-80">
                      score {m.topScore.toFixed(2)}
                    </span>
                  )}
                </div>
              )}
              <p
                className={cn(
                  "mt-1.5 text-sm/6 whitespace-pre-wrap",
                  m.role === "user" ? "text-mute" : "text-ink",
                )}
              >
                {m.content}
              </p>
              {m.role === "assistant" && m.sources && m.sources.length > 0 && (
                <div className="mt-3 border-t border-dashed border-line pt-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-faint">
                    Source citations
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.sources.map((s) =>
                      sourceHref(s.source) ? (
                        <a
                          key={s.id}
                          href={sourceHref(s.source) ?? undefined}
                          target="_blank"
                          rel="noreferrer"
                          title={s.source}
                          className="inline-flex items-center rounded-full border border-accent/25 bg-accent-tint px-2.5 py-1 font-mono text-[11px] text-accent transition hover:border-accent/50"
                        >
                          {s.title}
                        </a>
                      ) : (
                        <span
                          key={s.id}
                          title={s.source}
                          className="inline-flex items-center rounded-full border border-accent/25 bg-accent-tint px-2.5 py-1 font-mono text-[11px] text-accent"
                        >
                          {s.title}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}
              {m.role === "assistant" && m.turnId && (
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-faint">
                    Useful?
                  </span>
                  {[1 as const, -1 as const].map((vote) => (
                    <button
                      key={vote}
                      type="button"
                      disabled={feedbackPendingByTurn[m.turnId as string]}
                      onClick={() =>
                        void submitFeedback(m.turnId as string, vote)
                      }
                      className={cn(
                        "rounded-md border px-2 py-0.5 text-sm transition disabled:opacity-50",
                        feedbackByTurn[m.turnId as string] === vote
                          ? "border-accent/50 text-accent"
                          : "border-line text-mute hover:border-line-strong hover:text-ink",
                      )}
                    >
                      {vote === 1 ? "👍" : "👎"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading &&
            messages.length > 0 &&
            messages[messages.length - 1].role === "user" && (
              <div className="mb-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-faint">
                  IntegrateAPI
                </p>
                <div
                  className="mt-2 flex gap-1.5 py-1"
                  aria-hidden="true"
                >
                  <span className="size-1.5 animate-pulse rounded-full bg-faint [animation-delay:0ms]" />
                  <span className="size-1.5 animate-pulse rounded-full bg-faint [animation-delay:150ms]" />
                  <span className="size-1.5 animate-pulse rounded-full bg-faint [animation-delay:300ms]" />
                </div>
              </div>
            )}

          <div ref={endRef} />
        </div>

        {error && (
          <div
            className="mt-3 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
            role="alert"
          >
            {error}
          </div>
        )}

        <form className="mt-4 flex items-end gap-2" onSubmit={onSubmit}>
          <label htmlFor="support-input" className="sr-only">
            Message
          </label>
          <textarea
            id="support-input"
            rows={2}
            placeholder="Ask a question about IntegrateAPI..."
            value={input}
            disabled={disableComposer}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendChat(input);
              }
            }}
            className="min-h-11 max-h-40 flex-1 resize-y rounded-xl border border-line bg-paper px-3 py-3 text-sm text-ink outline-hidden transition focus:border-accent focus:ring-3 focus:ring-accent/10 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={disableComposer || !input.trim()}
            className="h-11 rounded-full bg-ink px-5 text-sm font-medium text-paper transition hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>

      <aside className="rounded-2xl border border-line bg-card p-5 md:sticky md:top-20">
        <button
          type="button"
          onClick={() => setHandoffOpen((o) => !o)}
          aria-expanded={handoffOpen}
          className="w-full text-left font-mono text-xs text-accent transition hover:underline"
        >
          {handoffOpen ? "Hide follow-up form" : "Talk to a human (demo)"}
        </button>

        {handoffOpen && (
          <div className="mt-3">
            <p className="text-sm text-mute">
              Leave an email and a short note. This demo logs the request only —
              no inbox delivery yet.
            </p>
            <form
              className="mt-3 flex flex-col gap-3"
              onSubmit={submitHandoff}
            >
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-faint">
                  Email
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  value={handoffEmail}
                  onChange={(e) => setHandoffEmail(e.target.value)}
                  required
                  disabled={handoffStatus === "sending"}
                  className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-hidden transition focus:border-accent disabled:opacity-60"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-faint">
                  What do you need?
                </span>
                <textarea
                  rows={3}
                  value={handoffMessage}
                  onChange={(e) => setHandoffMessage(e.target.value)}
                  required
                  disabled={handoffStatus === "sending"}
                  className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-hidden transition focus:border-accent disabled:opacity-60"
                />
              </label>
              <button
                type="submit"
                disabled={handoffStatus === "sending"}
                className="rounded-full border border-line bg-paper px-4 py-2 text-sm font-medium text-mute transition hover:border-line-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                {handoffStatus === "sending" ? "Sending…" : "Submit"}
              </button>
            </form>
            {handoffStatus === "sent" && handoffResultText && (
              <p className="mt-3 text-sm text-success">{handoffResultText}</p>
            )}
            {handoffStatus === "error" && (
              <p className="mt-3 text-sm text-danger">
                {handoffResultText ||
                  "Couldn't submit right now. Try again in a moment."}
              </p>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
