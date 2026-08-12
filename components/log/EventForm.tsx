"use client";

import * as React from "react";
import type { Caregiver, SpecialEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChoiceChips } from "@/components/ui/choice-chips";
import { SPECIAL_EVENT_CATEGORY_OPTIONS } from "@/lib/options";
import { formatDateTimeLocal, fromDateTimeLocal } from "@/lib/time";

export type EventFormValues = Omit<SpecialEvent, "id" | "kind">;

interface EventFormProps {
  initial: EventFormValues;
  caregivers: { id: Caregiver; displayName: string }[];
  onSubmit: (values: EventFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
  submitLabel?: string;
}

export function EventForm({
  initial,
  caregivers,
  onSubmit,
  onCancel,
  onDelete,
  submitLabel = "Save",
}: EventFormProps) {
  const [values, setValues] = React.useState<EventFormValues>(initial);
  const set = <K extends keyof EventFormValues>(key: K, val: EventFormValues[K]) =>
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
        For things outside the normal routine — vet visits, a training class, a restaurant trip.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Start</Label>
          <Input
            type="datetime-local"
            value={formatDateTimeLocal(values.startTime)}
            onChange={(e) => set("startTime", fromDateTimeLocal(e.target.value))}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>End (optional)</Label>
          <Input
            type="datetime-local"
            value={values.endTime ? formatDateTimeLocal(values.endTime) : ""}
            onChange={(e) => set("endTime", e.target.value ? fromDateTimeLocal(e.target.value) : undefined)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>What kind of event</Label>
        <ChoiceChips
          options={SPECIAL_EVENT_CATEGORY_OPTIONS}
          value={values.category}
          onChange={(v) => set("category", v as EventFormValues["category"])}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Title (optional)</Label>
        <Input
          value={values.title ?? ""}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. 2nd round shots, Puppy class week 3"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Who logged it</Label>
        <ChoiceChips
          options={caregivers.map((c) => ({ value: c.id, label: c.displayName }))}
          value={values.caregiver}
          onChange={(v) => set("caregiver", v as Caregiver)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Notes</Label>
        <Textarea
          value={values.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Optional"
          rows={2}
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
