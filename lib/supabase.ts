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
