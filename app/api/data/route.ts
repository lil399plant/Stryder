import { NextResponse } from "next/server";
import {
  getSupabase,
  SUPABASE_TABLE,
  SUPABASE_ROW_ID,
  APP_DATA_HISTORY_TABLE,
  APP_DATA_HISTORY_RETENTION_DAYS,
} from "@/lib/supabase";
import type { AppData } from "@/lib/types";

// Single shared-household record — see lib/supabase.ts. Every write
// replaces the whole blob (same shape the client keeps in localStorage),
// which keeps this endpoint trivial: GET returns whatever's stored, PUT
// upserts it.

export async function GET() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ configured: false, data: null });
  }
  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE)
      .select("data")
      .eq("id", SUPABASE_ROW_ID)
      .maybeSingle();
    if (error) throw error;
    return NextResponse.json({ configured: true, data: (data?.data as AppData) ?? null });
  } catch (err) {
    console.error("Supabase read failed", err);
    return NextResponse.json({ configured: true, data: null, error: "read-failed" }, { status: 502 });
  }
}

export async function PUT(request: Request) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ configured: false, saved: false });
  }
  let body: AppData;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || body.version !== 1) {
    return NextResponse.json({ error: "invalid-payload" }, { status: 400 });
  }
  try {
    const { error } = await supabase
      .from(SUPABASE_TABLE)
      .upsert({ id: SUPABASE_ROW_ID, data: body, updated_at: new Date().toISOString() });
    if (error) throw error;
    void snapshotHistory(body); // best-effort, doesn't block or fail the save
    return NextResponse.json({ configured: true, saved: true });
  } catch (err) {
    console.error("Supabase write failed", err);
    return NextResponse.json({ configured: true, saved: false, error: "write-failed" }, { status: 502 });
  }
}

/** Appends a snapshot to app_data_history and prunes anything older than
 * the retention window — see lib/supabase.ts. Swallows its own errors (most
 * likely: the table hasn't been created yet, see .env.example) so a
 * disaster-recovery backstop failing never takes the actual save down with
 * it. */
async function snapshotHistory(data: AppData) {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    const { error: insertError } = await supabase.from(APP_DATA_HISTORY_TABLE).insert({ data });
    if (insertError) throw insertError;
    const cutoff = new Date(Date.now() - APP_DATA_HISTORY_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const { error: pruneError } = await supabase.from(APP_DATA_HISTORY_TABLE).delete().lt("created_at", cutoff);
    if (pruneError) throw pruneError;
  } catch (err) {
    console.error("app_data_history snapshot failed", err);
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
