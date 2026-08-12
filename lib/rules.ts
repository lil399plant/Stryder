// Transparent, rules-based "what might be next" logic. Nothing here is
// medical, predictive, or based on hidden heuristics — every nudge below
// states the plain-language rule that produced it so it's easy to trust
// or ignore. See NextNeedsCard for how these render.

import type { AppData, Caregiver, LogEvent, NudgeThresholds, PottyType } from "./types";
import { minutesBetween } from "./time";

export type PuppyState = "napping" | "settling" | "overnight" | "awake";

/** Single source of truth for the nudge thresholds' default values — used
 * to seed new data (lib/seed.ts) and as a defensive fallback here if older
 * stored data somehow reaches computeNudges without them. */
export const DEFAULT_NUDGE_THRESHOLDS: NudgeThresholds = {
  pottyGapHours: 2,
  awakeStretchHours: 2.5,
  mealGapHours: 6,
};

export function getActiveNap(data: AppData) {
  return data.napEvents.find((n) => !n.endTime) ?? null;
}

export function getActiveDownstairs(data: AppData) {
  return data.downstairsTrips.find((d) => !d.endTime) ?? null;
}

export function getActiveEvent(data: AppData) {
  return data.events.find((e) => !e.endTime) ?? null;
}

export function computeCurrentState(data: AppData, now: Date = new Date()): PuppyState {
  const activeNap = getActiveNap(data);
  if (activeNap) return "napping";

  const lastNapEnd = data.napEvents
    .filter((n) => n.endTime)
    .map((n) => new Date(n.endTime as string).getTime())
    .sort((a, b) => b - a)[0];

  if (lastNapEnd && minutesBetween(new Date(lastNapEnd), now) <= 15) {
    return "settling";
  }

  const hour = now.getHours();
  if (hour >= 22 || hour < 6) return "overnight";

  return "awake";
}

export function lastOfType(events: LogEvent[], predicate: (e: LogEvent) => boolean): LogEvent | null {
  const filtered = events.filter(predicate).sort((a, b) => timeOf(b) - timeOf(a));
  return filtered[0] ?? null;
}

function timeOf(e: LogEvent): number {
  if (e.kind === "nap" || e.kind === "downstairs" || e.kind === "event") return new Date(e.startTime).getTime();
  return new Date(e.timestamp).getTime();
}

export function allEvents(data: AppData): LogEvent[] {
  return [
    ...data.pottyEvents,
    ...data.mealEvents,
    ...data.napEvents,
    ...data.downstairsTrips,
    ...data.events,
    ...data.incidentEvents,
  ];
}

export function lastPottyOfType(data: AppData, types: PottyType[]) {
  const matches = data.pottyEvents
    .filter((p) => types.includes(p.type) || (types.includes("pee") && p.type === "both") || (types.includes("poop") && p.type === "both"))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return matches[0] ?? null;
}

export function lastMeal(data: AppData) {
  const matches = [...data.mealEvents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return matches[0] ?? null;
}

/** Elapsed minutes between `since` and `now`, minus any time spent
 * napping in that window — "time awake," not raw wall-clock time, so a
 * long nap doesn't itself make the last potty trip look overdue. A nap
 * still in progress counts up to `now`. */
export function awakeMinutesSince(data: AppData, since: Date, now: Date): number {
  let minutes = minutesBetween(since, now);
  for (const nap of data.napEvents) {
    const napStart = new Date(nap.startTime);
    const napEnd = nap.endTime ? new Date(nap.endTime) : now;
    const overlapStart = napStart > since ? napStart : since;
    const overlapEnd = napEnd < now ? napEnd : now;
    if (overlapEnd > overlapStart) {
      minutes -= minutesBetween(overlapStart, overlapEnd);
    }
  }
  return Math.max(0, minutes);
}

export function lastCompletedNap(data: AppData) {
  const matches = data.napEvents
    .filter((n) => n.endTime)
    .sort((a, b) => new Date(b.endTime as string).getTime() - new Date(a.endTime as string).getTime());
  return matches[0] ?? null;
}

export function onDutyCaregiverName(data: AppData): string {
  const cg = data.caregivers.find((c) => c.id === data.handoff.onDuty);
  return cg?.displayName ?? data.handoff.onDuty;
}

export function caregiverName(data: AppData, id: Caregiver): string {
  return data.caregivers.find((c) => c.id === id)?.displayName ?? id;
}

export interface Nudge {
  id: string; // stable id, used for per-day dismissal
  text: string;
  basis: string; // plain-language explanation of the rule
}

/**
 * Produces at most 2 gentle, dismissible "what might be next" nudges.
 * Purely rules-based on elapsed time — never medical, never alarmist.
 */
function formatHours(hours: number): string {
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1).replace(/\.0$/, "");
}

export function computeNudges(data: AppData, now: Date = new Date()): Nudge[] {
  const nudges: Nudge[] = [];
  const state = computeCurrentState(data, now);
  const thresholds = data.settings.nudgeThresholds ?? DEFAULT_NUDGE_THRESHOLDS;

  const activeNap = getActiveNap(data);
  const lastPottyAny = lastPottyOfType(data, ["pee", "poop"]);
  const lastMealEvent = lastMeal(data);
  const lastNap = lastCompletedNap(data);

  // Rule: recently woke, no potty logged since waking yet
  if (lastNap?.endTime) {
    const minsSinceWake = minutesBetween(new Date(lastNap.endTime), now);
    const pottySinceWake = lastPottyAny && new Date(lastPottyAny.timestamp).getTime() > new Date(lastNap.endTime).getTime();
    if (!activeNap && minsSinceWake >= 5 && minsSinceWake <= 40 && !pottySinceWake) {
      nudges.push({
        id: "post-nap-potty",
        text: `He woke ${minsSinceWake} min ago — this may be a good potty window.`,
        basis: "Rule: puppies often need to go shortly after waking from a nap.",
      });
    }
  }

  // Rule: long stretch AWAKE since any potty — nap time doesn't count, and
  // while he's currently napping this is treated as 0 (no flag at all).
  if (lastPottyAny && state !== "napping") {
    const minsAwakeSincePotty = awakeMinutesSince(data, new Date(lastPottyAny.timestamp), now);
    if (minsAwakeSincePotty >= thresholds.pottyGapHours * 60) {
      nudges.push({
        id: "long-since-potty",
        text: `It's been ${Math.floor(minsAwakeSincePotty / 60)}h ${minsAwakeSincePotty % 60}m awake since the last potty trip.`,
        basis: `Rule: flags when ${formatHours(thresholds.pottyGapHours)}+ hours awake (nap time doesn't count) have passed since any logged pee or poop.`,
      });
    }
  }

  // Rule: long active stretch since last nap ended
  if (lastNap?.endTime && !activeNap && state === "awake") {
    const minsAwake = minutesBetween(new Date(lastNap.endTime), now);
    if (minsAwake >= thresholds.awakeStretchHours * 60) {
      nudges.push({
        id: "long-awake-stretch",
        text: "Long active stretch since last nap.",
        basis: `Rule: flags when ${formatHours(thresholds.awakeStretchHours)}+ hours have passed since the last nap ended.`,
      });
    }
  }

  // Rule: meal gap during daytime hours
  const hour = now.getHours();
  if (lastMealEvent && hour >= 7 && hour <= 20) {
    const minsSinceMeal = minutesBetween(new Date(lastMealEvent.timestamp), now);
    if (minsSinceMeal >= thresholds.mealGapHours * 60) {
      nudges.push({
        id: "meal-gap",
        text: "It's been a while since the last meal — might be worth checking the feeding schedule.",
        basis: `Rule: flags when ${formatHours(thresholds.mealGapHours)}+ hours have passed since the last logged meal during daytime.`,
      });
    }
  }

  return nudges.filter((n) => !data.dismissedNudges.includes(dayScopedId(n.id, now))).slice(0, 2);
}

export function dayScopedId(id: string, now: Date = new Date()): string {
  const key = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  return `${key}:${id}`;
}
