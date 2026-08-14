import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Shared-household storage: there's no auth in this version, so the whole
// app's data lives under one fixed row. If Supabase isn't configured (local
// dev without env vars, or someone hasn't linked storage yet), every
// function here just returns null/no-ops — the client falls back to
// localStorage-only behavior, so the app still works without it.
//
// Uses the service-role key, which bypasses Row Level Security — safe here
// because this client is only ever imported by the server-only route in
// app/api/data/route.ts and never reaches the browser bundle.

export const SUPABASE_TABLE = "app_data";
export const SUPABASE_ROW_ID = "stryder";

// Push notification plumbing — see .env.example for the one-time SQL to
// create these two tables. Deliberately NOT part of the app_data JSON blob:
// subscriptions and notification dedup state are per-device infrastructure,
// not data a caregiver logged, and keeping them separate avoids any risk of
// the whole-record-overwrite behavior (see AboutSection) losing them.
export const PUSH_SUBSCRIPTIONS_TABLE = "push_subscriptions";
export const NOTIFIED_NUDGES_TABLE = "notified_nudges";

// Health documents (vaccine certs, vet paperwork) get uploaded here as
// actual files rather than typed-in records. The bucket is public — same
// trust model as the rest of the app (no login; anyone with a link can
// view it) — so a stored file's public URL works for anyone, indefinitely,
// with no signing/expiry to manage.
export const HEALTH_DOCS_BUCKET = "health-documents";
export const HEALTH_DOCS_MAX_BYTES = 15 * 1024 * 1024; // 15MB

let client: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return client;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

let bucketReady: Promise<boolean> | null = null;

/** Creates the health-documents bucket the first time it's needed, so
 * there's no manual "run this in the Supabase dashboard" setup step (unlike
 * the app_data table, which does need a one-time SQL step — see
 * .env.example). Idempotent and cached per server instance. */
export function ensureHealthDocsBucket(supabase: SupabaseClient): Promise<boolean> {
  if (bucketReady) return bucketReady;
  bucketReady = (async () => {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      bucketReady = null;
      throw listError;
    }
    if (buckets?.some((b) => b.name === HEALTH_DOCS_BUCKET)) return true;

    const { error: createError } = await supabase.storage.createBucket(HEALTH_DOCS_BUCKET, {
      public: true,
      fileSizeLimit: HEALTH_DOCS_MAX_BYTES,
    });
    // Another request may have created it in the meantime — that's fine.
    if (createError && !/already exists/i.test(createError.message)) {
      bucketReady = null;
      throw createError;
    }
    return true;
  })();
  return bucketReady;
}
