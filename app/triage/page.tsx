"use client";

import * as React from "react";
import { Bot, Loader2, Send, Trash2, User, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { makeId } from "@/lib/id";
import { useTriageMessages, setTriageMessages, updateTriageMessage, type TriageMessage } from "@/lib/triage";
import { looksLikeLogEntry } from "@/lib/log-heuristic";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import type { ImportExtraction } from "@/lib/import-text";
import { countExtraction } from "@/lib/import-text";
import { commitExtraction } from "@/lib/import-commit";
import { ImportPreviewList } from "@/components/import/ImportPreviewList";
import { buildTriageContext } from "@/lib/triage-context";

// "Ask AI" module. It has read-only access to the puppy's profile and
// everything under the Log tab (see lib/triage-context.ts for exactly what
// that includes) — sent fresh with every message so it can answer
// Stryder-specific questions ("when did he last eat?"). It deliberately
// does NOT see Training or Health data, and this chat's own history lives
// only in this browser's localStorage (see lib/triage.ts), never synced to
// Supabase.
//
// The one write path back the other way: if a message you typed reads like
// a log entry ("8am-9am walk, peed quickly"), a button offers to import it
// into the real shared log. That import only ever happens on explicit
// confirmation, after a preview, and only ever adds entries — see
// lib/import-commit.ts.

type ReviewState = { messageId: string; extraction: ImportExtraction; skipped: number };

export default function TriagePage() {
  const messages = useTriageMessages();
  const store = useStore();
  const { showToast } = useToast();
  const [draft, setDraft] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const [extractingId, setExtractingId] = React.useState<string | null>(null);
  const [extractError, setExtractError] = React.useState<{ messageId: string; message: string } | null>(null);
  const [review, setReview] = React.useState<ReviewState | null>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  const send = async () => {
    const content = draft.trim();
    if (!content || sending) return;

    const userMessage: TriageMessage = {
      id: makeId(),
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    const nextMessages = [...messages, userMessage];
    setTriageMessages(nextMessages);
    setDraft("");
    setError(null);
    setSending(true);

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          context: store.data ? buildTriageContext(store.data) : undefined,
        }),
      });
      const body = await res.json().catch(() => null);

      if (!res.ok || !body?.reply) {
        if (res.status === 501) {
          setError("AI triage isn't set up yet — add a DEEPSEEK_API_KEY to enable it.");
        } else {
          setError("Couldn't reach the AI right now. Try again in a moment.");
        }
        return;
      }

      setTriageMessages([
        ...nextMessages,
        { id: makeId(), role: "assistant", content: body.reply as string, createdAt: new Date().toISOString() },
      ]);
    } catch {
      setError("Couldn't reach the AI right now. Try again in a moment.");
    } finally {
      setSending(false);
    }
  };

  const clearChat = () => {
    setTriageMessages([]);
    setError(null);
  };

  const requestImport = async (m: TriageMessage) => {
    if (!store.data || extractingId) return;
    setExtractingId(m.id);
    setExtractError(null);
    try {
      const res = await fetch("/api/import-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: m.content,
          referenceIso: m.createdAt,
          tzOffsetMinutes: new Date().getTimezoneOffset(),
          caregivers: store.data.caregivers.map((c) => ({ id: c.id, displayName: c.displayName })),
        }),
      });
      const body = await res.json().catch(() => null);

      if (!res.ok || !body?.extraction) {
        const msg =
          res.status === 501
            ? "AI import isn't set up yet — add a DEEPSEEK_API_KEY to enable it."
            : res.status === 422
              ? "Couldn't find a clear log entry in that message."
              : "Couldn't reach the AI right now. Try again in a moment.";
        setExtractError({ messageId: m.id, message: msg });
        return;
      }

      setReview({ messageId: m.id, extraction: body.extraction as ImportExtraction, skipped: body.skipped ?? 0 });
    } catch {
      setExtractError({ messageId: m.id, message: "Couldn't reach the AI right now. Try again in a moment." });
    } finally {
      setExtractingId(null);
    }
  };

  const dismissImport = (id: string) => {
    updateTriageMessage(id, { importState: "dismissed" });
    setExtractError((prev) => (prev?.messageId === id ? null : prev));
  };

  const confirmImport = () => {
    if (!review) return;
    const total = commitExtraction(store, review.extraction);
    updateTriageMessage(review.messageId, { importState: "imported" });
    showToast(`Added ${total} ${total === 1 ? "entry" : "entries"} to the log`);
    setReview(null);
  };

  const caregiverName = (id: string) => store.data?.caregivers.find((c) => c.id === id)?.displayName ?? id;
  const reviewTotal = review ? countExtraction(review.extraction) : 0;

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col md:h-[calc(100dvh-3rem)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold leading-tight">AI Triage</h1>
          <p className="text-[13px] text-muted-foreground">
            Can see Stryder&apos;s profile and Log — not Training or Health. Not a vet; when in doubt, call one.
          </p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="icon" onClick={clearChat} aria-label="Clear conversation">
            <Trash2 className="h-4.5 w-4.5 text-muted-foreground" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto rounded-2xl border border-border bg-surface p-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center px-6">
            <Bot className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-[14px] font-medium text-muted-foreground">Ask me anything</p>
            <p className="text-[12px] text-muted-foreground/80">
              I can see Stryder&apos;s profile and everything logged under Log — not Training or
              Health. Nothing here is saved to your shared log unless you say so.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((m) => {
              const suggestImport = m.role === "user" && !m.importState && looksLikeLogEntry(m.content);
              const isExtracting = extractingId === m.id;
              const err = extractError?.messageId === m.id ? extractError.message : null;

              return (
                <div key={m.id} className="flex flex-col gap-1.5">
                  <div className={cn("flex items-end gap-2", m.role === "user" && "flex-row-reverse")}>
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                        m.role === "user" ? "bg-forest-soft text-forest-soft-foreground" : "bg-tan-soft text-tan-soft-foreground"
                      )}
                    >
                      {m.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                    </div>
                    <div
                      className={cn(
                        "max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[14.5px] leading-relaxed",
                        m.role === "user"
                          ? "bg-forest text-forest-foreground"
                          : "bg-surface-raised border border-border text-foreground"
                      )}
                    >
                      {m.content}
                    </div>
                  </div>

                  {suggestImport && (
                    <div className="ml-9 flex flex-wrap items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => requestImport(m)}
                        disabled={isExtracting}
                      >
                        {isExtracting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                        {isExtracting ? "Reading…" : "Import Manual Log"}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => dismissImport(m.id)} disabled={isExtracting}>
                        Not now
                      </Button>
                    </div>
                  )}
                  {m.importState === "imported" && (
                    <div className="ml-9 flex items-center gap-1 text-[12px] text-forest">
                      <Check className="h-3.5 w-3.5" />
                      Added to log
                    </div>
                  )}
                  {err && <p className="ml-9 text-[12px] text-concern">{err}</p>}
                </div>
              );
            })}
            {sending && (
              <div className="flex items-end gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-tan-soft text-tan-soft-foreground">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-surface-raised px-3.5 py-2.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  <span className="text-[13px] text-muted-foreground">Thinking…</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-[12.5px] text-concern">{error}</p>}

      <form
        className="mt-3 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ask anything…"
          className="min-h-11 flex-1 resize-none"
          rows={1}
          disabled={sending}
        />
        <Button type="submit" size="icon" disabled={sending || !draft.trim()} aria-label="Send">
          {sending ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Send className="h-4.5 w-4.5" />}
        </Button>
      </form>

      <Sheet
        open={review !== null}
        onOpenChange={(o) => {
          if (!o) setReview(null);
        }}
        title="Add to your log?"
        description="Review what the AI found before adding it to your shared log."
        footer={
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setReview(null)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={confirmImport} disabled={reviewTotal === 0}>
              Add {reviewTotal} {reviewTotal === 1 ? "entry" : "entries"}
            </Button>
          </div>
        }
      >
        {review && (
          <div className="flex flex-col gap-4">
            {review.skipped > 0 && (
              <p className="text-[12.5px] text-muted-foreground">
                Skipped {review.skipped} {review.skipped === 1 ? "item" : "items"} that didn&apos;t look like a
                complete log entry.
              </p>
            )}
            <ImportPreviewList extraction={review.extraction} caregiverName={caregiverName} />
          </div>
        )}
      </Sheet>
    </div>
  );
}
