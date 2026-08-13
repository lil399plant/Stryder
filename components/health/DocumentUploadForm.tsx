"use client";

import * as React from "react";
import { Upload, FileText, X } from "lucide-react";
import type { Caregiver, VaccineRecord } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChoiceChips } from "@/components/ui/choice-chips";

export type DocumentFormValues = Omit<VaccineRecord, "id">;

interface ExistingFile {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface DocumentUploadFormProps {
  initial: { name: string; caregiver: Caregiver; uploadedAt: string; file: ExistingFile | null };
  caregivers: { id: Caregiver; displayName: string }[];
  onSubmit: (values: DocumentFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
  submitLabel?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  "too-large": "That file is over the 15MB limit.",
  "unsupported-type": "Only PDF, JPEG, PNG, HEIC, or WEBP files are supported.",
  "missing-file": "Choose a file to upload.",
  "empty-file": "That file looks empty.",
  "not-configured": "Shared storage isn't set up for this deployment, so files can't be uploaded here.",
};

function humanFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentUploadForm({
  initial,
  caregivers,
  onSubmit,
  onCancel,
  onDelete,
  submitLabel = "Upload",
}: DocumentUploadFormProps) {
  const [name, setName] = React.useState(initial.name);
  const [caregiver, setCaregiver] = React.useState<Caregiver>(initial.caregiver);
  const [pendingFile, setPendingFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const existingFile = initial.file;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Give it a name — e.g. “Rabies certificate”.");
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
        const res = await fetch("/api/health-docs", { method: "POST", body: form });
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

    onSubmit({ name: name.trim(), caregiver, uploadedAt, ...fileMeta });
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label>Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Rabies certificate, vet invoice"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{existingFile ? "File" : "Upload a file"}</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/heic,image/webp"
          className="hidden"
          onChange={(e) => setPendingFile(e.target.files?.[0] ?? null)}
        />

        {pendingFile ? (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-border-strong bg-surface-raised px-3.5 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-[13.5px]">{pendingFile.name}</span>
              <span className="shrink-0 text-[11.5px] text-muted-foreground">
                {humanFileSize(pendingFile.size)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setPendingFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="shrink-0 text-muted-foreground hover:text-foreground"
              aria-label="Remove selected file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : existingFile ? (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-border-strong bg-surface-raised px-3.5 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-[13.5px]">{existingFile.fileName}</span>
              <span className="shrink-0 text-[11.5px] text-muted-foreground">
                {humanFileSize(existingFile.fileSize)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 text-[12.5px] font-medium text-forest"
            >
              Replace
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-border-strong px-4 py-6 text-muted-foreground hover:bg-surface-raised"
          >
            <Upload className="h-5 w-5" />
            <span className="text-[13px] font-medium">Tap to choose a file</span>
            <span className="text-[11.5px]">PDF, JPEG, PNG, HEIC, or WEBP — up to 15MB</span>
          </button>
        )}
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
        <button
          type="button"
          onClick={onDelete}
          className="self-center pb-1 text-[13px] font-medium text-concern"
        >
          Delete document
        </button>
      )}
    </form>
  );
}
