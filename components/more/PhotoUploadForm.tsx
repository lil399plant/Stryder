"use client";

import * as React from "react";
import { Upload, X } from "lucide-react";
import type { Caregiver, GrowthPhoto } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChoiceChips } from "@/components/ui/choice-chips";

export type PhotoFormValues = Omit<GrowthPhoto, "id">;

interface ExistingFile {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface PhotoUploadFormProps {
  initial: { date: string; caption: string; caregiver: Caregiver; uploadedAt: string; file: ExistingFile | null };
  caregivers: { id: Caregiver; displayName: string }[];
  onSubmit: (values: PhotoFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
  submitLabel?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  "too-large": "That photo is over the 15MB limit.",
  "unsupported-type": "Only JPEG, PNG, HEIC, or WEBP photos are supported.",
  "missing-file": "Choose a photo to upload.",
  "empty-file": "That file looks empty.",
  "not-configured": "Shared storage isn't set up for this deployment, so photos can't be uploaded here.",
};

export function PhotoUploadForm({
  initial,
  caregivers,
  onSubmit,
  onCancel,
  onDelete,
  submitLabel = "Upload",
}: PhotoUploadFormProps) {
  const [date, setDate] = React.useState(initial.date);
  const [caption, setCaption] = React.useState(initial.caption);
  const [caregiver, setCaregiver] = React.useState<Caregiver>(initial.caregiver);
  const [pendingFile, setPendingFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const existingFile = initial.file;

  // Local preview of a newly-picked file, before it's actually uploaded.
  const previewUrl = React.useMemo(() => (pendingFile ? URL.createObjectURL(pendingFile) : null), [pendingFile]);
  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const displayUrl = previewUrl ?? existingFile?.fileUrl ?? null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date) {
      setError("Pick a date for this photo.");
      return;
    }
    if (!pendingFile && !existingFile) {
      setError(ERROR_MESSAGES["missing-file"]);
      return;
    }

    let fileMeta: ExistingFile | null = existingFile;
    let uploadedAt = initial.uploadedAt;

    if (pendingFile) {
      setUploading(true);
      try {
        const form = new FormData();
        form.append("file", pendingFile);
        const res = await fetch("/api/growth-photos", { method: "POST", body: form });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "upload-failed");
        fileMeta = { fileUrl: json.fileUrl, fileName: json.fileName, fileType: json.fileType, fileSize: json.fileSize };
        uploadedAt = new Date().toISOString();
      } catch (err) {
        const code = err instanceof Error ? err.message : "upload-failed";
        setError(ERROR_MESSAGES[code] ?? "Upload failed — try again.");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    if (!fileMeta) {
      setError(ERROR_MESSAGES["missing-file"]);
      return;
    }

    onSubmit({ date, caption: caption.trim() || undefined, caregiver, uploadedAt, ...fileMeta });
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/heic,image/webp"
        className="hidden"
        onChange={(e) => setPendingFile(e.target.files?.[0] ?? null)}
      />

      {displayUrl ? (
        <div className="relative overflow-hidden rounded-2xl border border-border-strong bg-background">
          {/* Uploaded photos vary wildly in aspect ratio — object-contain on
           * a capped-height box keeps the preview from either cropping
           * important content or blowing out the sheet's layout. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- object URLs and arbitrary external Supabase URLs, not a static app asset */}
          <img src={displayUrl} alt="" className="max-h-72 w-full object-contain" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-2 right-2 rounded-full bg-background/90 px-3 py-1.5 text-[12.5px] font-medium text-foreground shadow-sm hover:bg-background"
          >
            Replace
          </button>
          {pendingFile && (
            <button
              type="button"
              onClick={() => {
                setPendingFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 text-foreground shadow-sm hover:bg-background"
              aria-label="Remove selected photo"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-1.5 rounded-2xl border border-dashed border-border-strong px-4 py-8 text-muted-foreground hover:bg-surface-raised"
        >
          <Upload className="h-5 w-5" />
          <span className="text-[13px] font-medium">Tap to choose a photo</span>
          <span className="text-[11.5px]">JPEG, PNG, HEIC, or WEBP — up to 15MB</span>
        </button>
      )}

      <div className="flex flex-col gap-1.5">
        <Label>Date</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Caption (optional)</Label>
        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="e.g. 12 weeks old, first time at the park"
          rows={2}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Who uploaded it</Label>
        <ChoiceChips
          options={caregivers.map((c) => ({ value: c.id, label: c.displayName }))}
          value={caregiver}
          onChange={(v) => setCaregiver(v as Caregiver)}
        />
      </div>

      {error && <p className="text-[12.5px] text-concern">{error}</p>}

      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" className="flex-1" disabled={uploading}>
          {uploading ? "Uploading…" : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={uploading}>
          Cancel
        </Button>
      </div>
      {onDelete && (
        <button type="button" onClick={onDelete} className="self-center pb-1 text-[13px] font-medium text-concern">
          Delete photo
        </button>
      )}
    </form>
  );
}
