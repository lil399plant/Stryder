import type { TimelineItem } from "@/lib/timeline";
import type { Caregiver } from "@/lib/types";
import { IconFor, titleFor, subtitleFor, KIND_STYLES } from "@/components/log/timelineVisual";
import { cn } from "@/lib/utils";

/** Compact hover preview of an event — shown via CSS `group-hover`, no JS
 * position tracking needed since it's anchored to its own event block. */
export function EventTooltipContent({
  item,
  caregiverName,
}: {
  item: TimelineItem;
  caregiverName: (id: Caregiver) => string;
}) {
  const style = KIND_STYLES[item.kind];
  const note = item.kind === "incident" ? item.data.note : "notes" in item.data ? item.data.notes : undefined;

  return (
    <div className="w-48 max-w-[80vw] rounded-xl border border-border-strong bg-surface-raised p-3 text-left shadow-lg">
      <div className="flex items-center gap-2">
        <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full", style.bg, style.fg)}>
          <IconFor item={item} className="h-3.5 w-3.5" />
        </span>
        <p className="text-[13px] font-semibold leading-tight">{titleFor(item)}</p>
      </div>
      <p className="mt-1.5 text-[12px] text-muted-foreground">{subtitleFor(item)}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground/80">{caregiverName(item.data.caregiver)}</p>
      {note && <p className="mt-1.5 text-[11.5px] leading-snug text-muted-foreground">{note}</p>}
    </div>
  );
}
