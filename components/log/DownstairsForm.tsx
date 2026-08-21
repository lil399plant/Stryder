"use client";

import * as React from "react";
import type { Caregiver, DownstairsEvent, PottyMoment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChoiceChips } from "@/components/ui/choice-chips";
import { OUTDOOR_TRIP_OPTIONS } from "@/lib/options";
import { formatDateTimeLocal, fromDateTimeLocal } from "@/lib/time";
import { PottyMomentFields, makeDefaultPottyMoment } from "./PottyMomentFields";

export type DownstairsFormValues = Omit<DownstairsEvent, "id" | "kind">;

interface DownstairsFormProps {
  initial: DownstairsFormValues;
  caregivers: { id: Caregiver; displayName: string }[];
  onSubmit: (values: DownstairsFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
  submitLabel?: string;
}

export function DownstairsForm({
  initial,
  caregivers,
  onSubmit,
  onCancel,
  onDelete,
  submitLabel = "Save",
}: DownstairsFormProps) {
  const [values, setValues] = React.useState<DownstairsFormValues>(initial);
  const set = <K extends keyof DownstairsFormValues>(key: K, val: DownstairsFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: val }));

  const updateMoment = (index: number, patch: Partial<PottyMoment>) =>
    setValues((v) => ({
      ...v,
      pottyMoments: v.pottyMoments.map((m, i) => (i === index ? { ...m, ...patch } : m)),
    }));
  const removeMoment = (index: number) =>
    setValues((v) => ({ ...v, pottyMoments: v.pottyMoments.filter((_, i) => i !== index) }));
  const addMoment = () =>
    setValues((v) => ({ ...v, pottyMoments: [...v.pottyMoments, makeDefaultPottyMoment(v.startTime)] }));

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
    >
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
        <Label>Type of trip</Label>
        <ChoiceChips
          options={OUTDOOR_TRIP_OPTIONS}
          value={values.outdoorTripType}
          onChange={(v) => set("outdoorTripType", v as DownstairsFormValues["outdoorTripType"])}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Pee / poop this trip</Label>
        <div className="flex flex-col gap-2.5">
          {values.pottyMoments.map((moment, i) => (
            <PottyMomentFields
              key={moment.id}
              moment={moment}
              onChange={(patch) => updateMoment(i, patch)}
              onRemove={() => removeMoment(i)}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={addMoment}
          className="self-start text-[13.5px] font-medium text-forest"
        >
          + Add potty moment
        </button>
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
