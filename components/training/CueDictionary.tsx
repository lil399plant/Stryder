"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiChoiceChips } from "@/components/ui/choice-chips";
import { useStore } from "@/lib/store";
import { useSyncedState } from "@/lib/useSyncedState";
import type { CueEntry } from "@/lib/types";

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
