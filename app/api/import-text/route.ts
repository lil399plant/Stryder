import { NextResponse } from "next/server";
import { sanitizeExtraction, countExtraction } from "@/lib/import-text";
import {
  POTTY_TYPE_OPTIONS,
  POTTY_LOCATION_OPTIONS,
  OUTDOOR_TRIP_OPTIONS,
  SUCCESS_OPTIONS,
  POOP_QUALITY_OPTIONS,
  POTTY_TAG_OPTIONS,
  POTTY_MOMENT_TYPE_OPTIONS,
  POTTY_MOMENT_SUCCESS_OPTIONS,
  MEAL_TYPE_OPTIONS,
  APPETITE_OPTIONS,
  ADD_ON_OPTIONS,
  NAP_LOCATION_OPTIONS,
  SETTLING_OPTIONS,
  NAP_QUALITY_OPTIONS,
  SPECIAL_EVENT_CATEGORY_OPTIONS,
  INCIDENT_CATEGORY_OPTIONS,
  SEVERITY_OPTIONS,
} from "@/lib/options";

// "Import from text" — a caregiver pastes freeform notes (a text message
// log, a day's memory jotted down, a caretaker's handoff note) and this
// route asks DeepSeek to turn it into structured log entries. Unlike
// app/api/triage/route.ts, this one *is* connected to the app's real data —
// but only ever additively: this route only extracts and validates
// candidate entries, it never touches Supabase or replaces anything. The
// caller (components/more/ImportTextSection.tsx) shows the caregiver a
// preview and only appends entries via the store's add* actions once they
// confirm — existing data is never wiped.

const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions";
const DEFAULT_MODEL = "deepseek-chat";
const MAX_TEXT_LENGTH = 20_000;

const valuesList = (opts: { value: string }[]) => opts.map((o) => o.value).join(" | ");

function buildSystemPrompt(
  referenceIso: string,
  tzOffsetMinutes: number,
  caregivers: { id: string; displayName: string }[]
) {
  const caregiverLines = caregivers.map((c) => `"${c.id}" = ${c.displayName}`).join(", ");
  // Date#getTimezoneOffset() is minutes *behind* UTC (positive west of UTC),
  // i.e. the opposite sign convention from a UTC offset label.
  const tzHours = -tzOffsetMinutes / 60;
  const tzLabel = `UTC${tzHours >= 0 ? "+" : ""}${tzHours}`;

  return `You extract structured puppy-care log entries from a caregiver's freeform notes for Stryder, a shared puppy-log app.

Reference moment: ${referenceIso} (this is "now", in UTC). The caregiver's local timezone is ${tzLabel}. When the text implies a local time ("this morning", "7am", "before bed"), interpret it in that local timezone and convert to a correct UTC ISO 8601 timestamp for output.

Caregiver ids: ${caregiverLines}. Map any names/pronouns in the text to these ids. If it's unclear who did something, default to "me".

Respond with ONLY a JSON object (no prose, no markdown fences) with these optional array keys. Omit a key entirely if the text describes none of that type. Do not invent entries the text doesn't support.

pottyEvents: { timestamp, type: ${valuesList(POTTY_TYPE_OPTIONS)}, location: ${valuesList(POTTY_LOCATION_OPTIONS)}, outdoorTripType?: ${valuesList(OUTDOOR_TRIP_OPTIONS)}, success: ${valuesList(SUCCESS_OPTIONS)}, poopQuality?: ${valuesList(POOP_QUALITY_OPTIONS)}, tags?: array from [${valuesList(POTTY_TAG_OPTIONS)}], notes?: string, caregiver, accidentWhere?: string, accidentReason?: string }

mealEvents: { timestamp, mealType: ${valuesList(MEAL_TYPE_OPTIONS)}, foodName: string, amount: string, appetite: ${valuesList(APPETITE_OPTIONS)}, addOns?: array from [${valuesList(ADD_ON_OPTIONS)}], newFood: boolean, usedForCrateTraining: boolean, usedAsPottyReward: boolean, notes?: string, caregiver }

napEvents: { startTime, endTime?, location?: ${valuesList(NAP_LOCATION_OPTIONS)} (omit if not stated — don't guess), settling?: ${valuesList(SETTLING_OPTIONS)}, quality?: ${valuesList(NAP_QUALITY_OPTIONS)}, notes?: string, caregiver }

downstairsTrips: { startTime, endTime?, outdoorTripType?: ${valuesList(OUTDOOR_TRIP_OPTIONS)}, pottyMoments?: array of { timestamp? (when during the trip it happened — omit if unclear, it'll default to the trip's startTime), type: ${valuesList(POTTY_MOMENT_TYPE_OPTIONS)}, success: ${valuesList(POTTY_MOMENT_SUCCESS_OPTIONS)}, poopQuality?: ${valuesList(POOP_QUALITY_OPTIONS)} } (only include if the text says pee/poop happened during this specific trip — otherwise omit), notes?: string, caregiver }

events: { startTime, endTime?, category: ${valuesList(SPECIAL_EVENT_CATEGORY_OPTIONS)}, title?: string, notes?: string, caregiver }

incidentEvents: { timestamp, category: ${valuesList(INCIDENT_CATEGORY_OPTIONS)}, severity: ${valuesList(SEVERITY_OPTIONS)}, note: string (required — describe the observation), discussWithVet: boolean, caregiver }

Rules:
- caregiver must be exactly one of the ids listed above.
- All timestamps/startTime/endTime must be valid ISO 8601 UTC strings.
- If a required field isn't stated in the text, use a reasonable default rather than omitting the record (e.g. location "usual-spot", success "went-promptly", appetite "most", event category "other", incident severity "note"). Nap location is optional — leave it out rather than guessing.
- Output raw JSON only.`;
}

export async function POST(request: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "not-configured" }, { status: 501 });
  }

  let body: {
    text?: string;
    referenceIso?: string;
    tzOffsetMinutes?: number;
    caregivers?: { id: string; displayName: string }[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const text = body.text?.trim();
  if (!text) return NextResponse.json({ error: "empty-text" }, { status: 400 });
  if (text.length > MAX_TEXT_LENGTH) return NextResponse.json({ error: "text-too-long" }, { status: 400 });

  const referenceIso =
    body.referenceIso && !Number.isNaN(new Date(body.referenceIso).getTime())
      ? body.referenceIso
      : new Date().toISOString();
  const tzOffsetMinutes = typeof body.tzOffsetMinutes === "number" ? body.tzOffsetMinutes : 0;
  const caregivers =
    Array.isArray(body.caregivers) && body.caregivers.length > 0
      ? body.caregivers
      : [
          { id: "me", displayName: "Me" },
          { id: "ribo", displayName: "Ribo" },
        ];

  try {
    const res = await fetch(DEEPSEEK_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || DEFAULT_MODEL,
        messages: [
          { role: "system", content: buildSystemPrompt(referenceIso, tzOffsetMinutes, caregivers) },
          { role: "user", content: text },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("DeepSeek import request failed", res.status, detail);
      return NextResponse.json({ error: "upstream-failed" }, { status: 502 });
    }

    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (typeof raw !== "string") {
      console.error("DeepSeek import response missing content", data);
      return NextResponse.json({ error: "upstream-invalid" }, { status: 502 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error("DeepSeek import returned non-JSON content", raw);
      return NextResponse.json({ error: "parse-failed" }, { status: 502 });
    }

    const { extraction, skipped } = sanitizeExtraction(parsed);
    const total = countExtraction(extraction);
    if (total === 0) {
      return NextResponse.json({ error: "nothing-found" }, { status: 422 });
    }

    return NextResponse.json({ extraction, skipped, total });
  } catch (err) {
    console.error("DeepSeek import request errored", err);
    return NextResponse.json({ error: "request-failed" }, { status: 502 });
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
