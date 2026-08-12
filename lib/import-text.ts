// Sanitizer for AI-extracted log entries (see app/api/import-text/route.ts).
// The model's JSON output is untrusted input: every record is checked
// against the app's real enum sets (from lib/options.ts, the same lists the
// manual-entry UI uses) before it's allowed anywhere near the store. A
// record missing a hard-required field is dropped rather than guessed at;
// optional/enum fields fall back to a safe default instead of failing the
// whole record. Nothing here ever replaces existing data — see
// components/more/ImportTextSection.tsx, which only ever appends the
// sanitized entries via the store's add* actions.

import type { Caregiver, DownstairsEvent, IncidentEvent, MealEvent, NapEvent, PottyEvent, SpecialEvent } from "./types";
import {
  POTTY_TYPE_OPTIONS,
  POTTY_LOCATION_OPTIONS,
  OUTDOOR_TRIP_OPTIONS,
  SUCCESS_OPTIONS,
  POOP_QUALITY_OPTIONS,
  POTTY_TAG_OPTIONS,
  MEAL_TYPE_OPTIONS,
  APPETITE_OPTIONS,
  ADD_ON_OPTIONS,
  NAP_LOCATION_OPTIONS,
  SETTLING_OPTIONS,
  NAP_QUALITY_OPTIONS,
  SPECIAL_EVENT_CATEGORY_OPTIONS,
  INCIDENT_CATEGORY_OPTIONS,
  SEVERITY_OPTIONS,
} from "./options";

type NewEntry<T extends { id: string; kind: string }> = Omit<T, "id" | "kind">;

export interface ImportExtraction {
  pottyEvents: NewEntry<PottyEvent>[];
  mealEvents: NewEntry<MealEvent>[];
  napEvents: NewEntry<NapEvent>[];
  downstairsTrips: NewEntry<DownstairsEvent>[];
  events: NewEntry<SpecialEvent>[];
  incidentEvents: NewEntry<IncidentEvent>[];
}

const setOf = (opts: { value: string }[]) => new Set(opts.map((o) => o.value));

const POTTY_TYPES = setOf(POTTY_TYPE_OPTIONS);
const POTTY_LOCATIONS = setOf(POTTY_LOCATION_OPTIONS);
const OUTDOOR_TRIPS = setOf(OUTDOOR_TRIP_OPTIONS);
const SUCCESSES = setOf(SUCCESS_OPTIONS);
const POOP_QUALITIES = setOf(POOP_QUALITY_OPTIONS);
const POTTY_TAGS = setOf(POTTY_TAG_OPTIONS);
const MEAL_TYPES = setOf(MEAL_TYPE_OPTIONS);
const APPETITES = setOf(APPETITE_OPTIONS);
const ADD_ONS = setOf(ADD_ON_OPTIONS);
const NAP_LOCATIONS = setOf(NAP_LOCATION_OPTIONS);
const SETTLINGS = setOf(SETTLING_OPTIONS);
const NAP_QUALITIES = setOf(NAP_QUALITY_OPTIONS);
const EVENT_CATEGORIES = setOf(SPECIAL_EVENT_CATEGORY_OPTIONS);
const INCIDENT_CATEGORIES = setOf(INCIDENT_CATEGORY_OPTIONS);
const SEVERITIES = setOf(SEVERITY_OPTIONS);

function isValidIso(v: unknown): v is string {
  return typeof v === "string" && v.trim() !== "" && !Number.isNaN(new Date(v).getTime());
}
function isCaregiver(v: unknown): v is Caregiver {
  return v === "me" || v === "ribo";
}
function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}
function bool(v: unknown): boolean {
  return v === true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizePotty(raw: any): NewEntry<PottyEvent> | null {
  if (!raw || typeof raw !== "object") return null;
  if (!isValidIso(raw.timestamp) || !isCaregiver(raw.caregiver) || !POTTY_TYPES.has(raw.type)) return null;

  const entry: NewEntry<PottyEvent> = {
    timestamp: raw.timestamp,
    type: raw.type,
    location: POTTY_LOCATIONS.has(raw.location) ? raw.location : "usual-spot",
    success: SUCCESSES.has(raw.success) ? raw.success : "went-promptly",
    tags: Array.isArray(raw.tags)
      ? raw.tags.filter((t: unknown): t is string => typeof t === "string" && POTTY_TAGS.has(t))
      : [],
    caregiver: raw.caregiver,
  };
  if (OUTDOOR_TRIPS.has(raw.outdoorTripType)) entry.outdoorTripType = raw.outdoorTripType;
  if (POOP_QUALITIES.has(raw.poopQuality)) entry.poopQuality = raw.poopQuality;
  const notes = str(raw.notes);
  if (notes) entry.notes = notes;
  if (raw.type === "accident") {
    const where = str(raw.accidentWhere);
    const reason = str(raw.accidentReason);
    if (where) entry.accidentWhere = where;
    if (reason) entry.accidentReason = reason;
  }
  return entry;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeMeal(raw: any): NewEntry<MealEvent> | null {
  if (!raw || typeof raw !== "object") return null;
  if (!isValidIso(raw.timestamp) || !isCaregiver(raw.caregiver) || !MEAL_TYPES.has(raw.mealType)) return null;

  const entry: NewEntry<MealEvent> = {
    timestamp: raw.timestamp,
    mealType: raw.mealType,
    foodName: str(raw.foodName) ?? "",
    amount: str(raw.amount) ?? "",
    appetite: APPETITES.has(raw.appetite) ? raw.appetite : "most",
    addOns: Array.isArray(raw.addOns)
      ? raw.addOns.filter((a: unknown): a is string => typeof a === "string" && ADD_ONS.has(a))
      : [],
    newFood: bool(raw.newFood),
    usedForCrateTraining: bool(raw.usedForCrateTraining),
    usedAsPottyReward: bool(raw.usedAsPottyReward),
    caregiver: raw.caregiver,
  };
  const notes = str(raw.notes);
  if (notes) entry.notes = notes;
  return entry;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeNap(raw: any): NewEntry<NapEvent> | null {
  if (!raw || typeof raw !== "object") return null;
  if (!isValidIso(raw.startTime) || !isCaregiver(raw.caregiver)) return null;

  const entry: NewEntry<NapEvent> = {
    startTime: raw.startTime,
    location: NAP_LOCATIONS.has(raw.location) ? raw.location : "crate",
    caregiver: raw.caregiver,
  };
  if (isValidIso(raw.endTime)) entry.endTime = raw.endTime;
  if (SETTLINGS.has(raw.settling)) entry.settling = raw.settling;
  if (NAP_QUALITIES.has(raw.quality)) entry.quality = raw.quality;
  const notes = str(raw.notes);
  if (notes) entry.notes = notes;
  return entry;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeDownstairs(raw: any): NewEntry<DownstairsEvent> | null {
  if (!raw || typeof raw !== "object") return null;
  if (!isValidIso(raw.startTime) || !isCaregiver(raw.caregiver)) return null;

  const entry: NewEntry<DownstairsEvent> = { startTime: raw.startTime, caregiver: raw.caregiver };
  if (isValidIso(raw.endTime)) entry.endTime = raw.endTime;
  if (OUTDOOR_TRIPS.has(raw.outdoorTripType)) entry.outdoorTripType = raw.outdoorTripType;
  const notes = str(raw.notes);
  if (notes) entry.notes = notes;
  return entry;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeEvent(raw: any): NewEntry<SpecialEvent> | null {
  if (!raw || typeof raw !== "object") return null;
  if (!isValidIso(raw.startTime) || !isCaregiver(raw.caregiver)) return null;

  const entry: NewEntry<SpecialEvent> = {
    startTime: raw.startTime,
    category: EVENT_CATEGORIES.has(raw.category) ? raw.category : "other",
    caregiver: raw.caregiver,
  };
  if (isValidIso(raw.endTime)) entry.endTime = raw.endTime;
  const title = str(raw.title);
  if (title) entry.title = title;
  const notes = str(raw.notes);
  if (notes) entry.notes = notes;
  return entry;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeIncident(raw: any): NewEntry<IncidentEvent> | null {
  if (!raw || typeof raw !== "object") return null;
  const note = str(raw.note);
  if (!isValidIso(raw.timestamp) || !isCaregiver(raw.caregiver) || !note) return null;

  return {
    timestamp: raw.timestamp,
    category: INCIDENT_CATEGORIES.has(raw.category) ? raw.category : "other",
    severity: SEVERITIES.has(raw.severity) ? raw.severity : "note",
    note,
    discussWithVet: bool(raw.discussWithVet),
    caregiver: raw.caregiver,
  };
}

export function sanitizeExtraction(raw: unknown): { extraction: ImportExtraction; skipped: number } {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  let skipped = 0;

  function build<T>(key: string, fn: (raw: unknown) => T | null): T[] {
    const arr = Array.isArray(obj[key]) ? obj[key] : [];
    const out: T[] = [];
    for (const item of arr as unknown[]) {
      const sanitized = fn(item);
      if (sanitized) out.push(sanitized);
      else skipped++;
    }
    return out;
  }

  const extraction: ImportExtraction = {
    pottyEvents: build("pottyEvents", sanitizePotty),
    mealEvents: build("mealEvents", sanitizeMeal),
    napEvents: build("napEvents", sanitizeNap),
    downstairsTrips: build("downstairsTrips", sanitizeDownstairs),
    events: build("events", sanitizeEvent),
    incidentEvents: build("incidentEvents", sanitizeIncident),
  };

  return { extraction, skipped };
}

export function countExtraction(e: ImportExtraction): number {
  return (
    e.pottyEvents.length +
    e.mealEvents.length +
    e.napEvents.length +
    e.downstairsTrips.length +
    e.events.length +
    e.incidentEvents.length
  );
}
