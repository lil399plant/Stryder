"use client";

import * as React from "react";
import { Plus, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet } from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import type { Caregiver, VaccineRecord } from "@/lib/types";
import { formatDateTimeShort } from "@/lib/time";
import { caregiverName as caregiverNameFor } from "@/lib/rules";
import { DocumentUploadForm, type DocumentFormValues } from "./DocumentUploadForm";

function humanFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function VaccineList() {
  const store = useStore();
  const { showToast } = useToast();
  const data = store.data;
  const [editing, setEditing] = React.useState<VaccineRecord | "add" | null>(null);

  if (!data) return null;

  const caregivers = data.caregivers;
  const caregiverName = (id: Caregiver) => caregiverNameFor(data, id);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[12.5px] leading-snug text-muted-foreground">
        Upload the actual paperwork — a photo or PDF of a vaccine certificate, vet invoice, etc.
        Anyone with this app&apos;s link can view or download what&apos;s uploaded here.
      </p>

      <Button variant="outline" className="gap-1.5 self-start" onClick={() => setEditing("add")}>
        <Plus className="h-4 w-4" />
        Upload document
      </Button>

      {data.vaccines.length === 0 && (
        <p className="rounded-xl border border-dashed border-border-strong px-4 py-8 text-center text-[13px] text-muted-foreground">
          No documents uploaded yet.
        </p>
      )}

      {data.vaccines.map((v) => (
        <Card key={v.id}>
          <CardContent className="flex items-start justify-between gap-3 p-4">
            <div className="flex min-w-0 items-start gap-2.5 cursor-pointer" onClick={() => setEditing(v)}>
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="truncate text-[14.5px] font-medium leading-tight">{v.name}</p>
                <p className="mt-1 text-[12.5px] text-muted-foreground">
                  {humanFileSize(v.fileSize)} · Uploaded {formatDateTimeShort(v.uploadedAt)} · {caregiverName(v.caregiver)}
                </p>
              </div>
            </div>
            <a
              href={v.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={v.fileName}
              onClick={(e) => e.stopPropagation()}
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border-strong px-3 py-2 text-[12.5px] font-medium hover:bg-surface-raised"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
          </CardContent>
        </Card>
      ))}

      {editing && (
        <Sheet
          open
          onOpenChange={(o) => !o && setEditing(null)}
          title={editing === "add" ? "Upload a document" : "Edit document"}
        >
          <DocumentUploadForm
            initial={
              editing === "add"
                ? { name: "", caregiver: data.handoff.onDuty, uploadedAt: new Date().toISOString(), file: null }
                : {
                    name: editing.name,
                    caregiver: editing.caregiver,
                    uploadedAt: editing.uploadedAt,
                    file: {
                      fileUrl: editing.fileUrl,
                      fileName: editing.fileName,
                      fileType: editing.fileType,
                      fileSize: editing.fileSize,
                    },
                  }
            }
            caregivers={caregivers}
            submitLabel={editing === "add" ? "Upload" : "Save"}
            onSubmit={(values: DocumentFormValues) => {
              if (editing === "add") {
                store.addVaccine(values);
                showToast("Document uploaded");
              } else {
                store.updateVaccine(editing.id, values);
                showToast("Document updated");
              }
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
            onDelete={
              editing !== "add"
                ? () => {
                    store.deleteVaccine(editing.id);
                    showToast("Document deleted");
                    setEditing(null);
                  }
                : undefined
            }
          />
        </Sheet>
      )}
    </div>
  );
}
