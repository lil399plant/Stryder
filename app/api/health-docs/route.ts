import { NextResponse } from "next/server";
import { getSupabase, ensureHealthDocsBucket, HEALTH_DOCS_BUCKET, HEALTH_DOCS_MAX_BYTES } from "@/lib/supabase";

// Uploads a single health document (vaccine cert, vet paperwork — a photo
// or PDF) to a public Supabase Storage bucket and hands back its public
// URL. The file's bytes never touch the app_data JSON blob — only this
// URL and a little metadata get stored there (see lib/types.ts
// VaccineRecord) — keeping that record small and every device's sync fast.

const ALLOWED_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/heic", "image/webp"]);

export async function POST(request: Request) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "not-configured" }, { status: 501 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "invalid-form" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing-file" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "empty-file" }, { status: 400 });
  }
  if (file.size > HEALTH_DOCS_MAX_BYTES) {
    return NextResponse.json({ error: "too-large" }, { status: 413 });
  }
  const fileType = file.type || "application/octet-stream";
  if (!ALLOWED_TYPES.has(fileType)) {
    return NextResponse.json({ error: "unsupported-type" }, { status: 415 });
  }

  try {
    await ensureHealthDocsBucket(supabase);
  } catch (err) {
    console.error("Health docs bucket setup failed", err);
    return NextResponse.json({ error: "bucket-setup-failed" }, { status: 502 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-100);
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

  try {
    const bytes = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(HEALTH_DOCS_BUCKET)
      .upload(path, bytes, { contentType: fileType, upsert: false });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from(HEALTH_DOCS_BUCKET).getPublicUrl(path);

    return NextResponse.json({
      fileUrl: publicUrlData.publicUrl,
      fileName: file.name,
      fileType,
      fileSize: file.size,
    });
  } catch (err) {
    console.error("Health doc upload failed", err);
    return NextResponse.json({ error: "upload-failed" }, { status: 502 });
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
