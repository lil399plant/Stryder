import "server-only";
import { NextResponse } from "next/server";
import { getSupabase, ensureBucket } from "./supabase";

// Shared body for the two public-bucket upload routes (app/api/health-docs
// and app/api/growth-photos) — same validation, same upload/public-URL
// flow, just a different bucket and allowed file types. The file's bytes
// never touch the app_data JSON blob — only the returned URL and a little
// metadata get stored there, keeping that record small and every device's
// sync fast.

export interface UploadResult {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export async function handleFileUpload(
  request: Request,
  opts: { bucket: string; maxBytes: number; allowedTypes: Set<string> }
): Promise<NextResponse> {
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
  if (file.size > opts.maxBytes) {
    return NextResponse.json({ error: "too-large" }, { status: 413 });
  }
  const fileType = file.type || "application/octet-stream";
  if (!opts.allowedTypes.has(fileType)) {
    return NextResponse.json({ error: "unsupported-type" }, { status: 415 });
  }

  try {
    await ensureBucket(supabase, opts.bucket, opts.maxBytes);
  } catch (err) {
    console.error(`Bucket setup failed (${opts.bucket})`, err);
    return NextResponse.json({ error: "bucket-setup-failed" }, { status: 502 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-100);
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

  try {
    const bytes = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(opts.bucket)
      .upload(path, bytes, { contentType: fileType, upsert: false });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from(opts.bucket).getPublicUrl(path);

    const result: UploadResult = { fileUrl: publicUrlData.publicUrl, fileName: file.name, fileType, fileSize: file.size };
    return NextResponse.json(result);
  } catch (err) {
    console.error(`Upload failed (${opts.bucket})`, err);
    return NextResponse.json({ error: "upload-failed" }, { status: 502 });
  }
}
