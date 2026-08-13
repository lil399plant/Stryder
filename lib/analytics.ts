// Pure, dependency-free aggregation helpers for the Analytics page. Every
// function here just counts/averages what was actually logged — no
// predictions, no medical inference. Callers are responsible for phrasing
// results cautiously (see components/analytics).

import type { AppData, PottyTag } from "./types";
import { addDays, startOfDay, minutesBetween, isSameDay } from "./time";

/** Anything this long or longer is treated as overnight sleep, not a waking
 * gap — without this, a whole night (often logged starting in the evening
 * and ending well into the morning) would badly skew both the nap-duration
 * chart and the potty-gap averages below. */
const OVERNIGHT_SLEEP_MINUTES = 4 * 60;

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

/** One point per logged pee/poop/accident, positioned by time-of-day only
 * (0–24, fractional) — no date axis, since this is a single distribution
 * across all logged history, not a per-day breakdown. A "both" potty entry
 * becomes two points (one pee, one poop) at the same hour, since it really
 * is two events that happened together. */
export interface BathroomPoint {
  hour: number;
  type: "pee" | "poop" | "accident";
}

export function bathroomTimingPoints(data: AppData): BathroomPoint[] {
  const points: BathroomPoint[] = [];
  for (const p of data.pottyEvents) {
    const hour = new Date(p.timestamp).getHours() + new Date(p.timestamp).getMinutes() / 60;
    if (p.type === "pee") points.push({ hour, type: "pee" });
    else if (p.type === "poop") points.push({ hour, type: "poop" });
    else if (p.type === "both") {
      points.push({ hour, type: "pee" });
      points.push({ hour, type: "poop" });
    } else if (p.type === "accident") {
      points.push({ hour, type: "accident" });
    }
  }
  return points;
}

export interface PottyGapStat {
  avgMinutes: number | null;
  count: number;
}

/** An "overnight" gap: it runs from an evening hour into a morning hour
 * (bedtime to wake-up), and is long enough to actually be a night's sleep
 * rather than a quick late trip — e.g. 10pm→7am counts, but a 9pm→11:30pm
 * or a 12am→3am gap (two trips within the same night) doesn't. Duration
 * alone can't tell these apart from a long *daytime* gap, so both the
 * time-of-day shape and the length matter. */
function isOvernightGap(from: Date, to: Date, gapMinutes: number): boolean {
  return from.getHours() >= 21 && to.getHours() < 9 && gapMinutes >= OVERNIGHT_SLEEP_MINUTES;
}

/** Average gap between consecutive occurrences of one potty type. A "both"
 * entry counts as an occurrence of *both* pee and poop — it's the same
 * event happening within moments of itself, not two separate schedules —
 * so it's included in each type's own sequence rather than only "both". */
function averageGapForType(data: AppData, type: "pee" | "poop"): PottyGapStat {
  const matches = data.pottyEvents.filter((p) => p.type === type || p.type === "both");
  const sorted = [...matches].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  if (sorted.length < 2) return { avgMinutes: null, count: 0 };
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const from = new Date(sorted[i - 1].timestamp);
    const to = new Date(sorted[i].timestamp);
    const gap = minutesBetween(from, to);
    if (gap < 0) continue;
    if (gap >= 12 * 60) continue; // outlier — likely a missed-logging stretch, not a real gap
    if (isOvernightGap(from, to, gap)) continue; // exclude time asleep, not awake
    gaps.push(gap);
  }
  if (gaps.length === 0) return { avgMinutes: null, count: 0 };
  const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  return { avgMinutes: Math.round(avg), count: gaps.length };
}

export function averageGapBetweenPee(data: AppData): PottyGapStat {
  return averageGapForType(data, "pee");
}

export function averageGapBetweenPoop(data: AppData): PottyGapStat {
  return averageGapForType(data, "poop");
}

export interface NapDurationBucket {
  label: string;
  count: number;
}

const NAP_BUCKETS = [
  { label: "<15m", min: 0, max: 15 },
  { label: "15–30m", min: 15, max: 30 },
  { label: "30–60m", min: 30, max: 60 },
  { label: "1–2h", min: 60, max: 120 },
  { label: "2–4h", min: 120, max: 240 },
] as const;

export interface NapDurationStats {
  buckets: NapDurationBucket[];
  count: number;
  avgMinutes: number | null;
}

export function napDurationHistogram(data: AppData): NapDurationStats {
  const durations: number[] = [];
  for (const n of data.napEvents) {
    if (!n.endTime) continue;
    const mins = minutesBetween(new Date(n.startTime), new Date(n.endTime));
    if (mins <= 0 || mins >= OVERNIGHT_SLEEP_MINUTES) continue;
    durations.push(mins);
  }
  const counts = NAP_BUCKETS.map(
    (b) => durations.filter((m) => m >= b.min && m < b.max).length
  );
  return {
    buckets: NAP_BUCKETS.map((b, i) => ({ label: b.label, count: counts[i] })),
    count: durations.length,
    avgMinutes: durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null,
  };
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

/** Full calendar days since the most recent accident — today doesn't count
 * until it's actually over, so an accident logged yesterday reads as 0
 * days (today isn't finished yet), and one from two days ago reads as 1
 * (yesterday was the one full clean day so far). Null when no accident has
 * ever been logged, rather than showing a possibly-huge/meaningless count. */
export function daysSinceLastAccident(data: AppData, now: Date = new Date()): number | null {
  const accidents = data.pottyEvents.filter((p) => p.type === "accident");
  if (accidents.length === 0) return null;
  const last = accidents.reduce((latest, p) =>
    new Date(p.timestamp).getTime() > new Date(latest.timestamp).getTime() ? p : latest
  );
  const lastDay = startOfDay(new Date(last.timestamp));
  const today = startOfDay(now);
  const rawDays = Math.round((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, rawDays - 1);
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
