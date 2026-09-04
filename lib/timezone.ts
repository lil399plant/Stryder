// Small, dependency-free helpers for converting between a named IANA
// timezone's wall-clock time and real UTC instants. Needed specifically for
// scheduled-meal push reminders (app/api/push/cron-nudges/route.ts): the
// cron job runs server-side with no browser/local clock of its own, so it
// has no other way to know what real-world moment a caregiver-entered
// "7:30 AM" actually refers to.
//
// The household is assumed to be in one timezone — there's no per-caregiver
// or per-device timezone setting in this app, so this is intentionally a
// single constant rather than something configurable.
export const HOUSEHOLD_TIME_ZONE = "America/New_York";

/** "YYYY-MM-DD" for `date` as it reads on a calendar in `timeZone` — used
 * as the day-scoped key for "already reminded today" dedup, and as the date
 * half of zonedDateTime below. Deliberately zone-aware rather than
 * `date.toISOString().slice(0, 10)`, which would give the UTC day and
 * drift near midnight boundaries that don't line up with the household's. */
export function localDateStringInZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/**
 * The real UTC instant for wall-clock `timeStr` ("HH:MM") on `dateStr`
 * ("YYYY-MM-DD"), as read in `timeZone`. Handles DST correctly because it
 * looks up the zone's actual offset at that specific date rather than
 * assuming a fixed one.
 *
 * How it works: construct a throwaway instant by reading the wall-clock
 * string as if it were already UTC, then ask what that same instant would
 * display as in `timeZone` vs. in UTC. The difference between those two
 * displayed times *is* the zone's offset at that moment — regardless of
 * what timezone this server process itself runs in, since both
 * `toLocaleString` calls get parsed by `Date` the same (runtime-local) way
 * and that shared bias cancels out in the subtraction.
 */
export function zonedDateTime(dateStr: string, timeStr: string, timeZone: string): Date {
  const naive = new Date(`${dateStr}T${timeStr}:00Z`);
  const asZoned = new Date(naive.toLocaleString("en-US", { timeZone }));
  const asUtc = new Date(naive.toLocaleString("en-US", { timeZone: "UTC" }));
  return new Date(naive.getTime() + (asUtc.getTime() - asZoned.getTime()));
}
