import { NextResponse } from "next/server";
import { getSupabase, SUPABASE_TABLE, SUPABASE_ROW_ID, NOTIFIED_NUDGES_TABLE } from "@/lib/supabase";
import { sendPush } from "@/lib/push-server";
import { computeNudges } from "@/lib/rules";
import type { AppData } from "@/lib/types";

// Scheduled "probably due" nudges (the same rules Today's NextNeedsCard
// shows in-app) — pushed proactively instead of only when someone happens
// to open the app. Nothing in this app runs on its own schedule, so this
// route needs something external hitting it on a timer. Vercel's own Cron
// only runs once/day on the free Hobby plan, so per .env.example this is
// meant to be called by a free service like https://cron-job.org every
// 15-30 minutes:
//   GET /api/push/cron-nudges?token=<CRON_SECRET>
//
// Dedup: a nudge only pushes once per "occurrence" — notified_nudges tracks
// which nudge ids are currently considered "already sent". Once a nudge
// stops being active (the underlying condition resolves, e.g. someone logs
// the potty trip), its row is cleared so the same nudge id can push again
// next time it comes up.

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "not-configured" }, { status: 501 });
  }

  const { data: row, error: readError } = await supabase
    .from(SUPABASE_TABLE)
    .select("data")
    .eq("id", SUPABASE_ROW_ID)
    .maybeSingle();
  if (readError) {
    console.error("cron-nudges: read failed", readError);
    return NextResponse.json({ error: "read-failed" }, { status: 502 });
  }
  const appData = row?.data as AppData | undefined;
  if (!appData) return NextResponse.json({ checked: 0, sent: 0 });

  const nudges = computeNudges(appData, new Date());
  const activeIds = new Set(nudges.map((n) => n.id));

  const { data: notifiedRows, error: notifiedError } = await supabase
    .from(NOTIFIED_NUDGES_TABLE)
    .select("id");
  if (notifiedError) {
    console.error("cron-nudges: notified-lookup failed", notifiedError);
    return NextResponse.json({ error: "read-failed" }, { status: 502 });
  }
  const alreadyNotified = new Set((notifiedRows ?? []).map((r) => r.id as string));

  // Resolved nudges (no longer active) can fire again next time they occur.
  const resolvedIds = [...alreadyNotified].filter((id) => !activeIds.has(id));
  if (resolvedIds.length > 0) {
    await supabase.from(NOTIFIED_NUDGES_TABLE).delete().in("id", resolvedIds);
  }

  const toSend = nudges.filter((n) => !alreadyNotified.has(n.id));
  let sent = 0;
  for (const nudge of toSend) {
    const result = await sendPush({ title: "Might be worth checking on Stryder", body: nudge.text, url: "/today" });
    sent += result.sent;
    await supabase.from(NOTIFIED_NUDGES_TABLE).upsert({ id: nudge.id, notified_at: new Date().toISOString() });
  }

  return NextResponse.json({ checked: nudges.length, newlyActive: toSend.length, sent });
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
