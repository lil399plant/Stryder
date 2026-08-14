"use client";

import { useSyncExternalStore } from "react";
import type { Caregiver } from "./types";

// "Which caregiver is this device" — deliberately separate from the synced
// AppData. Everything else in this app is shared household state (both
// caregivers see the same log), but push subscriptions are inherently
// per-device: this phone belongs to Julia, that laptop's Ribo's, etc. There's
// no login to derive this from, so it's asked once and remembered locally,
// same trust model as everything else here (no server-side verification).

const STORAGE_KEY = "stryder-device-caregiver";

let current: Caregiver | null | undefined;
const listeners = new Set<() => void>();

function read(): Caregiver | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === "me" || raw === "ribo" ? raw : null;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): Caregiver | null {
  if (current === undefined) current = read();
  return current;
}

function getServerSnapshot(): Caregiver | null {
  return null;
}

export function setDeviceCaregiver(caregiver: Caregiver) {
  current = caregiver;
  try {
    window.localStorage.setItem(STORAGE_KEY, caregiver);
  } catch {
    // Storage unavailable — stays in memory for this session only.
  }
  listeners.forEach((l) => l());
}

/** The caregiver this device is set to, or null if never asked/answered. */
export function useDeviceCaregiver(): Caregiver | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
