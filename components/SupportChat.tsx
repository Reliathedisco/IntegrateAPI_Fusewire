"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

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
  "What's included in the Free vs Pro plans?",
  "Where do I put API keys after installing an integration?",
];

const INTENT_LABELS: Record<Intent, string> = {
  billing: "Billing",
  technical: "Technical",
  sales: "Sales",
  general: "General",
};

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
  const [feedbackNotes, setFeedbackNotes] = useState<Record<string, string>>({});
  const [feedbackNoteOpen, setFeedbackNoteOpen] = useState<Record<string, boolean>>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [handoffOpen, setHandoffOpen] = useState(false);
  const [handoffEmail, setHandoffEmail] = useState("");
  const [handoffMessage, setHandoffMessage] = useState("");
  const [handoffStatus, setHandoffStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [handoffResultText, setHandoffResultText] = useState<string | null>(
    null,
  );
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
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(
            data.error || "Could not reach the assistant. Try again.",
          );
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
            last.sources && last.sources.length > 0
              ? last.sources
              : sources ?? [];
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

        if (
          assistantContent.toLowerCase().includes("connect you to support")
        ) {
          setHandoffOpen(true);
        }
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Something went wrong. Try again.";
        setError(msg);
        setMessages((prev) =>
          prev.length > 0 ? prev.slice(0, -1) : prev,
        );
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
    async (turnId: string, vote: -1 | 1, note?: string) => {
      if (!conversationId) return;
      setFeedbackPendingByTurn((prev) => ({ ...prev, [turnId]: true }));
      try {
        const res = await fetch("/api/support/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId,
            turnId,
            vote,
            note: note || undefined,
          }),
        });
        if (!res.ok) {
          throw new Error("Failed to save feedback");
        }
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
    <div className="support-chat">
      <div className="support-chat-panel">
        <div className="support-chat-head">
          <div>
            <div className="support-chat-title">IntegrateAPI Support</div>
            <div className="support-chat-sub">
              Answers use retrieved documentation. If it isn&apos;t in context, the
              assistant will say so.
            </div>
          </div>
          <button
            type="button"
            className="support-chat-clear"
            onClick={() => {
              setMessages([]);
              setConversationId(null);
              setFeedbackByTurn({});
              setFeedbackPendingByTurn({});
              setFeedbackNotes({});
              setFeedbackNoteOpen({});
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
          >
            Clear chat
          </button>
        </div>

        <div className="support-chat-suggestions" aria-label="Suggested questions">
          {SUGGESTED.map((q) => (
            <button
              key={q}
              type="button"
              className="support-chip"
              disabled={disableComposer}
              onClick={() => void sendChat(q)}
            >
              {q}
            </button>
          ))}
        </div>

        <div className="support-chat-transcript" role="log" aria-live="polite">
          {messages.length === 0 && (
            <p className="support-chat-empty">
              Ask about the CLI, templates, pricing, or setup. Short, specific
              questions work best.
            </p>
          )}

          {messages.map((m, i) => (
            <div
              key={`${i}-${m.role}`}
              className={`support-msg support-msg-${m.role}`}
            >
              <div className="support-msg-header">
                <div className="support-msg-label">
                  {m.role === "user" ? "You" : "IntegrateAPI"}
                </div>
                {m.role === "assistant" && m.intent && (
                  <span className={`support-intent-badge support-intent-${m.intent}`}>
                    {INTENT_LABELS[m.intent]}
                  </span>
                )}
              </div>

              {m.role === "assistant" && m.confidence === "low" && (
                <div className="support-confidence-badge support-confidence-low">
                  This answer may be incomplete
                  {typeof m.topScore === "number" && (
                    <span className="support-confidence-score">
                      score {m.topScore.toFixed(2)}
                    </span>
                  )}
                </div>
              )}
              {m.role === "assistant" && m.confidence === "medium" && (
                <div className="support-confidence-badge support-confidence-medium">
                  Moderate confidence
                  {typeof m.topScore === "number" && (
                    <span className="support-confidence-score">
                      score {m.topScore.toFixed(2)}
                    </span>
                  )}
                </div>
              )}

              <div className="support-msg-body">{m.content}</div>

              {m.role === "assistant" &&
                m.sources &&
                m.sources.length > 0 && (
                  <div className="support-msg-sources">
                    <div className="support-source-pills">
                      {m.sources.map((s) => {
                        const href = sourceHref(s.source);
                        return href ? (
                          <a
                            key={s.id}
                            href={href}
                            className="support-source-pill"
                            target="_blank"
                            rel="noreferrer"
                            title={s.source}
                          >
                            <span className="support-source-pill-icon">
                              &#9679;
                            </span>
                            {s.title}
                          </a>
                        ) : (
                          <span
                            key={s.id}
                            className="support-source-pill"
                            title={s.source}
                          >
                            <span className="support-source-pill-icon">
                              &#9679;
                            </span>
                            {s.title}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

              {m.role === "assistant" && m.turnId && (
                <div className="support-feedback">
                  <span className="support-feedback-label">Helpful?</span>
                  <button
                    type="button"
                    className={`support-feedback-btn ${
                      feedbackByTurn[m.turnId] === 1 ? "active" : ""
                    }`}
                    disabled={feedbackPendingByTurn[m.turnId]}
                    onClick={() => {
                      const note = feedbackNotes[m.turnId!] || "";
                      void submitFeedback(m.turnId as string, 1, note);
                    }}
                    title="Helpful"
                  >
                    👍
                  </button>
                  <button
                    type="button"
                    className={`support-feedback-btn ${
                      feedbackByTurn[m.turnId] === -1 ? "active" : ""
                    }`}
                    disabled={feedbackPendingByTurn[m.turnId]}
                    onClick={() => {
                      if (!feedbackNoteOpen[m.turnId!]) {
                        setFeedbackNoteOpen((prev) => ({
                          ...prev,
                          [m.turnId!]: true,
                        }));
                      } else {
                        const note = feedbackNotes[m.turnId!] || "";
                        void submitFeedback(m.turnId as string, -1, note);
                      }
                    }}
                    title="Not helpful"
                  >
                    👎
                  </button>
                  {feedbackNoteOpen[m.turnId] &&
                    !feedbackByTurn[m.turnId] && (
                      <div className="support-feedback-note">
                        <input
                          type="text"
                          className="support-feedback-note-input"
                          placeholder="What was wrong? (optional)"
                          value={feedbackNotes[m.turnId] ?? ""}
                          onChange={(e) =>
                            setFeedbackNotes((prev) => ({
                              ...prev,
                              [m.turnId!]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              void submitFeedback(
                                m.turnId as string,
                                -1,
                                feedbackNotes[m.turnId!] || "",
                              );
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="support-feedback-note-send"
                          onClick={() => {
                            void submitFeedback(
                              m.turnId as string,
                              -1,
                              feedbackNotes[m.turnId!] || "",
                            );
                          }}
                        >
                          Send
                        </button>
                      </div>
                    )}
                  {feedbackByTurn[m.turnId] && (
                    <span className="support-feedback-thanks">
                      Thanks for the feedback
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading &&
            messages.length > 0 &&
            messages[messages.length - 1].role === "user" && (
              <div className="support-msg support-msg-assistant">
                <div className="support-msg-label">IntegrateAPI</div>
                <div className="support-typing" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

          <div ref={endRef} />
        </div>

        {error && (
          <div className="support-error" role="alert">
            {error}
          </div>
        )}

        <form className="support-composer" onSubmit={onSubmit}>
          <textarea
            className="support-input"
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
          />
          <button
            type="submit"
            className="btn-primary support-send"
            disabled={disableComposer || !input.trim()}
          >
            Send
          </button>
        </form>
      </div>

      <aside className="support-handoff">
        <button
          type="button"
          className="support-handoff-toggle"
          onClick={() => setHandoffOpen((o) => !o)}
          aria-expanded={handoffOpen}
        >
          {handoffOpen ? "Hide follow-up form" : "Talk to a human"}
        </button>

        {handoffOpen && (
          <div className="support-handoff-panel">
            <p className="support-handoff-lead">
              Leave an email and a short note. Our team will follow up.
            </p>
            <form className="support-handoff-form" onSubmit={submitHandoff}>
              <label className="support-field">
                <span>Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={handoffEmail}
                  onChange={(e) => setHandoffEmail(e.target.value)}
                  required
                  disabled={handoffStatus === "sending"}
                />
              </label>
              <label className="support-field">
                <span>What do you need?</span>
                <textarea
                  rows={3}
                  value={handoffMessage}
                  onChange={(e) => setHandoffMessage(e.target.value)}
                  required
                  disabled={handoffStatus === "sending"}
                />
              </label>
              <button
                type="submit"
                className="btn-ghost"
                disabled={handoffStatus === "sending"}
              >
                {handoffStatus === "sending" ? "Sending..." : "Submit"}
              </button>
            </form>
            {handoffStatus === "sent" && handoffResultText && (
              <p className="support-handoff-success">{handoffResultText}</p>
            )}
            {handoffStatus === "error" && (
              <p className="support-handoff-error">
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
