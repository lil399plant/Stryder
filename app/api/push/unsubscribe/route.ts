import { NextResponse } from "next/server";
import { getSupabase, PUSH_SUBSCRIPTIONS_TABLE } from "@/lib/supabase";

export async function POST(request: Request) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "not-configured" }, { status: 501 });
  }

  let body: { endpoint?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  if (!body.endpoint) {
    return NextResponse.json({ error: "invalid-payload" }, { status: 400 });
  }

  try {
    const { error } = await supabase.from(PUSH_SUBSCRIPTIONS_TABLE).delete().eq("endpoint", body.endpoint);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Push unsubscribe failed", err);
    return NextResponse.json({ error: "delete-failed" }, { status: 502 });
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
