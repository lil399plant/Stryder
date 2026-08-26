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

/** Merges one id-keyed array. An id present in `local` wins with local's
 * version of that item (covers both "we added it" and "we edited it" —
 * simplest available rule for a genuine same-item double-edit, and rare in
 * practice). An id that's on the server but not in `local`: kept if it's
 * new since `base` (a peer added it and we don't know about it yet);
 * dropped if `base` already had it (we deleted it locally — the deletion
 * is respected rather than resurrected by the merge). */
function mergeArrayById<T extends Identified>(base: T[], local: T[], server: T[]): T[] {
  const baseIds = new Set(base.map((x) => x.id));
  const localIds = new Set(local.map((x) => x.id));

  const result: T[] = [...local];
  const seen = new Set(localIds);

  for (const item of server) {
    if (seen.has(item.id)) continue;
    if (baseIds.has(item.id) && !localIds.has(item.id)) continue; // deleted locally
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
    friends: mergeArrayById(base.friends, local.friends, server.friends),
    vaccines: mergeArrayById(base.vaccines, local.vaccines, server.vaccines),
    insurance: mergeSingleton(base.insurance, local.insurance, server.insurance),
    health: mergeSingleton(base.health, local.health, server.health),
    settings: mergeSingleton(base.settings, local.settings, server.settings),
    dismissedNudges: mergeStringSet(base.dismissedNudges, local.dismissedNudges, server.dismissedNudges),
  };
}
