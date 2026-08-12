import { NextResponse } from "next/server";

// Standalone "Ask AI" module — intentionally disconnected from the rest of
// the app. This route never touches lib/store, lib/supabase, or AppData; it
// only relays a chat history to DeepSeek and returns the reply. Uses a
// server-only API key (never exposed to the browser), same pattern as
// lib/supabase.ts.

const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions";
const DEFAULT_MODEL = "deepseek-chat";

const SYSTEM_PROMPT =
  "You are the AI Triage assistant inside Stryder, a personal puppy-care app. " +
  "You are a standalone, general-purpose assistant: you have no access to the user's " +
  "logged data (feeding, potty, health records, training, etc.) and no memory beyond " +
  "this conversation. Answer whatever the user asks, clearly and concisely. If asked " +
  "about an urgent animal (or human) health or safety concern, say so plainly and " +
  "recommend contacting a vet, doctor, or emergency service promptly rather than " +
  "relying solely on your answer. Reply in plain prose only — no markdown syntax " +
  "(no **bold**, #headers, or | tables). Use line breaks and a leading \"- \" for " +
  "lists if structure helps; the chat UI renders plain text, not markdown.";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "not-configured" }, { status: 501 });
  }

  let body: { messages?: ChatMessage[] };
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

  try {
    const res = await fetch(DEEPSEEK_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || DEFAULT_MODEL,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
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
