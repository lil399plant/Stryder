"use client";

import * as React from "react";
import { Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet } from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import type { VaccineRecord } from "@/lib/types";
import { formatDateShort } from "@/lib/time";
import { VaccineForm, type VaccineFormValues } from "./VaccineForm";

const STATUS_VARIANT: Record<VaccineRecord["status"], "forest" | "tan" | "concern"> = {
  complete: "forest",
  upcoming: "tan",
  overdue: "concern",
};

const EMPTY: VaccineFormValues = {
  name: "",
  dueDate: "",
  completedDate: "",
  vet: "",
  notes: "",
  status: "upcoming",
  isPlaceholder: true,
};

export function VaccineList() {
  const store = useStore();
  const { showToast } = useToast();
  const data = store.data;
  const [editing, setEditing] = React.useState<VaccineRecord | "add" | null>(null);

  if (!data) return null;

  const hasPlaceholders = data.vaccines.some((v) => v.isPlaceholder);

  return (
    <div className="flex flex-col gap-3">
      {hasPlaceholders && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-tan/30 bg-tan-soft px-3.5 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-tan-soft-foreground/70" />
          <p className="text-[12.5px] leading-snug text-tan-soft-foreground">
            Records marked <strong>Placeholder</strong> are estimates to replace with vet-confirmed
            dates — not medical advice.
          </p>
        </div>
      )}

      <Button variant="outline" className="gap-1.5 self-start" onClick={() => setEditing("add")}>
        <Plus className="h-4 w-4" />
        Add record
      </Button>

      {data.vaccines.length === 0 && (
        <p className="rounded-xl border border-dashed border-border-strong px-4 py-8 text-center text-[13px] text-muted-foreground">
          No vaccine or medication records yet.
        </p>
      )}

      {data.vaccines.map((v) => (
        <Card key={v.id} className="cursor-pointer" onClick={() => setEditing(v)}>
          <CardContent className="flex items-start justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="text-[14.5px] font-medium leading-tight">{v.name}</p>
              <p className="mt-1 text-[12.5px] text-muted-foreground">
                {v.status === "complete"
                  ? `Completed ${v.completedDate ? formatDateShort(v.completedDate) : "—"}`
                  : `Due ${v.dueDate ? formatDateShort(v.dueDate) : "—"}`}
                {v.vet ? ` · ${v.vet}` : ""}
              </p>
              {v.isPlaceholder && (
                <Badge variant="neutral" className="mt-1.5">
                  Placeholder
                </Badge>
              )}
            </div>
            <Badge variant={STATUS_VARIANT[v.status]} className="shrink-0 capitalize">
              {v.status}
            </Badge>
          </CardContent>
        </Card>
      ))}

      {editing && (
        <Sheet
          open
          onOpenChange={(o) => !o && setEditing(null)}
          title={editing === "add" ? "Add vaccine / medication" : "Edit record"}
        >
          <VaccineForm
            initial={editing === "add" ? EMPTY : editing}
            submitLabel={editing === "add" ? "Add record" : "Save"}
            onSubmit={(values) => {
              if (editing === "add") {
                store.addVaccine(values);
                showToast("Record added");
              } else {
                store.updateVaccine(editing.id, values);
                showToast("Record updated");
              }
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
            onDelete={
              editing !== "add"
                ? () => {
                    store.deleteVaccine(editing.id);
                    showToast("Record deleted");
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
