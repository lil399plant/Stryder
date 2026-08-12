"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Caregiver, NapEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChoiceChips } from "@/components/ui/choice-chips";
import { NAP_LOCATION_OPTIONS, SETTLING_OPTIONS, NAP_QUALITY_OPTIONS } from "@/lib/options";
import { formatDateTimeLocal, fromDateTimeLocal } from "@/lib/time";

export type NapFormValues = Omit<NapEvent, "id" | "kind">;

interface NapFormProps {
  initial: NapFormValues;
  caregivers: { id: Caregiver; displayName: string }[];
  onSubmit: (values: NapFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
  submitLabel?: string;
  startExpanded?: boolean;
}

export function NapForm({
  initial,
  caregivers,
  onSubmit,
  onCancel,
  onDelete,
  submitLabel = "Save",
  startExpanded = false,
}: NapFormProps) {
  const [values, setValues] = React.useState<NapFormValues>(initial);
  const [expanded, setExpanded] = React.useState(startExpanded);

  const set = <K extends keyof NapFormValues>(key: K, val: NapFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: val }));

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
        <Label>Location</Label>
        <ChoiceChips
          options={NAP_LOCATION_OPTIONS}
          value={values.location}
          onChange={(v) => set("location", v as NapFormValues["location"])}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Settling</Label>
        <ChoiceChips
          options={SETTLING_OPTIONS}
          value={values.settling}
          onChange={(v) => set("settling", v as NapFormValues["settling"])}
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

      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-1 self-start text-[13.5px] font-medium text-forest"
      >
        {expanded ? "Hide details" : "Add quality, notes"}
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {expanded && (
        <div className="flex flex-col gap-5 rounded-2xl bg-background/60 p-3.5">
          <div className="flex flex-col gap-1.5">
            <Label>Quality</Label>
            <ChoiceChips
              options={NAP_QUALITY_OPTIONS}
              value={values.quality ?? "normal"}
              onChange={(v) => set("quality", v as NapFormValues["quality"])}
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
        </div>
      )}

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
