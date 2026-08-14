import "server-only";
import webpush from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Caregiver } from "./types";
import { getSupabase, PUSH_SUBSCRIPTIONS_TABLE } from "./supabase";

// Sends real push notifications (iOS/Android home-screen installs) to
// caregivers' subscribed devices. Two callers: app/api/push/notify (instant,
// "something notable just happened") and app/api/push/cron-nudges
// (periodic, "probably due" — see that route for how it's triggered, since
// Vercel's own Cron only runs once/day on the free plan).

export interface PushPayload {
  title: string;
  body: string;
  /** Path to open when the notification is tapped, e.g. "/today". */
  url?: string;
}

interface StoredSubscription {
  endpoint: string;
  caregiver: Caregiver;
  subscription: webpush.PushSubscription;
}

let vapidConfigured = false;

function ensureVapid(): boolean {
  if (vapidConfigured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
  return true;
}

export function isPushConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT
  );
}

async function loadSubscriptions(
  supabase: SupabaseClient,
  filter: { excludeCaregiver?: Caregiver; onlyCaregiver?: Caregiver }
): Promise<StoredSubscription[]> {
  let query = supabase.from(PUSH_SUBSCRIPTIONS_TABLE).select("endpoint, caregiver, subscription");
  if (filter.onlyCaregiver) query = query.eq("caregiver", filter.onlyCaregiver);
  else if (filter.excludeCaregiver) query = query.neq("caregiver", filter.excludeCaregiver);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as StoredSubscription[];
}

/**
 * Sends a push notification to the given caregiver(s)' subscribed devices.
 * Pass `excludeCaregiver` for "notify everyone except whoever just did this"
 * (instant notable-event pushes), or `onlyCaregiver` for a specific
 * recipient, or neither for "everyone" (scheduled nudges).
 *
 * Best-effort per-subscription: one device failing doesn't stop the others.
 * A 404/410 response means the push service has permanently discarded that
 * subscription (uninstalled, permission revoked, etc.) — those get deleted
 * so they stop being retried forever.
 */
export async function sendPush(
  payload: PushPayload,
  filter: { excludeCaregiver?: Caregiver; onlyCaregiver?: Caregiver } = {}
): Promise<{ sent: number; failed: number; skipped?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { sent: 0, failed: 0, skipped: "supabase-not-configured" };
  if (!ensureVapid()) return { sent: 0, failed: 0, skipped: "vapid-not-configured" };

  const subs = await loadSubscriptions(supabase, filter);
  if (subs.length === 0) return { sent: 0, failed: 0, skipped: "no-subscriptions" };

  const body = JSON.stringify(payload);
  const staleEndpoints: string[] = [];
  let sent = 0;
  let failed = 0;

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(s.subscription, body);
        sent++;
      } catch (err) {
        failed++;
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) staleEndpoints.push(s.endpoint);
        else console.error("Push send failed", s.endpoint, err);
      }
    })
  );

  if (staleEndpoints.length > 0) {
    await supabase.from(PUSH_SUBSCRIPTIONS_TABLE).delete().in("endpoint", staleEndpoints);
  }

  return { sent, failed };
}
