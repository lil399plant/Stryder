"use client";

import * as React from "react";
import type { AppData, Caregiver } from "@/lib/types";
import { getTimelineForDay, type TimelineItem } from "@/lib/timeline";
import { isDayNoteItem } from "@/components/log/timelineVisual";
import { HourLabels } from "./HourLabels";
import { DayColumn } from "./DayColumn";
import { DayNoteBadge } from "./DayNoteBadge";
import { HOUR_HEIGHT } from "@/lib/calendar-grid";

export function DayView({
  date,
  data,
  caregiverName,
  onSelect,
  now,
}: {
  date: Date;
  data: AppData;
  caregiverName: (id: Caregiver) => string;
  onSelect: (item: TimelineItem) => void;
  now: Date;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const dayNotes = getTimelineForDay(data, date).filter(isDayNoteItem);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: 6 * HOUR_HEIGHT });
    // Scroll to a sensible default (6am) whenever the viewed date changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date.toDateString()]);

  return (
    <div ref={scrollRef} className="max-h-[65vh] overflow-y-auto rounded-2xl border border-border bg-surface">
      {dayNotes.length > 0 && (
        <div className="border-b border-border px-3 py-2">
          <DayNoteBadge items={dayNotes} onSelect={onSelect} className="w-auto" />
        </div>
      )}
      <div className="flex px-2 py-3">
        <HourLabels />
        <div className="flex-1 pl-2">
          <DayColumn date={date} data={data} caregiverName={caregiverName} onSelect={onSelect} now={now} />
        </div>
      </div>
    </div>
  );
}
