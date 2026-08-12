import "server-only";
import { Redis } from "@upstash/redis";

// Shared-household storage: there's no auth in this version, so the whole
// app's data lives under one fixed key. If Upstash isn't configured (local
// dev without env vars, or someone hasn't linked storage yet), every
// function here just returns null/no-ops — the client falls back to
// localStorage-only behavior, so the app still works without Redis.

export const REDIS_DATA_KEY = "stryder:data";

let client: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (client !== undefined) return client;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  client = url && token ? new Redis({ url, token }) : null;
  return client;
}

export function isRedisConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}
