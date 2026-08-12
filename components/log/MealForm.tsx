"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Caregiver, MealEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ChoiceChips, MultiChoiceChips } from "@/components/ui/choice-chips";
import { MEAL_TYPE_OPTIONS, APPETITE_OPTIONS, ADD_ON_OPTIONS } from "@/lib/options";
import { formatDateTimeLocal, fromDateTimeLocal } from "@/lib/time";

export type MealFormValues = Omit<MealEvent, "id" | "kind">;

interface MealFormProps {
  initial: MealFormValues;
  caregivers: { id: Caregiver; displayName: string }[];
  onSubmit: (values: MealFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
  submitLabel?: string;
  startExpanded?: boolean;
}

export function MealForm({
  initial,
  caregivers,
  onSubmit,
  onCancel,
  onDelete,
  submitLabel = "Save",
  startExpanded = false,
}: MealFormProps) {
  const [values, setValues] = React.useState<MealFormValues>(initial);
  const [expanded, setExpanded] = React.useState(startExpanded);

  const set = <K extends keyof MealFormValues>(key: K, val: MealFormValues[K]) =>
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
        <Label>When</Label>
        <Input
          type="datetime-local"
          value={formatDateTimeLocal(values.timestamp)}
          onChange={(e) => set("timestamp", fromDateTimeLocal(e.target.value))}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Meal type</Label>
        <ChoiceChips
          options={MEAL_TYPE_OPTIONS}
          value={values.mealType}
          onChange={(v) => set("mealType", v as MealFormValues["mealType"])}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Food</Label>
          <Input value={values.foodName} onChange={(e) => set("foodName", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Amount</Label>
          <Input value={values.amount} onChange={(e) => set("amount", e.target.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Appetite</Label>
        <ChoiceChips
          options={APPETITE_OPTIONS}
          value={values.appetite}
          onChange={(v) => set("appetite", v as MealFormValues["appetite"])}
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
        {expanded ? "Hide details" : "Add add-ons, flags, notes"}
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {expanded && (
        <div className="flex flex-col gap-5 rounded-2xl bg-background/60 p-3.5">
          <div className="flex flex-col gap-1.5">
            <Label>Add-ons</Label>
            <MultiChoiceChips
              options={ADD_ON_OPTIONS}
              values={values.addOns}
              onChange={(v) => set("addOns", v as MealFormValues["addOns"])}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-surface-raised px-3.5 py-3">
            <span className="text-[14px] font-medium">New food</span>
            <Switch checked={values.newFood} onCheckedChange={(v) => set("newFood", v)} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface-raised px-3.5 py-3">
            <span className="text-[14px] font-medium">Part used for crate training</span>
            <Switch
              checked={values.usedForCrateTraining}
              onCheckedChange={(v) => set("usedForCrateTraining", v)}
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface-raised px-3.5 py-3">
            <span className="text-[14px] font-medium">Used as high-value potty reward</span>
            <Switch
              checked={values.usedAsPottyReward}
              onCheckedChange={(v) => set("usedAsPottyReward", v)}
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
