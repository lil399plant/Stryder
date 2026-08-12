// Pure date-grid helpers for the calendar (day/week/month) views.
import { addDays, isSameDay, startOfDay } from "./time";

export const PIXELS_PER_MINUTE = 1; // 1440px tall day column — keeps top/height math trivial
export const DAY_HEIGHT = 24 * 60 * PIXELS_PER_MINUTE;
export const HOUR_HEIGHT = 60 * PIXELS_PER_MINUTE;

export function minutesSinceMidnight(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

/** Sunday-start week containing `date`. */
export function getWeekStart(date: Date): Date {
  const d = startOfDay(date);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export function getWeekDays(date: Date): Date[] {
  const start = getWeekStart(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export interface MonthCell {
  date: Date;
  inCurrentMonth: boolean;
}

/** Full 6-row month grid (always 42 cells) so the layout height never jumps. */
export function getMonthGrid(date: Date): MonthCell[] {
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const gridStart = getWeekStart(firstOfMonth);
  return Array.from({ length: 42 }, (_, i) => {
    const d = addDays(gridStart, i);
    return { date: d, inCurrentMonth: d.getMonth() === date.getMonth() };
  });
}

export function weekRangeLabel(date: Date): string {
  const days = getWeekDays(date);
  const start = days[0];
  const end = days[6];
  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = start.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const endLabel = sameMonth
    ? String(end.getDate())
    : end.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${startLabel} – ${endLabel}, ${end.getFullYear()}`;
}

export function monthLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function dayLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

export { isSameDay };
