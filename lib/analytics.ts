// Pure, dependency-free aggregation helpers for the Analytics page. Every
// function here just counts/averages what was actually logged — no
// predictions, no medical inference. Callers are responsible for phrasing
// results cautiously (see components/analytics).

import type { AppData, NapLocation, PottyTag } from "./types";
import { addDays, startOfDay, minutesBetween, isSameDay } from "./time";

export interface DayBucket {
  date: Date;
  label: string;
}

export function lastNDays(n: number, now: Date = new Date()): DayBucket[] {
  const days: DayBucket[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = startOfDay(addDays(now, -i));
    days.push({
      date: d,
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
    });
  }
  return days;
}

export interface BathroomDayRow {
  day: DayBucket;
  points: { hour: number; type: string }[];
}

export function bathroomTimingByDay(data: AppData, days = 7, now = new Date()): BathroomDayRow[] {
  const buckets = lastNDays(days, now);
  return buckets.map((day) => ({
    day,
    points: data.pottyEvents
      .filter((p) => isSameDay(new Date(p.timestamp), day.date))
      .map((p) => ({ hour: new Date(p.timestamp).getHours() + new Date(p.timestamp).getMinutes() / 60, type: p.type })),
  }));
}

export function averageGapBetweenPottyEvents(data: AppData): { avgMinutes: number | null; count: number } {
  const sorted = [...data.pottyEvents]
    .filter((p) => p.type !== "accident")
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  if (sorted.length < 2) return { avgMinutes: null, count: 0 };
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const gap = minutesBetween(new Date(sorted[i - 1].timestamp), new Date(sorted[i].timestamp));
    if (gap >= 0 && gap < 12 * 60) gaps.push(gap); // ignore overnight gaps as outliers
  }
  if (gaps.length === 0) return { avgMinutes: null, count: 0 };
  const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  return { avgMinutes: Math.round(avg), count: gaps.length };
}

export interface NapLocationStat {
  location: NapLocation;
  count: number;
  avgMinutes: number | null;
}

export function napDurationByLocation(data: AppData): NapLocationStat[] {
  const byLoc = new Map<NapLocation, number[]>();
  for (const n of data.napEvents) {
    if (!n.endTime) continue;
    const mins = minutesBetween(new Date(n.startTime), new Date(n.endTime));
    if (mins <= 0) continue;
    const arr = byLoc.get(n.location) ?? [];
    arr.push(mins);
    byLoc.set(n.location, arr);
  }
  return Array.from(byLoc.entries())
    .map(([location, mins]) => ({
      location,
      count: mins.length,
      avgMinutes: mins.length ? Math.round(mins.reduce((a, b) => a + b, 0) / mins.length) : null,
    }))
    .sort((a, b) => b.count - a.count);
}

export interface AppetiteStat {
  appetite: string;
  count: number;
}

export function appetiteBreakdown(data: AppData): AppetiteStat[] {
  const counts: Record<string, number> = { finished: 0, most: 0, some: 0, refused: 0 };
  for (const m of data.mealEvents) counts[m.appetite] = (counts[m.appetite] ?? 0) + 1;
  return Object.entries(counts).map(([appetite, count]) => ({ appetite, count }));
}

export interface TagStat {
  tag: PottyTag;
  count: number;
}

export function accidentTagFrequency(data: AppData): TagStat[] {
  const counts = new Map<PottyTag, number>();
  for (const p of data.pottyEvents) {
    if (p.type !== "accident") continue;
    for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export function accidentCount(data: AppData): number {
  return data.pottyEvents.filter((p) => p.type === "accident").length;
}

export interface DayCount {
  day: DayBucket;
  count: number;
}

export function trainingSessionsPerDay(data: AppData, days = 14, now = new Date()): DayCount[] {
  const buckets = lastNDays(days, now);
  return buckets.map((day) => ({
    day,
    count: data.trainingSessions.filter((s) => isSameDay(new Date(s.timestamp), day.date)).length,
  }));
}

export interface CorrelationCard {
  id: string;
  text: string;
}

/**
 * Cautious, descriptive-only observations. Each is only surfaced when there's
 * a reasonable amount of supporting data — otherwise it's simply omitted.
 * These are plain comparisons of logged tags, never medical or causal claims.
 */
export function correlationCards(data: AppData): CorrelationCard[] {
  const cards: CorrelationCard[] = [];

  // Heat tag vs nap duration
  const heatDays = new Set(
    data.pottyEvents.filter((p) => p.tags.includes("heat")).map((p) => startOfDay(new Date(p.timestamp)).toDateString())
  );
  if (heatDays.size >= 1) {
    const napsOnHeatDays = data.napEvents.filter(
      (n) => n.endTime && heatDays.has(startOfDay(new Date(n.startTime)).toDateString())
    );
    const napsOtherDays = data.napEvents.filter(
      (n) => n.endTime && !heatDays.has(startOfDay(new Date(n.startTime)).toDateString())
    );
    if (napsOnHeatDays.length >= 2 && napsOtherDays.length >= 2) {
      const avg = (arr: typeof napsOnHeatDays) =>
        arr.reduce((sum, n) => sum + minutesBetween(new Date(n.startTime), new Date(n.endTime as string)), 0) / arr.length;
      const heatAvg = avg(napsOnHeatDays);
      const otherAvg = avg(napsOtherDays);
      if (heatAvg < otherAvg * 0.9) {
        cards.push({
          id: "heat-naps",
          text: `On days tagged "heat," naps were often shorter (~${Math.round(heatAvg)}m vs ~${Math.round(otherAvg)}m on other days).`,
        });
      }
    }
  }

  // Accidents vs top tag
  const accidents = data.pottyEvents.filter((p) => p.type === "accident");
  if (accidents.length >= 2) {
    const tagCounts = accidentTagFrequency(data);
    const top = tagCounts[0];
    if (top && top.count / accidents.length >= 0.5) {
      const tagLabel = top.tag.replace(/-/g, " ");
      cards.push({
        id: "accidents-tag",
        text: `Most logged accidents (${top.count} of ${accidents.length}) were tagged "${tagLabel}."`,
      });
    }
  }

  // Training outcome trend
  const tooHard = data.trainingSessions.filter((s) => s.outcome === "too-hard");
  if (tooHard.length >= 2) {
    const bySkill = new Map<string, number>();
    for (const s of tooHard) bySkill.set(s.skillLabel, (bySkill.get(s.skillLabel) ?? 0) + 1);
    const top = Array.from(bySkill.entries()).sort((a, b) => b[1] - a[1])[0];
    if (top) {
      cards.push({
        id: "training-hard",
        text: `"${top[0]}" has been marked "too hard" more than once — might be worth an easier step.`,
      });
    }
  }

  return cards;
}
