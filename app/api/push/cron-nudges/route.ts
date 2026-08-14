import { NextResponse } from "next/server";
import { getSupabase, SUPABASE_TABLE, SUPABASE_ROW_ID, NOTIFIED_NUDGES_TABLE } from "@/lib/supabase";
import { sendPush } from "@/lib/push-server";
import { computeNudges } from "@/lib/rules";
import { SPECIAL_EVENT_CATEGORY_LABEL } from "@/lib/timeline";
import { formatClock } from "@/lib/time";
import type { AppData } from "@/lib/types";

// Two independent kinds of scheduled push, both driven by the same
// external timer hitting this one route (Vercel's own Cron only runs
// once/day on the free Hobby plan, so per .env.example this is meant to be
// called by a free service like https://cron-job.org every 15-30 minutes,
// or every 1 minute for tighter timing):
//   GET /api/push/cron-nudges?token=<CRON_SECRET>
//
// 1. Rule-based "probably due" nudges (the same rules Today's NextNeedsCard
//    shows in-app) — sent only to whoever's currently on duty, since
//    they're the one who can act on it. Dedup: a nudge id stays marked
//    "already sent" in notified_nudges until the underlying condition
//    resolves (e.g. someone logs the potty trip), then it's cleared so the
//    same id can fire again next time it comes up.
//
// 2. Upcoming-event reminders — any SpecialEvent (lib/types.ts) whose
//    startTime is 2 hours or less away gets a one-time push to BOTH
//    caregivers, regardless of who's on duty. Unlike the rule-based
//    nudges, these are keyed to a specific event (id `event-reminder:
//    <event id>`) and never need to "resolve and re-fire" — once sent,
//    sent for good — so they're excluded from the resolved-nudge cleanup
//    below, and cleaned up separately once the event itself has passed.

const EVENT_REMINDER_PREFIX = "event-reminder:";
const EVENT_REMINDER_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 hours

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
  if (!appData) return NextResponse.json({ nudges: { checked: 0, sent: 0 }, eventReminders: { checked: 0, sent: 0 } });

  const now = new Date();

  const { data: notifiedRows, error: notifiedError } = await supabase
    .from(NOTIFIED_NUDGES_TABLE)
    .select("id");
  if (notifiedError) {
    console.error("cron-nudges: notified-lookup failed", notifiedError);
    return NextResponse.json({ error: "read-failed" }, { status: 502 });
  }
  const alreadyNotified = new Set((notifiedRows ?? []).map((r) => r.id as string));

  // ---- 1. Rule-based nudges — on-duty caregiver only ----

  const nudges = computeNudges(appData, now);
  const activeNudgeIds = new Set(nudges.map((n) => n.id));

  // Resolved nudges (no longer active) can fire again next time they occur.
  // Only touches non-event-reminder rows — those are handled separately.
  const resolvedNudgeIds = [...alreadyNotified].filter(
    (id) => !id.startsWith(EVENT_REMINDER_PREFIX) && !activeNudgeIds.has(id)
  );
  if (resolvedNudgeIds.length > 0) {
    await supabase.from(NOTIFIED_NUDGES_TABLE).delete().in("id", resolvedNudgeIds);
  }

  const nudgesToSend = nudges.filter((n) => !alreadyNotified.has(n.id));
  let nudgesSent = 0;
  for (const nudge of nudgesToSend) {
    const result = await sendPush(
      { title: "Might be worth checking on Stryder", body: nudge.text, url: "/today" },
      { onlyCaregiver: appData.handoff.onDuty }
    );
    nudgesSent += result.sent;
    await supabase.from(NOTIFIED_NUDGES_TABLE).upsert({ id: nudge.id, notified_at: new Date().toISOString() });
  }

  // ---- 2. Upcoming-event reminders — both caregivers ----

  const dueEvents = appData.events.filter((e) => {
    const msUntilStart = new Date(e.startTime).getTime() - now.getTime();
    return msUntilStart > 0 && msUntilStart <= EVENT_REMINDER_WINDOW_MS;
  });

  let eventRemindersSent = 0;
  for (const event of dueEvents) {
    const id = `${EVENT_REMINDER_PREFIX}${event.id}`;
    if (alreadyNotified.has(id)) continue;
    const category = SPECIAL_EVENT_CATEGORY_LABEL[event.category];
    const label = event.title ? `${event.title} (${category})` : category;
    const result = await sendPush({
      title: "Upcoming event in ~2 hours",
      body: `${label} at ${formatClock(event.startTime)}.`,
      url: "/log",
    });
    eventRemindersSent += result.sent;
    await supabase.from(NOTIFIED_NUDGES_TABLE).upsert({ id, notified_at: new Date().toISOString() });
  }

  // Tidy up: once a reminded event's start time has passed, its row will
  // never be needed again (a given event id can't recur) — clear it so
  // this table doesn't grow forever over the puppy's lifetime.
  const pastEventReminderIds = [...alreadyNotified]
    .filter((id) => id.startsWith(EVENT_REMINDER_PREFIX))
    .filter((id) => {
      const eventId = id.slice(EVENT_REMINDER_PREFIX.length);
      const event = appData.events.find((e) => e.id === eventId);
      return !event || new Date(event.startTime).getTime() <= now.getTime();
    });
  if (pastEventReminderIds.length > 0) {
    await supabase.from(NOTIFIED_NUDGES_TABLE).delete().in("id", pastEventReminderIds);
  }

  return NextResponse.json({
    nudges: { checked: nudges.length, newlyActive: nudgesToSend.length, sent: nudgesSent },
    eventReminders: { checked: dueEvents.length, sent: eventRemindersSent },
  });
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
