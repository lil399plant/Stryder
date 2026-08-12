"use client";

import { useSyncExternalStore } from "react";

// Storage for the standalone AI Triage module. Deliberately separate from
// lib/store.tsx: this history is never part of AppData, never synced to
// Supabase, and never seen by any other module — just this device's
// localStorage, per-browser.
//
// Uses the same useSyncExternalStore pattern as lib/store.tsx: reading
// localStorage must happen client-side only, and this avoids both a
// hydration mismatch and a "setState in an effect" lint error.

export type TriageMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

const STORAGE_KEY = "stryder-triage-chat-v1";

let current: TriageMessage[] | null = null;
let initialized = false;
const listeners = new Set<() => void>();

function loadFromStorage(): TriageMessage[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TriageMessage[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(messages: TriageMessage[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // Storage full or unavailable — conversation just won't persist.
  }
}

function ensureInitialized() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  current = loadFromStorage();
}

function notify() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): TriageMessage[] {
  ensureInitialized();
  return current ?? [];
}

function getServerSnapshot(): TriageMessage[] {
  return [];
}

export function setTriageMessages(messages: TriageMessage[]) {
  current = messages;
  saveToStorage(messages);
  notify();
}

export function useTriageMessages(): TriageMessage[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
