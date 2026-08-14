"use client";

import type { Caregiver } from "./types";

// Client-side half of push notifications. See public/sw.js (what runs when
// a push arrives) and lib/push-server.ts (what sends them). iOS specifics
// that shape this file: Safari only allows subscribing from an installed
// (Add to Home Screen) PWA, requires iOS 16.4+, and the permission prompt
// must be triggered by a real tap — never on page load.

export type PushSupportState = "unsupported" | "supported";

export function getPushSupport(): PushSupportState {
  if (typeof window === "undefined") return "unsupported";
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return "unsupported";
  }
  return "supported";
}

function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
}

export function isRunningStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

/** iOS Safari exposes the Push API even in a plain browser tab, but
 * `subscribe()` only actually works once the site's been Added to Home
 * Screen and is running as its own standalone app. Desktop/Android browsers
 * don't have this restriction — a regular tab there can subscribe fine. */
export function needsHomeScreenInstall(): boolean {
  return isIOS() && !isRunningStandalone();
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64Safe);
  return new Uint8Array([...raw].map((c) => c.charCodeAt(0)));
}

export type SubscribeResult =
  | { ok: true }
  | { ok: false; reason: "unsupported" | "not-installed" | "permission-denied" | "no-vapid-key" | "request-failed" };

/** Registers the service worker (idempotent), asks for notification
 * permission if needed, subscribes via PushManager, and saves the
 * subscription server-side under the given caregiver. Must be called from
 * a user gesture (e.g. a button's onClick) — iOS Safari silently ignores
 * permission requests that aren't. */
export async function subscribeToPush(caregiver: Caregiver): Promise<SubscribeResult> {
  if (getPushSupport() === "unsupported") return { ok: false, reason: "unsupported" };
  if (needsHomeScreenInstall()) return { ok: false, reason: "not-installed" };

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) return { ok: false, reason: "no-vapid-key" };

  const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, reason: "permission-denied" };

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
    }

    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caregiver, subscription: subscription.toJSON() }),
    });
    if (!res.ok) return { ok: false, reason: "request-failed" };
    return { ok: true };
  } catch (err) {
    console.error("Push subscribe failed", err);
    return { ok: false, reason: "request-failed" };
  }
}

/** True if this device already has an active push subscription (doesn't
 * check whether the server-side record still matches — good enough for
 * showing "already enabled" in the UI). */
export async function isSubscribed(): Promise<boolean> {
  if (getPushSupport() === "unsupported") return false;
  const registration = await navigator.serviceWorker.getRegistration("/sw.js");
  if (!registration) return false;
  const subscription = await registration.pushManager.getSubscription();
  return subscription !== null;
}

export async function unsubscribeFromPush(): Promise<void> {
  if (getPushSupport() === "unsupported") return;
  const registration = await navigator.serviceWorker.getRegistration("/sw.js");
  if (!registration) return;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;
  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  await fetch("/api/push/unsubscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint }),
  }).catch(() => {
    // Best-effort — the local unsubscribe already succeeded.
  });
}
