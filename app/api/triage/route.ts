import { NextResponse } from "next/server";

// "Ask AI" module. This route never touches lib/store or lib/supabase
// itself — it only relays a chat history (plus, optionally, a read-only
// snapshot the client already has in memory) to DeepSeek and returns the
// reply. Uses a server-only API key (never exposed to the browser), same
// pattern as lib/supabase.ts.
//
// The `context` field is a plain-text snapshot the client builds from its
// own AppData via lib/triage-context.ts — the puppy's profile and Log-tab
// entries (potty/meals/naps/downstairs/events/incident notes) only.
// Training and Health data are never included; this route has no way to
// tell the difference, it just relays whatever text the client sends, so
// that boundary lives entirely in lib/triage-context.ts.

const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions";
const DEFAULT_MODEL = "deepseek-chat";

const BASE_SYSTEM_PROMPT =
  "You are the AI Triage assistant inside Stryder, a personal puppy-care app. " +
  "Answer whatever the user asks, clearly and concisely. If asked about an urgent " +
  "animal (or human) health or safety concern, say so plainly and recommend " +
  "contacting a vet, doctor, or emergency service promptly rather than relying " +
  "solely on your answer. Reply in plain prose only — no markdown syntax " +
  "(no **bold**, #headers, or | tables). Use line breaks and a leading \"- \" for " +
  "lists if structure helps; the chat UI renders plain text, not markdown.";

const NO_CONTEXT_SUFFIX =
  " You have no access to the user's logged data and no memory beyond this conversation.";

const WITH_CONTEXT_SUFFIX =
  " Below is a read-only snapshot of this specific puppy's profile and everything " +
  "logged under the Log tab (potty, meals, naps, downstairs trips, special events, " +
  "incident notes) — use it to answer questions about them specifically. You do NOT " +
  "have access to Training plans/sessions or Health records (vaccines, insurance, " +
  "health profile) — if asked about those, say you don't have access to that data " +
  "rather than guessing. This snapshot can go stale between messages if something " +
  "new gets logged mid-conversation — mention that if precision matters (e.g. exact " +
  "\"last meal\" timing) rather than stating it as certain.\n\n";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "not-configured" }, { status: 501 });
  }

  let body: { messages?: ChatMessage[]; context?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const messages = body.messages;
  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.some(
      (m) =>
        !m ||
        (m.role !== "user" && m.role !== "assistant") ||
        typeof m.content !== "string"
    )
  ) {
    return NextResponse.json({ error: "invalid-payload" }, { status: 400 });
  }

  const context = typeof body.context === "string" ? body.context.slice(0, 20_000) : null;
  const systemPrompt = context
    ? BASE_SYSTEM_PROMPT + WITH_CONTEXT_SUFFIX + context
    : BASE_SYSTEM_PROMPT + NO_CONTEXT_SUFFIX;

  try {
    const res = await fetch(DEEPSEEK_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || DEFAULT_MODEL,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.5,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("DeepSeek request failed", res.status, detail);
      return NextResponse.json({ error: "upstream-failed" }, { status: 502 });
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string") {
      console.error("DeepSeek response missing content", data);
      return NextResponse.json({ error: "upstream-invalid" }, { status: 502 });
    }
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("DeepSeek request errored", err);
    return NextResponse.json({ error: "request-failed" }, { status: 502 });
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
