"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiChoiceChips } from "@/components/ui/choice-chips";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useSyncedState } from "@/lib/useSyncedState";
import type { CueEntry } from "@/lib/types";

const PROGRESS_LEVELS = [1, 2, 3, 4, 5] as const;

function ProgressScale({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (level: 1 | 2 | 3 | 4 | 5) => void;
}) {
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Progress, 1 to 5">
      {PROGRESS_LEVELS.map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => onChange(level)}
          aria-label={`Set progress to ${level}`}
          aria-pressed={value === level}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[13px] font-medium transition-colors active:scale-[0.98]",
            value !== undefined && level <= value
              ? "border-forest bg-forest-soft text-forest-soft-foreground"
              : "border-border-strong bg-surface-raised text-muted-foreground hover:bg-tan-soft/30"
          )}
        >
          {level}
        </button>
      ))}
    </div>
  );
}

function CueRow({ cue }: { cue: CueEntry }) {
  const { updateCue, deleteCue, data } = useStore();
  const [local, setLocal] = useSyncedState(cue);

  return (
    <Card>
      <CardContent className="flex flex-col gap-2.5 p-3.5">
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={local.cue}
            onChange={(e) => setLocal((v) => ({ ...v, cue: e.target.value }))}
            onBlur={() => local.cue !== cue.cue && updateCue(cue.id, { cue: local.cue })}
            placeholder="Cue"
            className="font-medium"
          />
          <Input
            value={local.meaning}
            onChange={(e) => setLocal((v) => ({ ...v, meaning: e.target.value }))}
            onBlur={() => local.meaning !== cue.meaning && updateCue(cue.id, { meaning: local.meaning })}
            placeholder="Meaning"
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <MultiChoiceChips
            options={(data?.caregivers ?? []).map((c) => ({ value: c.id, label: c.displayName }))}
            values={cue.usedBy}
            onChange={(v) => updateCue(cue.id, { usedBy: v as CueEntry["usedBy"] })}
          />
          <button
            onClick={() => deleteCue(cue.id)}
            aria-label="Delete cue"
            className="shrink-0 rounded-full p-2 text-muted-foreground/60 hover:bg-concern-soft hover:text-concern"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border pt-2.5">
          <span className="text-[13px] font-medium text-muted-foreground">Progress</span>
          <ProgressScale value={cue.progress} onChange={(level) => updateCue(cue.id, { progress: level })} />
        </div>
      </CardContent>
    </Card>
  );
}

export function CueDictionary() {
  const { data, addCue } = useStore();
  if (!data) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[13px] leading-snug text-muted-foreground">
        The shared vocabulary both caregivers use with Stryder — keeping cues consistent helps him
        learn faster.
      </p>
      {data.cues.map((cue) => (
        <CueRow key={cue.id} cue={cue} />
      ))}
      <Button
        variant="outline"
        className="gap-1.5"
        onClick={() => addCue({ cue: "New cue", meaning: "What it means", usedBy: [] })}
      >
        <Plus className="h-4 w-4" />
        Add cue
      </Button>
    </div>
  );
}
