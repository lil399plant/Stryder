"use client";

import * as React from "react";
import type { Caregiver, IncidentEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ChoiceChips } from "@/components/ui/choice-chips";
import { INCIDENT_CATEGORY_OPTIONS, SEVERITY_OPTIONS } from "@/lib/options";
import { formatDateTimeLocal, fromDateTimeLocal } from "@/lib/time";

export type IncidentFormValues = Omit<IncidentEvent, "id" | "kind">;

interface IncidentFormProps {
  initial: IncidentFormValues;
  caregivers: { id: Caregiver; displayName: string }[];
  onSubmit: (values: IncidentFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
  submitLabel?: string;
}

export function IncidentForm({
  initial,
  caregivers,
  onSubmit,
  onCancel,
  onDelete,
  submitLabel = "Save",
}: IncidentFormProps) {
  const [values, setValues] = React.useState<IncidentFormValues>(initial);

  const set = <K extends keyof IncidentFormValues>(key: K, val: IncidentFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: val }));

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
    >
      <p className="rounded-xl bg-tan-soft/50 px-3.5 py-2.5 text-[12.5px] leading-snug text-tan-soft-foreground">
        For lightweight notes, not diagnoses. Stryder is a puppy — most things here are normal
        variation. Use the vet flag below only if you genuinely want to bring it up at a visit.
      </p>

      <div className="flex flex-col gap-1.5">
        <Label>When</Label>
        <Input
          type="datetime-local"
          value={formatDateTimeLocal(values.timestamp)}
          onChange={(e) => set("timestamp", fromDateTimeLocal(e.target.value))}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Category</Label>
        <ChoiceChips
          options={INCIDENT_CATEGORY_OPTIONS}
          value={values.category}
          onChange={(v) => set("category", v as IncidentFormValues["category"])}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Severity</Label>
        <ChoiceChips
          options={SEVERITY_OPTIONS}
          value={values.severity}
          onChange={(v) => set("severity", v as IncidentFormValues["severity"])}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Note</Label>
        <Textarea
          value={values.note}
          onChange={(e) => set("note", e.target.value)}
          rows={3}
          placeholder="What did you notice?"
        />
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-surface-raised px-3.5 py-3">
        <span className="text-[14px] font-medium">Discuss with vet</span>
        <Switch checked={values.discussWithVet} onCheckedChange={(v) => set("discussWithVet", v)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Who logged it</Label>
        <ChoiceChips
          options={caregivers.map((c) => ({ value: c.id, label: c.displayName }))}
          value={values.caregiver}
          onChange={(v) => set("caregiver", v as Caregiver)}
        />
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
          Delete entry
        </button>
      )}
    </form>
  );
}
