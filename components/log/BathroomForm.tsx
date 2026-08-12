"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Caregiver, PottyEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChoiceChips, MultiChoiceChips } from "@/components/ui/choice-chips";
import {
  POTTY_TYPE_OPTIONS,
  POTTY_LOCATION_OPTIONS,
  OUTDOOR_TRIP_OPTIONS,
  SUCCESS_OPTIONS,
  POOP_QUALITY_OPTIONS,
  POTTY_TAG_OPTIONS,
} from "@/lib/options";
import { formatDateTimeLocal, fromDateTimeLocal } from "@/lib/time";

export type BathroomFormValues = Omit<PottyEvent, "id" | "kind">;

interface BathroomFormProps {
  initial: BathroomFormValues;
  caregivers: { id: Caregiver; displayName: string }[];
  onSubmit: (values: BathroomFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
  submitLabel?: string;
  startExpanded?: boolean;
}

export function BathroomForm({
  initial,
  caregivers,
  onSubmit,
  onCancel,
  onDelete,
  submitLabel = "Save",
  startExpanded = false,
}: BathroomFormProps) {
  const [values, setValues] = React.useState<BathroomFormValues>(initial);
  const [expanded, setExpanded] = React.useState(startExpanded);

  const set = <K extends keyof BathroomFormValues>(key: K, val: BathroomFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: val }));

  const isAccident = values.type === "accident";
  const showPoopQuality = values.type === "poop" || values.type === "both";

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
    >
      <div className="flex flex-col gap-1.5">
        <Label>When</Label>
        <Input
          type="datetime-local"
          value={formatDateTimeLocal(values.timestamp)}
          onChange={(e) => set("timestamp", fromDateTimeLocal(e.target.value))}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Type</Label>
        <ChoiceChips
          options={POTTY_TYPE_OPTIONS}
          value={values.type}
          onChange={(v) =>
            setValues((prev) => ({
              ...prev,
              type: v as BathroomFormValues["type"],
              // Accident and success are two views of the same thing —
              // keep them in sync so the data stays coherent either way.
              success: v === "accident" ? "accident" : prev.success === "accident" ? "went-promptly" : prev.success,
            }))
          }
        />
      </div>

      {isAccident ? (
        <>
          <div className="flex flex-col gap-1.5">
            <Label>Where</Label>
            <Input
              value={values.accidentWhere ?? ""}
              onChange={(e) => set("accidentWhere", e.target.value)}
              placeholder="e.g. By the front door, on the rug"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>For what reason</Label>
            <Input
              value={values.accidentReason ?? ""}
              onChange={(e) => set("accidentReason", e.target.value)}
              placeholder="e.g. Excitement, missed the signal"
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            <Label>Location</Label>
            <ChoiceChips
              options={POTTY_LOCATION_OPTIONS}
              value={values.location}
              onChange={(v) => set("location", v as BathroomFormValues["location"])}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>How it went</Label>
            <ChoiceChips
              options={SUCCESS_OPTIONS}
              value={values.success}
              onChange={(v) => set("success", v as BathroomFormValues["success"])}
            />
          </div>
        </>
      )}

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
        {expanded ? "Hide details" : isAccident ? "Add notes" : "Add trip type, quality, tags, notes"}
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {expanded && (
        <div className="flex flex-col gap-5 rounded-2xl bg-background/60 p-3.5">
          {!isAccident && (
            <div className="flex flex-col gap-1.5">
              <Label>Outdoor trip type</Label>
              <ChoiceChips
                options={OUTDOOR_TRIP_OPTIONS}
                value={values.outdoorTripType}
                onChange={(v) => set("outdoorTripType", v as BathroomFormValues["outdoorTripType"])}
              />
            </div>
          )}

          {showPoopQuality && (
            <div className="flex flex-col gap-1.5">
              <Label>Poop quality</Label>
              <ChoiceChips
                options={POOP_QUALITY_OPTIONS}
                value={values.poopQuality ?? "unknown"}
                onChange={(v) => set("poopQuality", v as BathroomFormValues["poopQuality"])}
              />
            </div>
          )}

          {!isAccident && (
            <div className="flex flex-col gap-1.5">
              <Label>Possible triggers</Label>
              <MultiChoiceChips
                options={POTTY_TAG_OPTIONS}
                values={values.tags}
                onChange={(v) => set("tags", v as BathroomFormValues["tags"])}
              />
            </div>
          )}

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
