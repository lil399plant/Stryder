"use client";

import { cn } from "@/lib/utils";
import { formatClock } from "@/lib/time";
import type { TimelineItem } from "@/lib/timeline";
import { KIND_STYLES, IconFor, titleFor, subtitleFor } from "./timelineVisual";
import type { Caregiver } from "@/lib/types";

interface TimelineRowProps {
  item: TimelineItem;
  caregiverName: (id: Caregiver) => string;
  onClick?: () => void;
  showConnector?: boolean;
}

export function TimelineRow({ item, caregiverName, onClick, showConnector = true }: TimelineRowProps) {
  const style = KIND_STYLES[item.kind];
  const isAccident = item.kind === "potty" && item.data.type === "accident";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-stretch gap-3 text-left"
    >
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            style.bg,
            style.fg
          )}
        >
          <IconFor item={item} />
        </span>
        {showConnector && <span className="mt-1 w-px flex-1 bg-border" />}
      </div>
      <div className="flex-1 pb-5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[14.5px] font-medium leading-tight">
            {titleFor(item)}
            {isAccident && <span className="ml-1.5 text-[11.5px] font-normal text-muted-foreground">(noted, not a big deal)</span>}
          </p>
          <span className="shrink-0 text-[12px] text-muted-foreground">{formatClock(item.time)}</span>
        </div>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{subtitleFor(item)}</p>
        <p className="mt-1 text-[11.5px] text-muted-foreground/80">{caregiverName(item.data.caregiver)}</p>
        {"notes" in item.data && item.data.notes && (
          <p className="mt-1 rounded-lg bg-background px-2.5 py-1.5 text-[12.5px] text-muted-foreground">
            {item.data.notes}
          </p>
        )}
        {item.kind === "incident" && (
          <p className="mt-1 rounded-lg bg-background px-2.5 py-1.5 text-[12.5px] text-muted-foreground">
            {item.data.note}
          </p>
        )}
      </div>
    </button>
  );
}
