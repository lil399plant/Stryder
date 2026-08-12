"use client";

import * as React from "react";
import { Bot, Loader2, Send, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { makeId } from "@/lib/id";
import { useTriageMessages, setTriageMessages, type TriageMessage } from "@/lib/triage";

// Standalone "Ask AI" module. Deliberately disconnected from the rest of the
// app: it doesn't read or write AppData, doesn't touch Supabase, and its
// history lives only in this browser's localStorage (see lib/triage.ts).

export default function TriagePage() {
  const messages = useTriageMessages();
  const [draft, setDraft] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

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

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col md:h-[calc(100dvh-3rem)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold leading-tight">AI Triage</h1>
          <p className="text-[13px] text-muted-foreground">
            Ask anything — standalone from your puppy log. Not a vet; when in doubt, call one.
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
              This chat is separate from Today, Log, Training, and Health — nothing here is saved to
              your shared log.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex items-end gap-2", m.role === "user" && "flex-row-reverse")}>
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
            ))}
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
    </div>
  );
}
