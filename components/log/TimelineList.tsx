"use client";

import { CalendarDays } from "lucide-react";
import type { TimelineItem } from "@/lib/timeline";
import type { Caregiver } from "@/lib/types";
import { TimelineRow } from "./TimelineRow";

interface TimelineListProps {
  items: TimelineItem[];
  caregiverName: (id: Caregiver) => string;
  onSelect: (item: TimelineItem) => void;
  emptyLabel?: string;
}

export function TimelineList({ items, caregiverName, onSelect, emptyLabel }: TimelineListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border-strong px-4 py-10 text-center">
        <CalendarDays className="h-6 w-6 text-muted-foreground/60" />
        <p className="text-[13.5px] text-muted-foreground">
          {emptyLabel ?? "Nothing logged yet for this day."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {items.map((item, idx) => (
        <TimelineRow
          key={`${item.kind}-${item.data.id}`}
          item={item}
          caregiverName={caregiverName}
          onClick={() => onSelect(item)}
          showConnector={idx < items.length - 1}
        />
      ))}
    </div>
  );
}
