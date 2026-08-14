import { handleFileUpload } from "@/lib/file-upload";
import { HEALTH_DOCS_BUCKET, HEALTH_DOCS_MAX_BYTES } from "@/lib/supabase";

// Uploads a single health document (vaccine cert, vet paperwork — a photo
// or PDF) to a public Supabase Storage bucket. See lib/file-upload.ts for
// the shared upload logic (also used by app/api/growth-photos).

const ALLOWED_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/heic", "image/webp"]);

export async function POST(request: Request) {
  return handleFileUpload(request, { bucket: HEALTH_DOCS_BUCKET, maxBytes: HEALTH_DOCS_MAX_BYTES, allowedTypes: ALLOWED_TYPES });
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
