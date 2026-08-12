import { NextResponse } from "next/server";
import { getRedis, REDIS_DATA_KEY } from "@/lib/redis";
import type { AppData } from "@/lib/types";

// Single shared-household record — see lib/redis.ts. Every write replaces
// the whole blob (same shape the client keeps in localStorage), which
// keeps this endpoint trivial: GET returns whatever's stored, PUT
// overwrites it.

export async function GET() {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ configured: false, data: null });
  }
  try {
    const data = await redis.get<AppData>(REDIS_DATA_KEY);
    return NextResponse.json({ configured: true, data: data ?? null });
  } catch (err) {
    console.error("Redis GET failed", err);
    return NextResponse.json({ configured: true, data: null, error: "read-failed" }, { status: 502 });
  }
}

export async function PUT(request: Request) {
  const redis = getRedis();
  if (!redis) {
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
    await redis.set(REDIS_DATA_KEY, body);
    return NextResponse.json({ configured: true, saved: true });
  } catch (err) {
    console.error("Redis PUT failed", err);
    return NextResponse.json({ configured: true, saved: false, error: "write-failed" }, { status: 502 });
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
