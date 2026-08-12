// Transparent, rules-based "what might be next" logic. Nothing here is
// medical, predictive, or based on hidden heuristics — every nudge below
// states the plain-language rule that produced it so it's easy to trust
// or ignore. See NextNeedsCard for how these render.

import type { AppData, Caregiver, LogEvent, PottyType } from "./types";
import { minutesBetween } from "./time";

export type PuppyState = "napping" | "settling" | "overnight" | "awake";

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
export function computeNudges(data: AppData, now: Date = new Date()): Nudge[] {
  const nudges: Nudge[] = [];
  const state = computeCurrentState(data, now);

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

  // Rule: long stretch since any potty while awake
  if (lastPottyAny && state !== "napping") {
    const minsSincePotty = minutesBetween(new Date(lastPottyAny.timestamp), now);
    if (minsSincePotty >= 120) {
      nudges.push({
        id: "long-since-potty",
        text: `It's been ${Math.floor(minsSincePotty / 60)}h ${minsSincePotty % 60}m since the last potty trip.`,
        basis: "Rule: flags when 2+ hours have passed since any logged pee or poop.",
      });
    }
  }

  // Rule: long active stretch since last nap ended
  if (lastNap?.endTime && !activeNap && state === "awake") {
    const minsAwake = minutesBetween(new Date(lastNap.endTime), now);
    if (minsAwake >= 150) {
      nudges.push({
        id: "long-awake-stretch",
        text: "Long active stretch since last nap.",
        basis: "Rule: flags when 2.5+ hours have passed since the last nap ended.",
      });
    }
  }

  // Rule: meal gap during daytime hours
  const hour = now.getHours();
  if (lastMealEvent && hour >= 7 && hour <= 20) {
    const minsSinceMeal = minutesBetween(new Date(lastMealEvent.timestamp), now);
    if (minsSinceMeal >= 360) {
      nudges.push({
        id: "meal-gap",
        text: "It's been a while since the last meal — might be worth checking the feeding schedule.",
        basis: "Rule: flags when 6+ hours have passed since the last logged meal during daytime.",
      });
    }
  }

  return nudges.filter((n) => !data.dismissedNudges.includes(dayScopedId(n.id, now))).slice(0, 2);
}

export function dayScopedId(id: string, now: Date = new Date()): string {
  const key = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  return `${key}:${id}`;
}
