"use client";

import * as React from "react";
import { Plus, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet } from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import type { GrowthPhoto } from "@/lib/types";
import { formatDateShort } from "@/lib/time";
import { PhotoUploadForm, type PhotoFormValues } from "./PhotoUploadForm";

export function GrowthPhotosSection() {
  const store = useStore();
  const { showToast } = useToast();
  const data = store.data;
  const [editing, setEditing] = React.useState<GrowthPhoto | "add" | null>(null);

  if (!data) return null;

  const caregivers = data.caregivers;
  // Newest first, same convention as everywhere else in the app; `date` is
  // the point-in-time the photo represents (what the timeline is sorted
  // by), `uploadedAt` breaks ties for same-day uploads.
  const photos = [...data.photos].sort((a, b) => {
    const byDate = b.date.localeCompare(a.date);
    return byDate !== 0 ? byDate : b.uploadedAt.localeCompare(a.uploadedAt);
  });

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 pb-2">
        <Camera className="h-4 w-4 text-muted-foreground" />
        <CardTitle>Photos</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        <p className="text-[12.5px] leading-snug text-muted-foreground">
          A dated photo timeline to watch him grow. Anyone with this app&apos;s link can view or
          download what&apos;s uploaded here.
        </p>

        <Button variant="outline" className="gap-1.5 self-start" onClick={() => setEditing("add")}>
          <Plus className="h-4 w-4" />
          Add photo
        </Button>

        {photos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border-strong px-4 py-8 text-center text-[13px] text-muted-foreground">
            No photos uploaded yet.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setEditing(p)}
                className="group flex flex-col gap-1 text-left"
              >
                <div className="aspect-square overflow-hidden rounded-xl border border-border-strong bg-background">
                  {/* eslint-disable-next-line @next/next/no-img-element -- external Supabase Storage URLs, not a static app asset */}
                  <img
                    src={p.fileUrl}
                    alt={p.caption || `Photo from ${formatDateShort(p.date)}`}
                    className="h-full w-full object-cover transition-opacity group-hover:opacity-80"
                    loading="lazy"
                  />
                </div>
                <p className="truncate text-[11px] font-medium text-muted-foreground">{formatDateShort(p.date)}</p>
              </button>
            ))}
          </div>
        )}
      </CardContent>

      {editing && (
        <Sheet open onOpenChange={(o) => !o && setEditing(null)} title={editing === "add" ? "Add a photo" : "Edit photo"}>
          <PhotoUploadForm
            initial={
              editing === "add"
                ? {
                    date: new Date().toISOString().slice(0, 10),
                    caption: "",
                    caregiver: data.handoff.onDuty,
                    uploadedAt: new Date().toISOString(),
                    file: null,
                  }
                : {
                    date: editing.date,
                    caption: editing.caption ?? "",
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
            onSubmit={(values: PhotoFormValues) => {
              if (editing === "add") {
                store.addPhoto(values);
                showToast("Photo added");
              } else {
                store.updatePhoto(editing.id, values);
                showToast("Photo updated");
              }
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
            onDelete={
              editing !== "add"
                ? () => {
                    store.deletePhoto(editing.id);
                    showToast("Photo deleted");
                    setEditing(null);
                  }
                : undefined
            }
          />
        </Sheet>
      )}
    </Card>
  );
}
