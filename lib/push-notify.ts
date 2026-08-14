"use client";

import type { Caregiver } from "./types";

/** Fire-and-forget: tells the server to push a notification to every
 * caregiver except `from`. Never throws — a failed/unconfigured push
 * shouldn't block or error out whatever the user was actually doing (logging
 * an accident, saving a handoff note, etc.). Silently does nothing if this
 * device hasn't been told which caregiver it is (see lib/device-identity.ts)
 * — there's no one sensible to attribute the notification to otherwise. */
export function notifyOtherCaregiver(from: Caregiver | null, title: string, body: string, url?: string): void {
  if (!from) return;
  fetch("/api/push/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fromCaregiver: from, title, body, url }),
  }).catch(() => {
    // Best-effort — see doc comment above.
  });
}
