"use client";

import * as React from "react";
import type { Caregiver, TrainingSession } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ChoiceChips } from "@/components/ui/choice-chips";
import { TRAINING_OUTCOME_OPTIONS } from "@/lib/options";
import { formatDateTimeLocal, fromDateTimeLocal } from "@/lib/time";

export type SessionFormValues = Omit<TrainingSession, "id">;

interface SessionFormProps {
  initial: SessionFormValues;
  caregivers: { id: Caregiver; displayName: string }[];
  onSubmit: (values: SessionFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
  submitLabel?: string;
}

export function SessionForm({
  initial,
  caregivers,
  onSubmit,
  onCancel,
  onDelete,
  submitLabel = "Save session",
}: SessionFormProps) {
  const [values, setValues] = React.useState<SessionFormValues>(initial);
  const set = <K extends keyof SessionFormValues>(key: K, val: SessionFormValues[K]) =>
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
        <Label>What you worked on</Label>
        <Input value={values.skillLabel} onChange={(e) => set("skillLabel", e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Duration (min)</Label>
          <Input
            type="number"
            min={0}
            value={values.durationMinutes}
            onChange={(e) => set("durationMinutes", Number(e.target.value))}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Setting</Label>
          <Input value={values.setting} onChange={(e) => set("setting", e.target.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Reward used</Label>
        <Input value={values.reward} onChange={(e) => set("reward", e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Outcome</Label>
        <ChoiceChips
          options={TRAINING_OUTCOME_OPTIONS}
          value={values.outcome}
          onChange={(v) => set("outcome", v as SessionFormValues["outcome"])}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Who ran it</Label>
        <ChoiceChips
          options={caregivers.map((c) => ({ value: c.id, label: c.displayName }))}
          value={values.caregiver}
          onChange={(v) => set("caregiver", v as Caregiver)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Notes — what worked</Label>
        <Textarea
          value={values.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
          rows={2}
          placeholder="Optional"
        />
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-surface-raised px-3.5 py-3">
        <span className="text-[14px] font-medium">Repeat this next time</span>
        <Switch checked={values.repeatNextTime} onCheckedChange={(v) => set("repeatNextTime", v)} />
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
          Delete session
        </button>
      )}
    </form>
  );
}
