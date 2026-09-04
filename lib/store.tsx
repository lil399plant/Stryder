"use client";

import { useSyncExternalStore } from "react";
import type {
  AppData,
  AppSettings,
  Caregiver,
  CueEntry,
  DogFriend,
  DownstairsEvent,
  GrowthPhoto,
  HandoffState,
  HealthProfile,
  IncidentEvent,
  InsuranceInfo,
  MealEvent,
  NapEvent,
  PottyEvent,
  PuppyProfile,
  ScheduledMealTimes,
  SpecialEvent,
  TrainingPlan,
  TrainingSession,
  TreatPreferences,
  VaccineRecord,
} from "./types";
import { buildStarterData } from "./seed";
import { makeId } from "./id";
import { DEFAULT_NUDGE_THRESHOLDS } from "./rules";
import { mergeAppData } from "./merge-app-data";

// A small external-store singleton (see useSyncExternalStore below) rather
// than React Context + useState. Reading from localStorage must happen
// client-side only, so a naive useState+useEffect risks either a hydration
// mismatch or a "setState in an effect" anti-pattern; useSyncExternalStore
// is the pattern React recommends for exactly this — a synchronous,
// browser-only external system — and it produces the exact same "nothing
// until mounted, then real data" behavior without extra code.

const STORAGE_KEY = "stryder-data-v2";
const API_ENDPOINT = "/api/data";

let currentData: AppData | null = null;
/** This device's last known synced state — what it last pulled from the
 * server, or successfully saved there. Serves as the common ancestor for
 * the three-way merge in pushToServer (see lib/merge-app-data.ts): without
 * it, one device's save can only either overwrite the server wholesale or
 * not, with no way to tell "a field only the other device changed since we
 * last synced" apart from "a field we're intentionally reverting". */
let lastSyncedData: AppData | null = null;
let initialized = false;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let pushInFlight = false;
let pushPending = false;
const listeners = new Set<() => void>();

// ---- Shared-storage connection status (for the "Data" section in More) ----

export type SyncStatus = { checked: boolean; configured: boolean; lastError: boolean };
let syncStatus: SyncStatus = { checked: false, configured: false, lastError: false };
const syncListeners = new Set<() => void>();

function setSyncStatus(next: Partial<SyncStatus>) {
  syncStatus = { ...syncStatus, ...next };
  syncListeners.forEach((l) => l());
}
function subscribeSyncStatus(cb: () => void) {
  syncListeners.add(cb);
  return () => syncListeners.delete(cb);
}
function getSyncStatusSnapshot() {
  return syncStatus;
}
function getSyncStatusServerSnapshot(): SyncStatus {
  return { checked: false, configured: false, lastError: false };
}
export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(subscribeSyncStatus, getSyncStatusSnapshot, getSyncStatusServerSnapshot);
}

/** Fills in fields added after a user's data was first saved, so older
 * localStorage payloads (or imports) don't crash on a missing array. */
function normalize(data: AppData): AppData {
  return {
    ...data,
    downstairsTrips: (data.downstairsTrips ?? []).map((t) => ({
      ...t,
      pottyMoments: (t.pottyMoments ?? []).map((m) => ({ ...m, timestamp: m.timestamp ?? t.startTime })),
    })),
    events: data.events ?? [],
    photos: data.photos ?? [],
    treatPreferences: data.treatPreferences ?? { chews: "", treats: "" },
    scheduledMeals: data.scheduledMeals ?? {},
    friends: data.friends ?? [],
    settings: {
      ...data.settings,
      nudgeThresholds: data.settings?.nudgeThresholds ?? { ...DEFAULT_NUDGE_THRESHOLDS },
    },
  };
}

function loadFromStorage(): AppData | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalize(JSON.parse(raw) as AppData);
  } catch {
    return null;
  }
}

function saveToStorage(data: AppData) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — fail silently, data stays in memory.
  }
}

function ensureInitialized() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  const existing = loadFromStorage();
  if (existing) {
    currentData = existing;
  } else {
    currentData = buildStarterData();
    saveToStorage(currentData);
  }
  pullFromServer();
}

/**
 * Data lives in localStorage first (instant, offline-safe), and — once
 * Supabase is linked via SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY — is also
 * mirrored to a shared record on the server via /api/data, so both
 * caregivers' devices see the same log. If Supabase isn't configured the
 * API just reports `configured: false` and every call here is a harmless
 * no-op.
 */
async function pullFromServer() {
  // Snapshot what we had when this pull started. The fetch below is async,
  // so the user can log entries (mutate() -> a new currentData) before it
  // resolves; without this, treating the server's response as the whole
  // truth would silently discard whatever was logged in that window — see
  // the incident that prompted this fix.
  const baseSnapshot = currentData;
  try {
    const res = await fetch(API_ENDPOINT, { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    const body = (await res.json()) as { configured: boolean; data: AppData | null };
    setSyncStatus({ checked: true, configured: body.configured, lastError: false });
    if (!body.configured) return;
    if (body.data) {
      // Merge rather than overwrite: `currentData` may have moved on (new
      // local entries) since `baseSnapshot` was captured above, exactly the
      // three-way merge pushOnce does before a save.
      const serverData = normalize(body.data);
      const merged = baseSnapshot ? mergeAppData(baseSnapshot, currentData ?? serverData, serverData) : serverData;
      currentData = merged;
      lastSyncedData = merged;
      saveToStorage(merged);
      notify();
    } else if (currentData) {
      // Supabase is linked but empty (first run) — seed it from what we have.
      schedulePush();
    }
  } catch {
    // Offline, or no /api/data (older deploy) — stay local-only.
    setSyncStatus({ checked: true, configured: false, lastError: true });
  }
}

function schedulePush() {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    runPush();
  }, 400);
}

/** Guards against two push cycles overlapping — e.g. a mutation lands while
 * a previous save's fetch-merge-PUT round trip is still in flight. Rather
 * than racing two merges against each other, a mutation during an in-flight
 * push just marks `pushPending` and gets picked up by a follow-up cycle
 * right after the current one finishes. */
function runPush() {
  if (pushInFlight) {
    pushPending = true;
    return;
  }
  pushInFlight = true;
  pushOnce().finally(() => {
    pushInFlight = false;
    if (pushPending) {
      pushPending = false;
      runPush();
    }
  });
}

async function pushOnce() {
  const localSnapshot = currentData;
  if (!localSnapshot) return;

  try {
    // Always re-fetch right before saving — this is the merge's whole
    // point. Pushing localSnapshot on its own (the old behavior) risks
    // silently overwriting anything another device saved since this one
    // last synced; see lib/merge-app-data.ts.
    const getRes = await fetch(API_ENDPOINT, { cache: "no-store" });
    if (!getRes.ok) throw new Error(String(getRes.status));
    const getBody = (await getRes.json()) as { configured: boolean; data: AppData | null };
    setSyncStatus({ checked: true, configured: getBody.configured, lastError: false });
    if (!getBody.configured) return;

    const toSave =
      getBody.data && lastSyncedData ? mergeAppData(lastSyncedData, localSnapshot, normalize(getBody.data)) : localSnapshot;

    const putRes = await fetch(API_ENDPOINT, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toSave),
    });
    const putBody = (await putRes.json()) as { configured: boolean; saved?: boolean };
    setSyncStatus({ checked: true, configured: putBody.configured, lastError: putBody.configured && !putBody.saved });

    if (putBody.saved) {
      currentData = toSave;
      lastSyncedData = toSave;
      saveToStorage(toSave);
      notify();
    }
  } catch {
    // Offline, or the fetch/PUT failed — localStorage already has our
    // local edits, so nothing's lost; we'll retry on the next mutation.
    setSyncStatus({ lastError: syncStatus.configured });
  }
}

function notify() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): AppData | null {
  ensureInitialized();
  return currentData;
}

function getServerSnapshot(): AppData | null {
  return null;
}

function set(next: AppData) {
  currentData = next;
  saveToStorage(next);
  schedulePush();
  notify();
}

function mutate(updater: (draft: AppData) => AppData) {
  if (!currentData) return;
  set(updater(currentData));
}

/** Like `set`, but for the rare deliberate "replace everything" actions
 * (Import JSON, Erase all data) — these are explicitly meant to overwrite
 * the shared record wholesale, not merge against whatever's there, so this
 * clears the merge base rather than treating it as a normal edit. */
function setOverwrite(next: AppData) {
  currentData = next;
  lastSyncedData = null;
  saveToStorage(next);
  schedulePush();
  notify();
}

// ---- Typed actions (plain functions — always read the latest module state) ----

function addPotty(e: Omit<PottyEvent, "id" | "kind">): string {
  const id = makeId();
  mutate((d) => ({ ...d, pottyEvents: [...d.pottyEvents, { ...e, id, kind: "potty" }] }));
  return id;
}
function updatePotty(id: string, patch: Partial<PottyEvent>) {
  mutate((d) => ({ ...d, pottyEvents: d.pottyEvents.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
}
function deletePotty(id: string) {
  mutate((d) => ({ ...d, pottyEvents: d.pottyEvents.filter((p) => p.id !== id) }));
}

function addMeal(e: Omit<MealEvent, "id" | "kind">): string {
  const id = makeId();
  mutate((d) => ({ ...d, mealEvents: [...d.mealEvents, { ...e, id, kind: "meal" }] }));
  return id;
}
function updateMeal(id: string, patch: Partial<MealEvent>) {
  mutate((d) => ({ ...d, mealEvents: d.mealEvents.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));
}
function deleteMeal(id: string) {
  mutate((d) => ({ ...d, mealEvents: d.mealEvents.filter((m) => m.id !== id) }));
}

function startNap(e: Omit<NapEvent, "id" | "kind" | "endTime">): string {
  const id = makeId();
  mutate((d) => ({ ...d, napEvents: [...d.napEvents, { ...e, id, kind: "nap" }] }));
  return id;
}
function addNap(e: Omit<NapEvent, "id" | "kind">): string {
  const id = makeId();
  mutate((d) => ({ ...d, napEvents: [...d.napEvents, { ...e, id, kind: "nap" }] }));
  return id;
}
function endNap(id: string, endTime?: string) {
  mutate((d) => ({
    ...d,
    napEvents: d.napEvents.map((n) => (n.id === id ? { ...n, endTime: endTime ?? new Date().toISOString() } : n)),
  }));
}
function updateNap(id: string, patch: Partial<NapEvent>) {
  mutate((d) => ({ ...d, napEvents: d.napEvents.map((n) => (n.id === id ? { ...n, ...patch } : n)) }));
}
function deleteNap(id: string) {
  mutate((d) => ({ ...d, napEvents: d.napEvents.filter((n) => n.id !== id) }));
}

function startDownstairs(e: Omit<DownstairsEvent, "id" | "kind" | "endTime">): string {
  const id = makeId();
  mutate((d) => ({ ...d, downstairsTrips: [...d.downstairsTrips, { ...e, id, kind: "downstairs" }] }));
  return id;
}
function addDownstairsTrip(e: Omit<DownstairsEvent, "id" | "kind">): string {
  const id = makeId();
  mutate((d) => ({ ...d, downstairsTrips: [...d.downstairsTrips, { ...e, id, kind: "downstairs" }] }));
  return id;
}
function endDownstairs(id: string, endTime?: string) {
  mutate((d) => ({
    ...d,
    downstairsTrips: d.downstairsTrips.map((o) =>
      o.id === id ? { ...o, endTime: endTime ?? new Date().toISOString() } : o
    ),
  }));
}
function updateDownstairsTrip(id: string, patch: Partial<DownstairsEvent>) {
  mutate((d) => ({
    ...d,
    downstairsTrips: d.downstairsTrips.map((o) => (o.id === id ? { ...o, ...patch } : o)),
  }));
}
function deleteDownstairsTrip(id: string) {
  mutate((d) => ({ ...d, downstairsTrips: d.downstairsTrips.filter((o) => o.id !== id) }));
}

function startEvent(e: Omit<SpecialEvent, "id" | "kind" | "endTime">): string {
  const id = makeId();
  mutate((d) => ({ ...d, events: [...d.events, { ...e, id, kind: "event" }] }));
  return id;
}
function addEvent(e: Omit<SpecialEvent, "id" | "kind">): string {
  const id = makeId();
  mutate((d) => ({ ...d, events: [...d.events, { ...e, id, kind: "event" }] }));
  return id;
}
function endEvent(id: string, endTime?: string) {
  mutate((d) => ({
    ...d,
    events: d.events.map((ev) => (ev.id === id ? { ...ev, endTime: endTime ?? new Date().toISOString() } : ev)),
  }));
}
function updateEvent(id: string, patch: Partial<SpecialEvent>) {
  mutate((d) => ({ ...d, events: d.events.map((ev) => (ev.id === id ? { ...ev, ...patch } : ev)) }));
}
function deleteEvent(id: string) {
  mutate((d) => ({ ...d, events: d.events.filter((ev) => ev.id !== id) }));
}

function addIncident(e: Omit<IncidentEvent, "id" | "kind">): string {
  const id = makeId();
  mutate((d) => ({ ...d, incidentEvents: [...d.incidentEvents, { ...e, id, kind: "incident" }] }));
  return id;
}
function updateIncident(id: string, patch: Partial<IncidentEvent>) {
  mutate((d) => ({
    ...d,
    incidentEvents: d.incidentEvents.map((i) => (i.id === id ? { ...i, ...patch } : i)),
  }));
}
function deleteIncident(id: string) {
  mutate((d) => ({ ...d, incidentEvents: d.incidentEvents.filter((i) => i.id !== id) }));
}

function addTrainingSession(e: Omit<TrainingSession, "id">): string {
  const id = makeId();
  mutate((d) => ({ ...d, trainingSessions: [...d.trainingSessions, { ...e, id }] }));
  return id;
}
function updateTrainingSession(id: string, patch: Partial<TrainingSession>) {
  mutate((d) => ({
    ...d,
    trainingSessions: d.trainingSessions.map((s) => (s.id === id ? { ...s, ...patch } : s)),
  }));
}
function deleteTrainingSession(id: string) {
  mutate((d) => ({ ...d, trainingSessions: d.trainingSessions.filter((s) => s.id !== id) }));
}

function updateTrainingPlan(id: string, patch: Partial<TrainingPlan>) {
  mutate((d) => ({ ...d, trainingPlans: d.trainingPlans.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
}
function addTrainingPlan(plan: Omit<TrainingPlan, "id">): string {
  const id = makeId();
  mutate((d) => ({ ...d, trainingPlans: [...d.trainingPlans, { ...plan, id }] }));
  return id;
}

function addCue(c: Omit<CueEntry, "id">): string {
  const id = makeId();
  mutate((d) => ({ ...d, cues: [...d.cues, { ...c, id }] }));
  return id;
}
function updateCue(id: string, patch: Partial<CueEntry>) {
  mutate((d) => ({ ...d, cues: d.cues.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
}
function deleteCue(id: string) {
  mutate((d) => ({ ...d, cues: d.cues.filter((c) => c.id !== id) }));
}

function addFriend(f: Omit<DogFriend, "id">): string {
  const id = makeId();
  mutate((d) => ({ ...d, friends: [...d.friends, { ...f, id }] }));
  return id;
}
function updateFriend(id: string, patch: Partial<DogFriend>) {
  mutate((d) => ({ ...d, friends: d.friends.map((f) => (f.id === id ? { ...f, ...patch } : f)) }));
}
function deleteFriend(id: string) {
  mutate((d) => ({ ...d, friends: d.friends.filter((f) => f.id !== id) }));
}

function addPhoto(p: Omit<GrowthPhoto, "id">): string {
  const id = makeId();
  mutate((d) => ({ ...d, photos: [...d.photos, { ...p, id }] }));
  return id;
}
function updatePhoto(id: string, patch: Partial<GrowthPhoto>) {
  mutate((d) => ({ ...d, photos: d.photos.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
}
function deletePhoto(id: string) {
  mutate((d) => ({ ...d, photos: d.photos.filter((p) => p.id !== id) }));
}

function addVaccine(v: Omit<VaccineRecord, "id">): string {
  const id = makeId();
  mutate((d) => ({ ...d, vaccines: [...d.vaccines, { ...v, id }] }));
  return id;
}
function updateVaccine(id: string, patch: Partial<VaccineRecord>) {
  mutate((d) => ({ ...d, vaccines: d.vaccines.map((v) => (v.id === id ? { ...v, ...patch } : v)) }));
}
function deleteVaccine(id: string) {
  mutate((d) => ({ ...d, vaccines: d.vaccines.filter((v) => v.id !== id) }));
}

function updateInsurance(patch: Partial<InsuranceInfo>) {
  mutate((d) => ({ ...d, insurance: { ...d.insurance, ...patch } }));
}
function updateHealthProfile(patch: Partial<HealthProfile>) {
  mutate((d) => ({ ...d, health: { ...d.health, ...patch } }));
}
function updateTreatPreferences(patch: Partial<TreatPreferences>) {
  mutate((d) => ({ ...d, treatPreferences: { ...d.treatPreferences, ...patch } }));
}
function updateScheduledMeals(patch: Partial<ScheduledMealTimes>) {
  mutate((d) => ({ ...d, scheduledMeals: { ...d.scheduledMeals, ...patch } }));
}
function updatePuppy(patch: Partial<PuppyProfile>) {
  mutate((d) => ({ ...d, puppy: { ...d.puppy, ...patch } }));
}
function updateCaregiverName(id: Caregiver, name: string) {
  mutate((d) => ({
    ...d,
    caregivers: d.caregivers.map((c) => (c.id === id ? { ...c, displayName: name } : c)),
  }));
}
function setHandoff(patch: Partial<HandoffState>) {
  mutate((d) => ({ ...d, handoff: { ...d.handoff, ...patch, updatedAt: new Date().toISOString() } }));
}
function updateScheduleBlock(id: string, text: string) {
  mutate((d) => ({ ...d, schedule: d.schedule.map((b) => (b.id === id ? { ...b, text } : b)) }));
}
function updateSettings(patch: Partial<AppSettings>) {
  mutate((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
}
/** Merges against the store's current settings, not a React-render-time
 * snapshot — matters here because several nudge-threshold fields can each
 * commit (on blur) in quick succession, e.g. when Tab moves focus through
 * them. Reading `mutate`'s fresh `d` instead of a component-closure value
 * avoids one commit clobbering another with stale data. */
function updateNudgeThresholds(patch: Partial<AppSettings["nudgeThresholds"]>) {
  mutate((d) => ({
    ...d,
    settings: { ...d.settings, nudgeThresholds: { ...d.settings.nudgeThresholds, ...patch } },
  }));
}
function dismissNudge(id: string) {
  mutate((d) => ({ ...d, dismissedNudges: [...d.dismissedNudges, id] }));
}

function importJson(json: string): { ok: boolean; error?: string } {
  try {
    const parsed = JSON.parse(json) as AppData;
    if (!parsed || typeof parsed !== "object" || parsed.version !== 1) {
      return { ok: false, error: "This file doesn't look like a Stryder export." };
    }
    setOverwrite(normalize(parsed));
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't parse that file as JSON." };
  }
}
function exportJson(): string {
  return JSON.stringify(currentData, null, 2);
}
function resetToSeed() {
  setOverwrite(buildStarterData());
}

const actions = {
  addPotty,
  updatePotty,
  deletePotty,
  addMeal,
  updateMeal,
  deleteMeal,
  startNap,
  endNap,
  addNap,
  updateNap,
  deleteNap,
  startDownstairs,
  endDownstairs,
  addDownstairsTrip,
  updateDownstairsTrip,
  deleteDownstairsTrip,
  startEvent,
  endEvent,
  addEvent,
  updateEvent,
  deleteEvent,
  addIncident,
  updateIncident,
  deleteIncident,
  addTrainingSession,
  updateTrainingSession,
  deleteTrainingSession,
  updateTrainingPlan,
  addTrainingPlan,
  addCue,
  updateCue,
  deleteCue,
  addFriend,
  updateFriend,
  deleteFriend,
  addPhoto,
  updatePhoto,
  deletePhoto,
  addVaccine,
  updateVaccine,
  deleteVaccine,
  updateInsurance,
  updateHealthProfile,
  updateTreatPreferences,
  updateScheduledMeals,
  updatePuppy,
  updateCaregiverName,
  setHandoff,
  updateScheduleBlock,
  updateSettings,
  updateNudgeThresholds,
  dismissNudge,
  importJson,
  exportJson,
  resetToSeed,
};

export function useStore() {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { data, ready: data !== null, ...actions };
}
