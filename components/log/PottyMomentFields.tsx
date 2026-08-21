"use client";

import { X } from "lucide-react";
import type { PottyMoment } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { ChoiceChips } from "@/components/ui/choice-chips";
import { POTTY_MOMENT_TYPE_OPTIONS, POTTY_MOMENT_SUCCESS_OPTIONS, POOP_QUALITY_OPTIONS } from "@/lib/options";
import { makeId } from "@/lib/id";

/** Default moment a downstairs trip's potty-moment list starts with, and
 * what "+ Add another" appends — sensible defaults the caregiver overrides
 * rather than blank/unset fields. */
export function makeDefaultPottyMoment(): PottyMoment {
  return { id: makeId(), type: "pee", success: "went-promptly" };
}

interface PottyMomentFieldsProps {
  moment: PottyMoment;
  onChange: (patch: Partial<PottyMoment>) => void;
  onRemove: () => void;
}

export function PottyMomentFields({ moment, onChange, onRemove }: PottyMomentFieldsProps) {
  const showPoopQuality = moment.type === "poop" || moment.type === "both";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background/60 p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1.5">
          <Label>Type</Label>
          <ChoiceChips
            options={POTTY_MOMENT_TYPE_OPTIONS}
            value={moment.type}
            onChange={(v) => onChange({ type: v as PottyMoment["type"] })}
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove potty moment"
          className="mt-1 shrink-0 rounded-full p-1 text-muted-foreground hover:bg-surface-raised"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>How it went</Label>
        <ChoiceChips
          options={POTTY_MOMENT_SUCCESS_OPTIONS}
          value={moment.success}
          onChange={(v) => onChange({ success: v as PottyMoment["success"] })}
        />
      </div>

      {showPoopQuality && (
        <div className="flex flex-col gap-1.5">
          <Label>Poop quality</Label>
          <ChoiceChips
            options={POOP_QUALITY_OPTIONS}
            value={moment.poopQuality ?? "unknown"}
            onChange={(v) => onChange({ poopQuality: v as PottyMoment["poopQuality"] })}
          />
        </div>
      )}
    </div>
  );
}
