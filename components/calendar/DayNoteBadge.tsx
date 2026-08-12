"use client";

import { StickyNote } from "lucide-react";
import type { TimelineItem } from "@/lib/timeline";
import { dayNoteTextFor } from "@/components/log/timelineVisual";
import { cn } from "@/lib/utils";

// A note attached to a day — "new behavior observed", "chewing", and
// treat meals are deliberately kept off the calendar's dot/chip system
// (see isDayNoteItem in components/log/timelineVisual.tsx) and shown here
// instead. Clicking opens the first one for editing, the same
// EntryEditSheet used everywhere else in the app.

export function DayNoteBadge({
  items,
  onSelect,
  className,
}: {
  items: TimelineItem[];
  onSelect: (item: TimelineItem) => void;
  className?: string;
}) {
  if (items.length === 0) return null;
  const first = items[0];
  const text = dayNoteTextFor(first);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onSelect(first);
      }}
      className={cn(
        "flex w-full items-start gap-1 rounded-lg bg-tan-soft/60 px-1.5 py-1 text-left text-[10px] leading-tight text-tan-soft-foreground hover:bg-tan-soft/80",
        className
      )}
    >
      <StickyNote className="mt-[1px] h-2.5 w-2.5 shrink-0" />
      <span className="truncate">
        {text}
        {items.length > 1 && ` +${items.length - 1}`}
      </span>
    </button>
  );
}
