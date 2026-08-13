import type { AppData, Caregiver, PottyEvent, MealEvent, NapEvent, DownstairsEvent, SpecialEvent, IncidentEvent } from "./types";
import { ageInWeeks, minutesBetween } from "./time";
import {
  POTTY_TYPE_LABEL,
  POTTY_LOCATION_LABEL,
  OUTDOOR_TRIP_LABEL,
  SUCCESS_LABEL,
  POOP_QUALITY_LABEL,
  POTTY_TAG_LABEL,
  MEAL_TYPE_LABEL,
  APPETITE_LABEL,
  ADD_ON_LABEL,
  NAP_LOCATION_LABEL,
  SETTLING_LABEL,
  INCIDENT_CATEGORY_LABEL,
  SEVERITY_LABEL,
  SPECIAL_EVENT_CATEGORY_LABEL,
} from "./timeline";
import { caregiverName as caregiverNameFor } from "./rules";

// Builds the plain-text context the AI Triage assistant is given about
// Stryder — read-only, rebuilt fresh and sent with every message (the API
// route is stateless, same as how the chat history itself is resent in
// full each time). Scope is deliberate, per the user's request: the
// puppy's basic profile (More > Profile) and everything under the Log tab
// (potty, meals, naps, downstairs trips, special events, incident notes —
// exactly lib/types.ts's `LogEvent` union). Training plans/sessions and
// Health records (vaccines, insurance, health profile) are excluded on
// purpose and never touched here.

function fmt(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}, ${d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

function pottyLine(p: PottyEvent, who: string): string {
  const parts = [POTTY_TYPE_LABEL[p.type]];
  if (p.type === "accident") {
    if (p.accidentWhere) parts.push(p.accidentWhere);
    if (p.accidentReason) parts.push(`likely cause: ${p.accidentReason}`);
  } else {
    parts.push(POTTY_LOCATION_LABEL[p.location]);
    if (p.outdoorTripType) parts.push(OUTDOOR_TRIP_LABEL[p.outdoorTripType] ?? p.outdoorTripType);
    parts.push(SUCCESS_LABEL[p.success]);
  }
  if (p.poopQuality) parts.push(POOP_QUALITY_LABEL[p.poopQuality] ?? p.poopQuality);
  if (p.tags.length) parts.push(p.tags.map((t) => POTTY_TAG_LABEL[t] ?? t).join("/"));
  if (p.notes) parts.push(`note: ${p.notes}`);
  return `${fmt(p.timestamp)} — ${parts.join(", ")} (${who})`;
}

function mealLine(m: MealEvent, who: string): string {
  const parts = [MEAL_TYPE_LABEL[m.mealType], m.foodName, m.amount, APPETITE_LABEL[m.appetite]].filter(Boolean);
  if (m.addOns.length) parts.push(`add-ons: ${m.addOns.map((a) => ADD_ON_LABEL[a] ?? a).join(", ")}`);
  if (m.newFood) parts.push("new food");
  if (m.notes) parts.push(`note: ${m.notes}`);
  return `${fmt(m.timestamp)} — Meal: ${parts.join(", ")} (${who})`;
}

function napLine(n: NapEvent, who: string): string {
  const loc = n.location ? NAP_LOCATION_LABEL[n.location] : null;
  const settling = n.settling ? SETTLING_LABEL[n.settling] : null;
  const detail = [loc ? `in ${loc}` : null, settling].filter(Boolean).join(", ");
  if (n.endTime) {
    const mins = minutesBetween(n.startTime, n.endTime);
    return `${fmt(n.startTime)}–${fmt(n.endTime)} (${mins}m) — Nap${detail ? ` (${detail})` : ""} (${who})`;
  }
  return `${fmt(n.startTime)} – in progress — Nap${detail ? ` (${detail})` : ""} (${who})`;
}

function downstairsLine(d: DownstairsEvent, who: string): string {
  const trip = d.outdoorTripType ? OUTDOOR_TRIP_LABEL[d.outdoorTripType] ?? d.outdoorTripType : null;
  const detail = [trip, d.notes ? `note: ${d.notes}` : null].filter(Boolean).join(", ");
  if (d.endTime) {
    const mins = minutesBetween(d.startTime, d.endTime);
    return `${fmt(d.startTime)}–${fmt(d.endTime)} (${mins}m) — Downstairs trip${detail ? `: ${detail}` : ""} (${who})`;
  }
  return `${fmt(d.startTime)} – in progress — Downstairs trip${detail ? `: ${detail}` : ""} (${who})`;
}

function eventLine(e: SpecialEvent, who: string): string {
  const cat = SPECIAL_EVENT_CATEGORY_LABEL[e.category];
  const detail = [e.title ? `“${e.title}”` : null, e.notes ? `note: ${e.notes}` : null].filter(Boolean).join(", ");
  if (e.endTime) {
    const mins = minutesBetween(e.startTime, e.endTime);
    return `${fmt(e.startTime)}–${fmt(e.endTime)} (${mins}m) — Event: ${cat}${detail ? `, ${detail}` : ""} (${who})`;
  }
  return `${fmt(e.startTime)} – in progress — Event: ${cat}${detail ? `, ${detail}` : ""} (${who})`;
}

function incidentLine(i: IncidentEvent, who: string): string {
  const parts = [INCIDENT_CATEGORY_LABEL[i.category], SEVERITY_LABEL[i.severity]];
  if (i.discussWithVet) parts.push("flagged to discuss with vet");
  return `${fmt(i.timestamp)} — Note: ${parts.join(", ")} — “${i.note}” (${who})`;
}

export function buildTriageContext(data: AppData): string {
  const who = (id: Caregiver) => caregiverNameFor(data, id);

  const lines: { time: string; text: string }[] = [];
  for (const p of data.pottyEvents) lines.push({ time: p.timestamp, text: pottyLine(p, who(p.caregiver)) });
  for (const m of data.mealEvents) lines.push({ time: m.timestamp, text: mealLine(m, who(m.caregiver)) });
  for (const n of data.napEvents) lines.push({ time: n.startTime, text: napLine(n, who(n.caregiver)) });
  for (const d of data.downstairsTrips) lines.push({ time: d.startTime, text: downstairsLine(d, who(d.caregiver)) });
  for (const e of data.events) lines.push({ time: e.startTime, text: eventLine(e, who(e.caregiver)) });
  for (const i of data.incidentEvents) lines.push({ time: i.timestamp, text: incidentLine(i, who(i.caregiver)) });
  lines.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const profile = data.puppy;
  const profileLines = [
    `Name: ${profile.name || "—"}`,
    `Breed: ${profile.breed || "—"}`,
    profile.birthday ? `Birthday: ${profile.birthday} (about ${ageInWeeks(profile.birthday)} weeks old)` : null,
    `Current weight: ${profile.currentWeightLbs ? `${profile.currentWeightLbs} lb` : "—"}`,
  ].filter((l): l is string => Boolean(l));

  const header =
    `PUPPY PROFILE\n${profileLines.join("\n")}\n\n` +
    "LOG (chronological, oldest to newest — potty, meals, naps, downstairs trips, special " +
    "events, and incident notes; training and health records are not included here)\n";

  return lines.length > 0 ? header + lines.map((l) => l.text).join("\n") : header + "(nothing logged yet)";
}
