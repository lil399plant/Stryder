"use client";

import type { AppData, Caregiver } from "@/lib/types";
import { getTimelineForDay, type TimelineItem } from "@/lib/timeline";
import { getMonthGrid } from "@/lib/calendar-grid";
import { isToday, isSameDay } from "@/lib/time";
import { cn } from "@/lib/utils";
import { IconFor, titleFor, KIND_STYLES } from "@/components/log/timelineVisual";
import { EventTooltipContent } from "./EventTooltip";
import { usePreview } from "./EventBlock";
import { formatClock } from "@/lib/time";

const MAX_CHIPS = 3;
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function MonthChip({
  item,
  caregiverName,
  onSelect,
}: {
  item: TimelineItem;
  caregiverName: (id: Caregiver) => string;
  onSelect: (item: TimelineItem) => void;
}) {
  const style = KIND_STYLES[item.kind];
  const { previewing, handlers } = usePreview();

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onSelect(item);
      }}
      className={cn(
        "relative flex items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[10px] leading-tight",
        style.bg,
        style.fg
      )}
      {...handlers}
    >
      <IconFor item={item} className="h-2.5 w-2.5 shrink-0" />
      <span className="truncate">
        {formatClock(item.time)} {titleFor(item)}
      </span>
      {previewing && (
        <div className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-1 -translate-x-1/2">
          <EventTooltipContent item={item} caregiverName={caregiverName} />
        </div>
      )}
    </button>
  );
}

export function MonthView({
  anchorDate,
  data,
  caregiverName,
  onSelect,
  onSelectDay,
}: {
  anchorDate: Date;
  data: AppData;
  caregiverName: (id: Caregiver) => string;
  onSelect: (item: TimelineItem) => void;
  onSelectDay: (date: Date) => void;
}) {
  const cells = getMonthGrid(anchorDate);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="py-2 text-center text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((cell) => {
          const items = getTimelineForDay(data, cell.date)
            .slice()
            .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
          const overflow = items.length - MAX_CHIPS;

          return (
            <div
              key={cell.date.toDateString()}
              onClick={() => onSelectDay(cell.date)}
              className={cn(
                "flex min-h-[5.5rem] cursor-pointer flex-col gap-1 border-b border-r border-border/70 p-1.5 last:border-r-0 hover:bg-tan-soft/15 sm:min-h-[6.5rem]",
                !cell.inCurrentMonth && "bg-background/60"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[11.5px]",
                  !cell.inCurrentMonth && "text-muted-foreground/50",
                  isToday(cell.date) && "bg-forest text-forest-foreground font-semibold",
                  isSameDay(cell.date, anchorDate) && !isToday(cell.date) && "ring-1 ring-forest/50"
                )}
              >
                {cell.date.getDate()}
              </span>
              <div className="flex flex-col gap-0.5">
                {items.slice(0, MAX_CHIPS).map((item) => (
                  <MonthChip
                    key={`${item.kind}-${item.data.id}`}
                    item={item}
                    caregiverName={caregiverName}
                    onSelect={onSelect}
                  />
                ))}
                {overflow > 0 && (
                  <span className="px-1 text-[10px] font-medium text-muted-foreground">+{overflow} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
