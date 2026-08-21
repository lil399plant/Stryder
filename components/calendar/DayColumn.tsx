"use client";

import type { TimelineItem } from "@/lib/timeline";
import type { AppData, Caregiver } from "@/lib/types";
import { getTimelineForDay, getPottyMomentItemsForDay } from "@/lib/timeline";
import { isDurationItem, endTimeFor, isDayNoteItem } from "@/components/log/timelineVisual";
import { DAY_HEIGHT, HOUR_HEIGHT, minutesSinceMidnight } from "@/lib/calendar-grid";
import { DurationBlock, PointMarker } from "./EventBlock";
import { isSameDay } from "@/lib/time";

const MIN_BLOCK_HEIGHT = 22;
const POINT_ROW_GAP = 20;
// Point markers (pee, poop, meals, notes...) always render above duration
// blocks, however many of the latter are stacked — see layoutDurations.
const POINT_Z_INDEX = 100;

interface LaidOutDuration {
  item: TimelineItem;
  top: number;
  height: number;
  zIndex: number;
}

/** Everything renders in one single full-width column now — no side-by-side
 * lanes. When two duration events (naps, downstairs trips, events) overlap
 * in time, the one that started earlier stacks visually on top (higher
 * z-index) rather than being squeezed into its own narrower lane. */
function layoutDurations(items: TimelineItem[], now: Date): LaidOutDuration[] {
  const sorted = [...items].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  return sorted.map((item, i) => {
    const start = new Date(item.time);
    const top = minutesSinceMidnight(start);
    const rawEnd = endTimeFor(item, now);
    const endMinutes = isSameDay(rawEnd, start) ? minutesSinceMidnight(rawEnd) : 1440;
    const height = Math.max(MIN_BLOCK_HEIGHT, endMinutes - top);
    // Earlier items were placed first, so a higher index means a later
    // start — give earlier starts the higher z-index.
    return { item, top, height, zIndex: sorted.length - i };
  });
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
  // Each trip-embedded potty moment also gets its own point marker here,
  // at its own timestamp — same visual as a standalone pee/poop entry —
  // alongside the trip's own duration bar, which still spans the whole
  // walk. Today's vertical list intentionally doesn't do this (see
  // getPottyMomentItemsForDay) — the trip's row there already summarizes
  // them, so adding separate rows would just duplicate it.
  const pointItems = [...items.filter((i) => !isDurationItem(i)), ...getPottyMomentItemsForDay(data, date)];

  const laidDurations = layoutDurations(durationItems, now);
  const laidPoints = layoutPoints(pointItems);

  return (
    <div className="relative" style={{ height: DAY_HEIGHT }}>
      {Array.from({ length: 24 }, (_, h) => (
        <div key={h} className="absolute inset-x-0 border-t border-border/70" style={{ top: h * HOUR_HEIGHT }} />
      ))}

      {laidDurations.map(({ item, top, height, zIndex }) => (
        <DurationBlock
          key={`${item.kind}-${item.data.id}`}
          item={item}
          caregiverName={caregiverName}
          onSelect={onSelect}
          compact={compact}
          style={{ top, height, left: 0, right: 0, zIndex }}
        />
      ))}

      {isSameDay(date, now) && (
        <div
          className="pointer-events-none absolute inset-x-0 z-40 border-t-2 border-forest"
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
          style={{ top, left: "50%", transform: "translateX(-50%)", zIndex: POINT_Z_INDEX }}
        />
      ))}
    </div>
  );
}
