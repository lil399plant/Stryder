"use client";

import * as React from "react";
import type { TimelineItem } from "@/lib/timeline";
import type { Caregiver } from "@/lib/types";
import { formatClock } from "@/lib/time";
import { IconFor, titleFor, KIND_STYLES, emojiFor, isEmojiCombo } from "@/components/log/timelineVisual";
import { EventTooltipContent } from "./EventTooltip";
import { cn } from "@/lib/utils";

interface BlockProps {
  item: TimelineItem;
  caregiverName: (id: Caregiver) => string;
  onSelect: (item: TimelineItem) => void;
  style: React.CSSProperties;
  compact?: boolean;
}

/** Preview is driven by React state (mouse hover *and* keyboard focus), not
 * bare CSS `:hover` — that also covers touch devices' focus-on-tap and is
 * easy to reason about/test, rather than relying on the browser to paint a
 * pseudo-class change. */
export function usePreview() {
  const [previewing, setPreviewing] = React.useState(false);
  return {
    previewing,
    handlers: {
      onMouseEnter: () => setPreviewing(true),
      onMouseLeave: () => setPreviewing(false),
      onFocus: () => setPreviewing(true),
      onBlur: () => setPreviewing(false),
    },
  };
}

/** A nap, downstairs trip, or special event — spans a time range. */
export function DurationBlock({ item, caregiverName, onSelect, style, compact }: BlockProps) {
  const kindStyle = KIND_STYLES[item.kind];
  const isOngoing =
    (item.kind === "nap" || item.kind === "downstairs" || item.kind === "event") && !item.data.endTime;
  const { previewing, handlers } = usePreview();

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      style={style}
      className={cn(
        "absolute overflow-hidden rounded-lg border px-1.5 py-1 text-left transition-shadow hover:shadow-md",
        kindStyle.bg,
        kindStyle.fg,
        isOngoing ? "border-dashed border-current/50" : "border-transparent"
      )}
      {...handlers}
    >
      <div className="flex items-center gap-1">
        <IconFor item={item} className="h-3 w-3 shrink-0" />
        {!compact && <span className="truncate text-[11px] font-medium leading-none">{titleFor(item)}</span>}
      </div>
      {!compact && (
        <span className="mt-0.5 block truncate text-[10px] opacity-80">
          {formatClock(item.time)}
          {isOngoing
            ? " – now"
            : (item.kind === "nap" || item.kind === "downstairs" || item.kind === "event") && item.data.endTime
              ? `–${formatClock(item.data.endTime)}`
              : ""}
        </span>
      )}
      {previewing && (
        <div className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-1.5 -translate-x-1/2">
          <EventTooltipContent item={item} caregiverName={caregiverName} />
        </div>
      )}
    </button>
  );
}

/** A pee / poop / meal / note / training session — a single point in time. */
export function PointMarker({ item, caregiverName, onSelect, style, compact }: BlockProps) {
  const kindStyle = KIND_STYLES[item.kind];
  const emoji = emojiFor(item);
  const { previewing, handlers } = usePreview();

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      style={style}
      className="absolute flex items-center gap-1"
      {...handlers}
    >
      {emoji ? (
        <span
          className={cn(
            "flex h-3.5 w-3.5 shrink-0 items-center justify-center leading-none",
            isEmojiCombo(emoji) ? "text-[8px]" : "text-[12px]"
          )}
        >
          {emoji}
        </span>
      ) : (
        <span
          className={cn(
            "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ring-2 ring-surface",
            kindStyle.dot
          )}
        />
      )}
      {!compact && (
        <span className="truncate rounded-full bg-surface-raised px-1.5 py-0.5 text-[10px] font-medium leading-none text-foreground shadow-sm">
          {titleFor(item)}
        </span>
      )}
      {previewing && (
        <div className="pointer-events-none absolute bottom-full right-0 z-40 mb-1.5">
          <EventTooltipContent item={item} caregiverName={caregiverName} />
        </div>
      )}
    </button>
  );
}
