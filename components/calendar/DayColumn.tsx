"use client";

import type { TimelineItem } from "@/lib/timeline";
import type { AppData, Caregiver } from "@/lib/types";
import { getTimelineForDay } from "@/lib/timeline";
import { isDurationItem, endTimeFor, isDayNoteItem } from "@/components/log/timelineVisual";
import { DAY_HEIGHT, HOUR_HEIGHT, minutesSinceMidnight } from "@/lib/calendar-grid";
import { DurationBlock, PointMarker } from "./EventBlock";
import { isSameDay } from "@/lib/time";

const MIN_BLOCK_HEIGHT = 22;
const POINT_ROW_GAP = 20;

interface LaidOutDuration {
  item: TimelineItem;
  top: number;
  height: number;
  lane: number;
  lanes: number;
}

function layoutDurations(items: TimelineItem[], now: Date): LaidOutDuration[] {
  const sorted = [...items].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  const laneEnds: number[] = []; // end-minute of the last item placed in each lane
  const placed: LaidOutDuration[] = [];

  for (const item of sorted) {
    const start = new Date(item.time);
    const top = minutesSinceMidnight(start);
    const rawEnd = endTimeFor(item, now);
    const endMinutes = isSameDay(rawEnd, start) ? minutesSinceMidnight(rawEnd) : 1440;
    const height = Math.max(MIN_BLOCK_HEIGHT, endMinutes - top);

    let lane = laneEnds.findIndex((end) => end <= top);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(top + height);
    } else {
      laneEnds[lane] = top + height;
    }
    placed.push({ item, top, height, lane, lanes: 1 });
  }
  const totalLanes = Math.max(1, laneEnds.length);
  return placed.map((p) => ({ ...p, lanes: totalLanes }));
}

function layoutPoints(items: TimelineItem[]): { item: TimelineItem; top: number }[] {
  const sorted = [...items].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  let lastTop = -Infinity;
  return sorted.map((item) => {
    let top = minutesSinceMidnight(new Date(item.time));
    if (top < lastTop + POINT_ROW_GAP) top = lastTop + POINT_ROW_GAP;
    lastTop = top;
    return { item, top };
  });
}

interface DayColumnProps {
  date: Date;
  data: AppData;
  caregiverName: (id: Caregiver) => string;
  onSelect: (item: TimelineItem) => void;
  now: Date;
  compact?: boolean;
}

export function DayColumn({ date, data, caregiverName, onSelect, now, compact }: DayColumnProps) {
  const items = getTimelineForDay(data, date).filter((i) => !isDayNoteItem(i));
  const durationItems = items.filter(isDurationItem);
  const pointItems = items.filter((i) => !isDurationItem(i));

  const laidDurations = layoutDurations(durationItems, now);
  const laidPoints = layoutPoints(pointItems);

  const durationWidthPct = compact ? 100 : 60;

  return (
    <div className="relative" style={{ height: DAY_HEIGHT }}>
      {Array.from({ length: 24 }, (_, h) => (
        <div key={h} className="absolute inset-x-0 border-t border-border/70" style={{ top: h * HOUR_HEIGHT }} />
      ))}

      {laidDurations.map(({ item, top, height, lane, lanes }) => (
        <DurationBlock
          key={`${item.kind}-${item.data.id}`}
          item={item}
          caregiverName={caregiverName}
          onSelect={onSelect}
          compact={compact}
          style={{
            top,
            height,
            left: `${(lane / lanes) * durationWidthPct}%`,
            width: `${durationWidthPct / lanes - 1}%`,
          }}
        />
      ))}

      {isSameDay(date, now) && (
        <div
          className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-forest"
          style={{ top: minutesSinceMidnight(now) }}
        >
          <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-forest" />
        </div>
      )}

      {laidPoints.map(({ item, top }) => (
        <PointMarker
          key={`${item.kind}-${item.data.id}`}
          item={item}
          caregiverName={caregiverName}
          onSelect={onSelect}
          compact={compact}
          style={{
            top,
            left: compact ? "50%" : `${durationWidthPct + 2}%`,
            transform: compact ? "translateX(-50%)" : undefined,
          }}
        />
      ))}
    </div>
  );
}
