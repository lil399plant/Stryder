// "Every pee/poop logged, wherever it lives" — pee/poop can be logged two
// ways: a standalone PottyEvent (quick-log, any time) or a PottyMoment
// embedded in a DownstairsEvent (logged as part of a trip). Analytics
// (lib/analytics.ts) and the nudge rules (lib/rules.ts) both need to treat
// these as one combined history rather than favoring whichever source they
// happen to read first — this is that shared view. Accidents are excluded
// on purpose: they're never trip-scoped and are handled directly off
// data.pottyEvents by the few things that care about them specifically.

import type { AppData, ISODateTime } from "./types";

export interface PottyOccurrence {
  timestamp: ISODateTime;
  type: "pee" | "poop";
}

export function allPottyOccurrences(data: AppData): PottyOccurrence[] {
  const out: PottyOccurrence[] = [];

  for (const p of data.pottyEvents) {
    if (p.type === "pee") out.push({ timestamp: p.timestamp, type: "pee" });
    else if (p.type === "poop") out.push({ timestamp: p.timestamp, type: "poop" });
    else if (p.type === "both") {
      out.push({ timestamp: p.timestamp, type: "pee" });
      out.push({ timestamp: p.timestamp, type: "poop" });
    }
  }

  for (const trip of data.downstairsTrips) {
    for (const m of trip.pottyMoments ?? []) {
      const timestamp = m.timestamp ?? trip.startTime;
      if (m.type === "pee" || m.type === "both") out.push({ timestamp, type: "pee" });
      if (m.type === "poop" || m.type === "both") out.push({ timestamp, type: "poop" });
    }
  }

  return out;
}

export function lastPottyOccurrence(data: AppData, types: ("pee" | "poop")[]): PottyOccurrence | null {
  const matches = allPottyOccurrences(data)
    .filter((o) => types.includes(o.type))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return matches[0] ?? null;
}
