"use client";

import type { TimelineItem } from "@/lib/timeline";
import type { Caregiver } from "@/lib/types";
import { formatDateHeader, isSameDay } from "@/lib/time";
import { TimelineList } from "./TimelineList";
import { CalendarDays } from "lucide-react";

interface GroupedTimelineProps {
  items: TimelineItem[];
  caregiverName: (id: Caregiver) => string;
  onSelect: (item: TimelineItem) => void;
  emptyLabel: string;
}

export function GroupedTimeline({ items, caregiverName, onSelect, emptyLabel }: GroupedTimelineProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border-strong px-4 py-10 text-center">
        <CalendarDays className="h-6 w-6 text-muted-foreground/60" />
        <p className="text-[13.5px] text-muted-foreground">{emptyLabel}</p>
      </div>
    );
  }

  const groups: { date: Date; items: TimelineItem[] }[] = [];
  for (const item of items) {
    const d = new Date(item.time);
    const group = groups.find((g) => isSameDay(g.date, d));
    if (group) group.items.push(item);
    else groups.push({ date: d, items: [item] });
  }

  return (
    <div className="flex flex-col gap-5">
      {groups.map((g) => (
        <div key={g.date.toDateString()}>
          <p className="mb-2 text-[12.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            {formatDateHeader(g.date)}
          </p>
          <TimelineList items={g.items} caregiverName={caregiverName} onSelect={onSelect} />
        </div>
      ))}
    </div>
  );
}
