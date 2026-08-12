// Lightweight, local heuristic for the AI Triage "this looks like a log
// entry" suggestion (app/triage/page.tsx). Deliberately cheap and
// client-side — no API call — so it can run on every message without cost.
// It only decides whether to *show* the "Import Manual Log" button; the
// actual extraction (and the enum-level validation) happens only if the
// caregiver clicks it, via /api/import-text + lib/import-text.ts. False
// positives just show an offer the caregiver can ignore; false negatives
// just mean they use the More > Data import for that message instead.

const TIME_PATTERN = /\b\d{1,2}(:\d{2})?\s?(am|pm)\b/i;
const TIME_RANGE_PATTERN = /\b\d{1,2}(:\d{2})?\s?(am|pm)?\s?[-–to]{1,3}\s?\d{1,2}(:\d{2})?\s?(am|pm)\b/i;
const RELATIVE_TIME_PATTERN = /\b(this morning|this afternoon|tonight|just now|a few minutes ago|earlier today)\b/i;

const LOG_KEYWORDS = [
  "pee",
  "peed",
  "poop",
  "pooped",
  "potty",
  "accident",
  "walk",
  "walked",
  "downstairs",
  "outside",
  "ate",
  "eat",
  "breakfast",
  "lunch",
  "dinner",
  "meal",
  "treat",
  "kibble",
  "food",
  "nap",
  "napped",
  "slept",
  "sleep",
  "crate",
  "vet",
  "groomer",
  "training",
  "playdate",
];

export function looksLikeLogEntry(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > 400) return false;

  const lower = trimmed.toLowerCase();
  const hasTime = TIME_PATTERN.test(lower) || TIME_RANGE_PATTERN.test(lower) || RELATIVE_TIME_PATTERN.test(lower);
  const hasKeyword = LOG_KEYWORDS.some((k) => lower.includes(k));

  return hasTime && hasKeyword;
}
