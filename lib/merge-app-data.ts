import type { AppData } from "./types";

// Three-way merge, used right before every save to the shared record (see
// lib/store.tsx) — this is what actually fixes "last write wins wipes out
// the other device's new entries" (see AboutSection's privacy note, and the
// incident that prompted this file). `base` is this device's last known
// synced state (what it last pulled or successfully pushed); `local` is
// what it's about to save; `server` is whatever's on the server right now,
// which may have moved on since `base` if another device saved in the
// meantime. Using `base` as the common ancestor lets every field/array
// entry be classified as "we changed it," "they changed it," or "neither,"
// instead of one whole snapshot blindly clobbering the other.

type Identified = { id: string };

/** Structural equality for a merged item — used below to tell "this device
 * hasn't touched this item since `base`" apart from "this device edited it,"
 * the same distinction `mergeSingleton` draws per-field via `Object.is`. A
 * whole record can't use `Object.is` (every `{...x}` spread makes a new
 * object), so this compares by value instead. */
function itemsEqual<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Merges one id-keyed array. For an id present in both `base` and `local`,
 * this device's copy only wins if it actually differs from `base` — i.e. we
 * edited it since the last sync. If our copy still matches `base`, the
 * server's version wins instead, so a peer's edit to an item we already
 * have (e.g. ending a nap they started) isn't reverted back to our stale
 * copy — that was the bug: the old rule let a same-id item win locally
 * unconditionally, so any peer update to an already-synced item was
 * silently discarded on every merge. A genuine same-item double-edit (both
 * devices changed it since `base`) still resolves to local, same as before
 * — rare in practice, and there's no better tiebreak available here.
 * An id that's on the server but not in `local`: kept if it's new since
 * `base` (a peer added it and we don't know about it yet); dropped if
 * `base` already had it (we deleted it locally — the deletion is respected
 * rather than resurrected by the merge). */
function mergeArrayById<T extends Identified>(base: T[], local: T[], server: T[]): T[] {
  const baseById = new Map(base.map((x) => [x.id, x]));
  const localIds = new Set(local.map((x) => x.id));
  const serverById = new Map(server.map((x) => [x.id, x]));

  const result: T[] = local.map((item) => {
    const baseItem = baseById.get(item.id);
    const serverItem = serverById.get(item.id);
    if (!serverItem) return item; // no peer copy to defer to — keep local
    if (baseItem && itemsEqual(item, baseItem)) return serverItem; // we didn't touch it — take theirs
    return item; // we changed it (or it's brand new) — ours wins
  });
  const seen = new Set(localIds);

  for (const item of server) {
    if (seen.has(item.id)) continue;
    if (baseById.has(item.id) && !localIds.has(item.id)) continue; // deleted locally
    result.push(item);
    seen.add(item.id);
  }

  return result;
}

/** Same idea as mergeArrayById but for a plain string array (dismissedNudges
 * — there's no separate "id" from the value itself). */
function mergeStringSet(base: string[], local: string[], server: string[]): string[] {
  const baseSet = new Set(base);
  const localSet = new Set(local);
  const result = new Set(local);
  for (const s of server) {
    if (baseSet.has(s) && !localSet.has(s)) continue; // removed locally
    result.add(s);
  }
  return [...result];
}

/** Shallow field-by-field merge for a "singleton" object (puppy, handoff,
 * etc, not a list of records): a field comes from `local` if this device
 * actually changed it since `base`; otherwise it comes from `server`, so a
 * field only the OTHER device touched isn't reverted by our save. */
function mergeSingleton<T extends object>(base: T, local: T, server: T): T {
  const result = { ...server };
  for (const key of Object.keys(local) as (keyof T)[]) {
    if (!Object.is(local[key], base[key])) {
      result[key] = local[key];
    }
  }
  return result;
}

export function mergeAppData(base: AppData, local: AppData, server: AppData): AppData {
  return {
    version: local.version,
    puppy: mergeSingleton(base.puppy, local.puppy, server.puppy),
    photos: mergeArrayById(base.photos, local.photos, server.photos),
    caregivers: mergeArrayById(base.caregivers, local.caregivers, server.caregivers),
    handoff: mergeSingleton(base.handoff, local.handoff, server.handoff),
    schedule: mergeArrayById(base.schedule, local.schedule, server.schedule),
    pottyEvents: mergeArrayById(base.pottyEvents, local.pottyEvents, server.pottyEvents),
    mealEvents: mergeArrayById(base.mealEvents, local.mealEvents, server.mealEvents),
    napEvents: mergeArrayById(base.napEvents, local.napEvents, server.napEvents),
    downstairsTrips: mergeArrayById(base.downstairsTrips, local.downstairsTrips, server.downstairsTrips),
    events: mergeArrayById(base.events, local.events, server.events),
    incidentEvents: mergeArrayById(base.incidentEvents, local.incidentEvents, server.incidentEvents),
    trainingPlans: mergeArrayById(base.trainingPlans, local.trainingPlans, server.trainingPlans),
    trainingSessions: mergeArrayById(base.trainingSessions, local.trainingSessions, server.trainingSessions),
    cues: mergeArrayById(base.cues, local.cues, server.cues),
    treatPreferences: mergeSingleton(base.treatPreferences, local.treatPreferences, server.treatPreferences),
    scheduledMeals: mergeSingleton(base.scheduledMeals, local.scheduledMeals, server.scheduledMeals),
    friends: mergeArrayById(base.friends, local.friends, server.friends),
    vaccines: mergeArrayById(base.vaccines, local.vaccines, server.vaccines),
    insurance: mergeSingleton(base.insurance, local.insurance, server.insurance),
    health: mergeSingleton(base.health, local.health, server.health),
    settings: mergeSingleton(base.settings, local.settings, server.settings),
    dismissedNudges: mergeStringSet(base.dismissedNudges, local.dismissedNudges, server.dismissedNudges),
  };
}
