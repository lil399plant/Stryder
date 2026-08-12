"use client";

import * as React from "react";
import { CalendarClock, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { useSyncedState } from "@/lib/useSyncedState";
import type { ScheduleBlock, SchedulePeriod } from "@/lib/types";

const PERIOD_LABEL: Record<SchedulePeriod, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  overnight: "Overnight",
};

function PlanBlockRow({ block }: { block: ScheduleBlock }) {
  const { updateScheduleBlock } = useStore();
  const [editing, setEditing] = React.useState(false);
  const [text, setText] = useSyncedState(block.text);

  const commit = () => {
    setEditing(false);
    if (text !== block.text) updateScheduleBlock(block.id, text);
  };

  return (
    <div className="flex flex-col gap-1 border-b border-border py-2.5 last:border-0">
      <div className="flex items-center justify-between">
        <p className="text-[12.5px] font-semibold uppercase tracking-wide text-muted-foreground">
          {PERIOD_LABEL[block.period]}
        </p>
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-muted-foreground/60 hover:text-foreground">
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {editing ? (
        <Textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          rows={2}
          className="text-[13.5px]"
        />
      ) : (
        <p className="text-[13.5px] leading-snug">
          {block.text || <span className="text-muted-foreground/60">No plan set — tap the pencil to add one.</span>}
        </p>
      )}
    </div>
  );
}

export function PlanBlocks({ blocks }: { blocks: ScheduleBlock[] }) {
  return (
    <Card className="mb-4">
      <CardHeader className="flex-row items-center gap-2 pb-2">
        <CalendarClock className="h-4 w-4 text-muted-foreground" />
        <CardTitle>Today&apos;s plan</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {blocks.map((b) => (
          <PlanBlockRow key={b.id} block={b} />
        ))}
      </CardContent>
    </Card>
  );
}
