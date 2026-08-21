import type {
  AppData,
  DownstairsEvent,
  IncidentEvent,
  MealEvent,
  NapEvent,
  PottyEvent,
  PottyMoment,
  SpecialEvent,
  TrainingSession,
} from "./types";
import { isSameDay } from "./time";

export type TimelineItem =
  | { kind: "potty"; time: string; data: PottyEvent }
  | { kind: "meal"; time: string; data: MealEvent }
  | { kind: "nap"; time: string; data: NapEvent }
  | { kind: "downstairs"; time: string; data: DownstairsEvent }
  | { kind: "event"; time: string; data: SpecialEvent }
  | { kind: "incident"; time: string; data: IncidentEvent }
  | { kind: "training"; time: string; data: TrainingSession };

/** Duration-based items (have a start + optional end) vs. point-in-time items. */
export const DURATION_KINDS: TimelineItem["kind"][] = ["nap", "downstairs", "event"];

export function getAllTimelineItems(data: AppData): TimelineItem[] {
  const items: TimelineItem[] = [];
  for (const p of data.pottyEvents) items.push({ kind: "potty", time: p.timestamp, data: p });
  for (const m of data.mealEvents) items.push({ kind: "meal", time: m.timestamp, data: m });
  for (const n of data.napEvents) items.push({ kind: "nap", time: n.startTime, data: n });
  for (const d of data.downstairsTrips) items.push({ kind: "downstairs", time: d.startTime, data: d });
  for (const e of data.events) items.push({ kind: "event", time: e.startTime, data: e });
  for (const i of data.incidentEvents) items.push({ kind: "incident", time: i.timestamp, data: i });
  for (const t of data.trainingSessions) items.push({ kind: "training", time: t.timestamp, data: t });
  return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}

export function getTimelineForDay(data: AppData, date: Date): TimelineItem[] {
  const items: TimelineItem[] = [];

  for (const p of data.pottyEvents) {
    if (isSameDay(new Date(p.timestamp), date)) items.push({ kind: "potty", time: p.timestamp, data: p });
  }
  for (const m of data.mealEvents) {
    if (isSameDay(new Date(m.timestamp), date)) items.push({ kind: "meal", time: m.timestamp, data: m });
  }
  for (const n of data.napEvents) {
    if (isSameDay(new Date(n.startTime), date)) items.push({ kind: "nap", time: n.startTime, data: n });
  }
  for (const d of data.downstairsTrips) {
    if (isSameDay(new Date(d.startTime), date)) items.push({ kind: "downstairs", time: d.startTime, data: d });
  }
  for (const e of data.events) {
    if (isSameDay(new Date(e.startTime), date)) items.push({ kind: "event", time: e.startTime, data: e });
  }
  for (const i of data.incidentEvents) {
    if (isSameDay(new Date(i.timestamp), date)) items.push({ kind: "incident", time: i.timestamp, data: i });
  }
  for (const t of data.trainingSessions) {
    if (isSameDay(new Date(t.timestamp), date)) items.push({ kind: "training", time: t.timestamp, data: t });
  }

  return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}

export const POTTY_TYPE_LABEL: Record<PottyEvent["type"], string> = {
  pee: "Pee",
  poop: "Poop",
  both: "Pee & poop",
  accident: "Accident",
};

export const POTTY_LOCATION_LABEL: Record<PottyEvent["location"], string> = {
  "usual-spot": "Usual potty spot",
  "alternate-outdoor": "Alternate outdoor spot",
  "building-lobby-elevator": "Building / lobby / elevator",
  "inside-pad": "Inside, near pad",
  other: "Other",
};

export const OUTDOOR_TRIP_LABEL: Record<string, string> = {
  "direct-potty-trip": "Direct potty trip",
  "potty-circuit": "Potty circuit",
  "walk-first": "Walk first",
  "after-nap": "After nap",
  "after-meal": "After meal",
  "before-bed": "Before bed",
};

export const SUCCESS_LABEL: Record<PottyEvent["success"], string> = {
  "went-promptly": "Went promptly",
  "took-a-while": "Took a while",
  distracted: "Distracted",
  "did-not-go": "Did not go",
  accident: "Accident",
};

export const POOP_QUALITY_LABEL: Record<string, string> = {
  normal: "Normal",
  soft: "Soft",
  loose: "Loose",
  "hard-dry": "Hard / dry",
  unknown: "Unknown",
};

export const POTTY_TAG_LABEL: Record<string, string> = {
  pigeons: "Pigeons",
  "other-dogs": "Other dogs",
  heat: "Heat",
  "long-play": "Long play",
  excitement: "Excitement",
  "new-food": "New food",
  "elevator-lobby": "Elevator / lobby",
  unknown: "Unknown",
};

export const MEAL_TYPE_LABEL: Record<MealEvent["mealType"], string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  treat: "Treat",
  enrichment: "Enrichment",
};

export const APPETITE_LABEL: Record<MealEvent["appetite"], string> = {
  finished: "Finished",
  most: "Most",
  some: "Some",
  refused: "Refused",
};

export const ADD_ON_LABEL: Record<string, string> = {
  "plain-greek-yogurt": "Plain Greek yogurt",
  chicken: "Chicken",
  blueberries: "Blueberries",
  cucumber: "Cucumber",
  pumpkin: "Pumpkin",
  other: "Other",
};

export const NAP_LOCATION_LABEL: Record<NonNullable<NapEvent["location"]>, string> = {
  kitchen: "Kitchen",
  "foot-of-bed": "Foot of bed",
  couch: "Couch",
  crate: "Crate",
  pen: "Pen",
  other: "Other",
};

export const SETTLING_LABEL: Record<NonNullable<NapEvent["settling"]>, string> = {
  "fell-asleep-independently": "Fell asleep independently",
  "needed-chew-lick-mat": "Needed chew / lick mat",
  "needed-caregiver-nearby": "Needed caregiver nearby",
  "overtired-struggled": "Overtired / struggled",
};

export const NAP_QUALITY_LABEL: Record<string, string> = {
  normal: "Normal",
  short: "Short",
  long: "Long",
  interrupted: "Interrupted",
};

export const INCIDENT_CATEGORY_LABEL: Record<IncidentEvent["category"], string> = {
  "new-behavior": "New behavior observed",
  chewing: "Chewing",
  digging: "Digging",
  "pigeons-prey-interest": "Pigeons / prey interest",
  overstimulation: "Overstimulation",
  "possible-stomach-issue": "Possible stomach issue",
  "new-environmental-change": "New environmental change",
  other: "Other",
};

export const SEVERITY_LABEL: Record<IncidentEvent["severity"], string> = {
  note: "Note",
  watch: "Watch",
  "needs-follow-up": "Needs follow-up",
};

export const TRAINING_OUTCOME_LABEL: Record<TrainingSession["outcome"], string> = {
  "easy-win": "Easy win",
  neutral: "Neutral",
  "too-hard": "Too hard",
  "needs-easier-step": "Needs easier step",
};

/** Short summary of a trip's potty moments for the timeline subtitle —
 * null when there aren't any, "Pee"/"Poop"/"Pee & poop" (union of moment
 * types) otherwise, suffixed with a count when there's more than one. */
export function pottyMomentsSummaryLabel(moments: PottyMoment[]): string | null {
  if (!moments.length) return null;
  const hasPee = moments.some((m) => m.type !== "poop");
  const hasPoop = moments.some((m) => m.type !== "pee");
  const label = hasPee && hasPoop ? "Pee & poop" : hasPee ? "Pee" : "Poop";
  return moments.length > 1 ? `${label} ×${moments.length}` : label;
}

export const SPECIAL_EVENT_CATEGORY_LABEL: Record<SpecialEvent["category"], string> = {
  vet: "Vet visit",
  "training-class": "Training class",
  restaurant: "Restaurant",
  groomer: "Groomer",
  playdate: "Playdate",
  travel: "Travel",
  "pet-store": "Pet store",
  other: "Other",
};