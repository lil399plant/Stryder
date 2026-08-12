"use client";

import * as React from "react";
import type { AppData, Caregiver } from "@/lib/types";
import { getTimelineForDay, type TimelineItem } from "@/lib/timeline";
import { isDayNoteItem } from "@/components/log/timelineVisual";
import { HourLabels } from "./HourLabels";
import { DayColumn } from "./DayColumn";
import { DayNoteBadge } from "./DayNoteBadge";
import { getWeekDays, HOUR_HEIGHT } from "@/lib/calendar-grid";
import { isSameDay, isToday } from "@/lib/time";
import { cn } from "@/lib/utils";

export function WeekView({
  anchorDate,
  data,
  caregiverName,
  onSelect,
  now,
  onSelectDay,
}: {
  anchorDate: Date;
  data: AppData;
  caregiverName: (id: Caregiver) => string;
  onSelect: (item: TimelineItem) => void;
  now: Date;
  onSelectDay: (date: Date) => void;
}) {
  const days = getWeekDays(anchorDate);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: 6 * HOUR_HEIGHT });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorDate.toDateString()]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex border-b border-border pl-12 sm:pl-14">
        {days.map((d) => {
          const dayNotes = getTimelineForDay(data, d).filter(isDayNoteItem);
          return (
            <div key={d.toDateString()} className="flex flex-1 flex-col items-center gap-0.5 px-0.5 py-2">
              <button
                onClick={() => onSelectDay(d)}
                className="flex flex-col items-center gap-0.5 rounded hover:bg-tan-soft/20"
              >
                <span className="text-[10.5px] uppercase tracking-wide text-muted-foreground">
                  {d.toLocaleDateString(undefined, { weekday: "short" })}
                </span>
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[13px] font-medium",
                    isToday(d) && "bg-forest text-forest-foreground"
                  )}
                >
                  {d.getDate()}
                </span>
              </button>
              {dayNotes.length > 0 && <DayNoteBadge items={dayNotes} onSelect={onSelect} className="mt-0.5" />}
            </div>
          );
        })}
      </div>
      <div ref={scrollRef} className="max-h-[60vh] overflow-y-auto">
        <div className="flex px-1 py-2">
          <HourLabels />
          <div className="flex flex-1">
            {days.map((d) => (
              <div
                key={d.toDateString()}
                className={cn("flex-1 border-l border-border/60 px-0.5", isSameDay(d, now) && "bg-forest-soft/10")}
              >
                <DayColumn date={d} data={data} caregiverName={caregiverName} onSelect={onSelect} now={now} compact />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
