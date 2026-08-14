import { NextResponse } from "next/server";
import { getSupabase, PUSH_SUBSCRIPTIONS_TABLE } from "@/lib/supabase";
import type { Caregiver } from "@/lib/types";

// Saves (or refreshes) this device's push subscription, tagged with which
// caregiver it belongs to (see lib/device-identity.ts) — server-side only,
// same service-role pattern as app/api/data/route.ts.

export async function POST(request: Request) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "not-configured" }, { status: 501 });
  }

  let body: { caregiver?: Caregiver; subscription?: { endpoint?: string } };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const { caregiver, subscription } = body;
  if ((caregiver !== "me" && caregiver !== "ribo") || !subscription?.endpoint) {
    return NextResponse.json({ error: "invalid-payload" }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from(PUSH_SUBSCRIPTIONS_TABLE)
      .upsert({ endpoint: subscription.endpoint, caregiver, subscription }, { onConflict: "endpoint" });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Push subscribe save failed", err);
    return NextResponse.json({ error: "save-failed" }, { status: 502 });
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
