import { handleFileUpload } from "@/lib/file-upload";
import { GROWTH_PHOTOS_BUCKET, GROWTH_PHOTOS_MAX_BYTES } from "@/lib/supabase";

// Uploads a single growth photo to a public Supabase Storage bucket. See
// lib/file-upload.ts for the shared upload logic (also used by
// app/api/health-docs). Images only — no PDFs here.

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/heic", "image/webp"]);

export async function POST(request: Request) {
  return handleFileUpload(request, {
    bucket: GROWTH_PHOTOS_BUCKET,
    maxBytes: GROWTH_PHOTOS_MAX_BYTES,
    allowedTypes: ALLOWED_TYPES,
  });
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
