"use client";

import { X } from "lucide-react";
import type { TrainingStage } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface StageEditorProps {
  stage: TrainingStage;
  onChange: (patch: Partial<TrainingStage>) => void;
  onRemove: () => void;
  onDone: () => void;
}

/** Inline editor for one training stage — swapped in for the normal
 * tap-to-select row (see PlanDetail) while that stage is being edited. */
export function StageEditor({ stage, onChange, onRemove, onDone }: StageEditorProps) {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-background/60 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label>Step title</Label>
          <Input
            value={stage.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="e.g. Same door, same route to the usual spot"
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove step"
          className="mt-6 shrink-0 rounded-full p-1 text-muted-foreground hover:bg-surface-raised"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Description (optional)</Label>
        <Textarea
          value={stage.description ?? ""}
          onChange={(e) => onChange({ description: e.target.value || undefined })}
          rows={2}
          placeholder="Optional extra detail"
        />
      </div>
      <Button type="button" size="sm" variant="secondary" onClick={onDone} className="self-end">
        Done
      </Button>
    </div>
  );
}
