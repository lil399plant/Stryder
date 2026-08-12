"use client";

import * as React from "react";
import { Bell, RotateCcw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { DEFAULT_NUDGE_THRESHOLDS } from "@/lib/rules";
import type { NudgeThresholds } from "@/lib/types";

// The Today page's "what might be next" nudges are purely rules-based on
// elapsed time (see lib/rules.ts computeNudges) — these three fields are
// the exact thresholds those rules read, so a caregiver can loosen or
// tighten them without touching code.

const FIELDS: { key: keyof NudgeThresholds; label: string; help: string; min: number; max: number }[] = [
  {
    key: "pottyGapHours",
    label: "Time awake since last potty trip",
    help: "Flags on Today once this many hours awake (nap time doesn't count) have passed since any logged pee or poop. Automatically 0 — no flag — while he's currently napping.",
    min: 0.5,
    max: 12,
  },
  {
    key: "awakeStretchHours",
    label: "Time awake since last nap",
    help: "Flags once this many hours have passed since the last nap ended, while awake.",
    min: 0.5,
    max: 12,
  },
  {
    key: "mealGapHours",
    label: "Time since last meal",
    help: "Flags during daytime hours (7am–8pm) once this many hours have passed since the last logged meal.",
    min: 0.5,
    max: 24,
  },
];

export function NudgeRulesSection() {
  const { data, updateNudgeThresholds } = useStore();
  const [drafts, setDrafts] = React.useState<Record<string, string>>({});

  if (!data) return null;
  const thresholds = data.settings.nudgeThresholds;

  const commit = (key: keyof NudgeThresholds, raw: string, min: number, max: number) => {
    const parsed = parseFloat(raw);
    const clamped = Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : thresholds[key];
    updateNudgeThresholds({ [key]: clamped });
    // Clear the draft rather than pinning it — once committed, the field
    // should read from the live store value again (matters if the other
    // caregiver's edit syncs in later).
    setDrafts((d) => {
      const next = { ...d };
      delete next[key];
      return next;
    });
  };

  const resetAll = () => updateNudgeThresholds({ ...DEFAULT_NUDGE_THRESHOLDS });

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 pb-2">
        <Bell className="h-4 w-4 text-muted-foreground" />
        <CardTitle>Flagging rules</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-0">
        <CardDescription>
          Gentle nudges, not alerts — Today shows at most two at a time, and any of them can be dismissed
          for the day. Adjust how long is &ldquo;too long&rdquo; for each.
        </CardDescription>

        {FIELDS.map((f) => (
          <div key={f.key} className="flex flex-col gap-1.5">
            <Label htmlFor={f.key}>{f.label}</Label>
            <div className="flex items-center gap-2">
              <Input
                id={f.key}
                type="number"
                inputMode="decimal"
                step={0.5}
                min={f.min}
                max={f.max}
                value={drafts[f.key] ?? String(thresholds[f.key])}
                onChange={(e) => setDrafts((d) => ({ ...d, [f.key]: e.target.value }))}
                onBlur={(e) => commit(f.key, e.target.value, f.min, f.max)}
                className="w-24"
              />
              <span className="text-[13px] text-muted-foreground">hours</span>
            </div>
            <p className="text-[11.5px] text-muted-foreground">{f.help}</p>
          </div>
        ))}

        <Button variant="ghost" className="w-fit gap-1.5 text-muted-foreground" onClick={resetAll}>
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to defaults
        </Button>
      </CardContent>
    </Card>
  );
}
