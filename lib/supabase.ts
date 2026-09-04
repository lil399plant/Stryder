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

// A rolling log of past app_data snapshots — see .env.example for the
// one-time SQL to create it. app_data itself is a single row that every
// save upserts over, so it has no history of its own; this table is the
// disaster-recovery backstop (an incident prompted this — see AboutSection
// and lib/store.tsx's looksLikeDataLoss). app/api/data/route.ts inserts one
// row here on every successful save and prunes anything older than
// APP_DATA_HISTORY_RETENTION_DAYS. Best-effort: a failure writing here
// never fails the save itself.
export const APP_DATA_HISTORY_TABLE = "app_data_history";
export const APP_DATA_HISTORY_RETENTION_DAYS = 90;

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

// Growth photos (More > Photos) — same public-bucket trust model as
// health documents above, just images instead of documents/PDFs.
export const GROWTH_PHOTOS_BUCKET = "growth-photos";
export const GROWTH_PHOTOS_MAX_BYTES = 15 * 1024 * 1024; // 15MB

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

const bucketReady = new Map<string, Promise<boolean>>();

/** Creates a public storage bucket the first time it's needed, so there's
 * no manual "run this in the Supabase dashboard" setup step (unlike the
 * app_data table, which does need a one-time SQL step — see .env.example).
 * Idempotent and cached per server instance per bucket name. */
export function ensureBucket(supabase: SupabaseClient, bucket: string, maxBytes: number): Promise<boolean> {
  const cached = bucketReady.get(bucket);
  if (cached) return cached;

  const promise = (async () => {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      bucketReady.delete(bucket);
      throw listError;
    }
    if (buckets?.some((b) => b.name === bucket)) return true;

    const { error: createError } = await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: maxBytes,
    });
    // Another request may have created it in the meantime — that's fine.
    if (createError && !/already exists/i.test(createError.message)) {
      bucketReady.delete(bucket);
      throw createError;
    }
    return true;
  })();

  bucketReady.set(bucket, promise);
  return promise;
}
