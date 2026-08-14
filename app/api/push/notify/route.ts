import { NextResponse } from "next/server";
import { sendPush } from "@/lib/push-server";
import type { Caregiver } from "@/lib/types";

// Instant "something notable just happened" push — called right after a
// caregiver logs an accident, updates the handoff note, or adds a special
// event (see the call sites in components/log/AddEntrySheet.tsx and
// components/today/HandoffCard.tsx). Notifies every OTHER caregiver's
// devices, never the one who triggered it.

export async function POST(request: Request) {
  let body: { fromCaregiver?: Caregiver; title?: string; body?: string; url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const { fromCaregiver, title, body: message, url } = body;
  if ((fromCaregiver !== "me" && fromCaregiver !== "ribo") || !title || !message) {
    return NextResponse.json({ error: "invalid-payload" }, { status: 400 });
  }

  try {
    const result = await sendPush({ title, body: message, url }, { excludeCaregiver: fromCaregiver });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Push notify failed", err);
    return NextResponse.json({ error: "send-failed" }, { status: 502 });
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
