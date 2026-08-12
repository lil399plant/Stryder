"use client";

import * as React from "react";
import type { VaccineRecord } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ChoiceChips } from "@/components/ui/choice-chips";

export type VaccineFormValues = Omit<VaccineRecord, "id">;

interface VaccineFormProps {
  initial: VaccineFormValues;
  onSubmit: (values: VaccineFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
  submitLabel?: string;
}

const STATUS_OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "complete", label: "Complete" },
  { value: "overdue", label: "Overdue" },
];

export function VaccineForm({ initial, onSubmit, onCancel, onDelete, submitLabel = "Save" }: VaccineFormProps) {
  const [values, setValues] = React.useState<VaccineFormValues>(initial);
  const set = <K extends keyof VaccineFormValues>(key: K, val: VaccineFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: val }));

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
    >
      <div className="flex flex-col gap-1.5">
        <Label>Vaccine / medication name</Label>
        <Input value={values.name} onChange={(e) => set("name", e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Due date</Label>
          <Input type="date" value={values.dueDate ?? ""} onChange={(e) => set("dueDate", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Completed date</Label>
          <Input
            type="date"
            value={values.completedDate ?? ""}
            onChange={(e) => set("completedDate", e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Status</Label>
        <ChoiceChips
          options={STATUS_OPTIONS}
          value={values.status}
          onChange={(v) => set("status", v as VaccineFormValues["status"])}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Veterinarian</Label>
        <Input value={values.vet ?? ""} onChange={(e) => set("vet", e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Notes</Label>
        <Textarea value={values.notes ?? ""} onChange={(e) => set("notes", e.target.value)} rows={2} />
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-surface-raised px-3.5 py-3">
        <div>
          <p className="text-[14px] font-medium">Placeholder record</p>
          <p className="text-[11.5px] text-muted-foreground">Flag until this is confirmed with your vet.</p>
        </div>
        <Switch checked={values.isPlaceholder} onCheckedChange={(v) => set("isPlaceholder", v)} />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" className="flex-1">
          {submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="self-center pb-1 text-[13px] font-medium text-concern"
        >
          Delete record
        </button>
      )}
    </form>
  );
}
